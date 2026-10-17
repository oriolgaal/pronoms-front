import {
  CheckAnswerResponse,
  DifficultyLevel,
  HintResponse,
  NextSentenceData,
  NextSentenceResponse,
  RevealResponse,
} from '../types';

// Bump whenever the shape of GameState changes. Version 1 saves are migrated
// on load (see migrateV1); anything else that does not match is discarded.
export const GAME_STATE_VERSION = 2;
export const GAME_STATE_STORAGE_KEY = 'gameState';
// Keys written by previous versions of the app; removed on load.
const LEGACY_STORAGE_KEYS = ['gameDate', 'gameSessionId'];

/**
 * - answering: the player is typing (feedback holds the last wrong check, if any)
 * - correct:   the current sentence was solved and there is a next sentence
 * - revealed:  the player asked for the solution (reveal holds it)
 * - complete:  every sentence is finished (solved or revealed)
 */
export type GamePhase = 'answering' | 'correct' | 'revealed' | 'complete';

/** How each sentence ended: solved by the player, revealed, or not finished yet. */
export type SentenceOutcome = 'solved' | 'revealed' | null;

export interface HintsState {
  shown: string[];    // Hint texts already revealed for the current sentence
  nextNumber: number; // Next hint number to request (0-based)
  total: number;      // Total hints for the current sentence (0 = unknown yet)
}

/**
 * The whole game state. It is serializable and persisted as a single object,
 * so a reload restores exactly what the player was seeing.
 */
export interface GameState {
  version: typeof GAME_STATE_VERSION;
  date: string;                     // UTC day (YYYY-MM-DD) the game belongs to
  gameSessionId: string;
  totalSentences: number;
  sentenceId: number;               // Current sentence (1-based)
  fullSentence: string;
  difficulty: DifficultyLevel;
  phase: GamePhase;
  userInput: string;
  attempts: number[];               // Attempts per sentence, index = sentenceId - 1
  outcomes: SentenceOutcome[];      // Outcome per sentence, index = sentenceId - 1
  feedback: CheckAnswerResponse | null; // Last check response for the current sentence
  reveal: RevealResponse | null;    // Revealed solution for the current sentence
  nextSentence: NextSentenceData | null;
  hints: HintsState;
}

export type GameAction =
  | { type: 'GAME_STARTED'; data: NextSentenceResponse; date: string }
  | { type: 'INPUT_CHANGED'; value: string }
  | { type: 'CHECK_SUCCEEDED'; sentenceId: number; attempts: number; response: CheckAnswerResponse }
  | { type: 'REVEAL_SUCCEEDED'; sentenceId: number; response: RevealResponse }
  | { type: 'RETRY' }
  | { type: 'NEXT_SENTENCE' }
  | { type: 'SHOW_SUMMARY' }
  | { type: 'HINT_RECEIVED'; sentenceId: number; response: HintResponse };

const EMPTY_HINTS: HintsState = { shown: [], nextNumber: 0, total: 0 };

/** UTC day used to decide whether a saved game belongs to today. */
export function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function withOutcome(state: GameState, outcome: SentenceOutcome): SentenceOutcome[] {
  const outcomes = [...state.outcomes];
  outcomes[state.sentenceId - 1] = outcome;
  return outcomes;
}

export function gameReducer(state: GameState | null, action: GameAction): GameState | null {
  if (action.type === 'GAME_STARTED') {
    const { data } = action;
    return {
      version: GAME_STATE_VERSION,
      date: action.date,
      gameSessionId: data.gameSessionId,
      totalSentences: data.totalSentences,
      sentenceId: data.sentenceId,
      fullSentence: data.fullSentence,
      difficulty: data.difficulty,
      phase: 'answering',
      userInput: '',
      attempts: new Array(data.totalSentences).fill(0),
      outcomes: new Array(data.totalSentences).fill(null),
      feedback: null,
      reveal: null,
      nextSentence: null,
      hints: EMPTY_HINTS,
    };
  }

  if (!state) return state;

  switch (action.type) {
    case 'INPUT_CHANGED':
      return { ...state, userInput: action.value };

    case 'CHECK_SUCCEEDED': {
      // Ignore stale responses for a sentence the player is no longer answering
      if (state.phase !== 'answering' || action.sentenceId !== state.sentenceId) return state;

      const attempts = [...state.attempts];
      attempts[state.sentenceId - 1] = action.attempts;
      const { response } = action;

      if (!response.correct) {
        return { ...state, attempts, feedback: response };
      }

      const nextSentence = response.nextSentence ?? null;
      return {
        ...state,
        attempts,
        outcomes: withOutcome(state, 'solved'),
        feedback: response,
        nextSentence,
        phase: nextSentence ? 'correct' : 'complete',
      };
    }

    case 'REVEAL_SUCCEEDED':
      // Ignore stale responses for a sentence the player is no longer answering
      if (state.phase !== 'answering' || action.sentenceId !== state.sentenceId) return state;
      return {
        ...state,
        phase: 'revealed',
        outcomes: withOutcome(state, 'revealed'),
        feedback: null,
        reveal: action.response,
        nextSentence: action.response.nextSentence ?? null,
      };

    case 'RETRY':
      if (state.phase !== 'answering') return state;
      return { ...state, feedback: null, userInput: '' };

    case 'NEXT_SENTENCE': {
      if ((state.phase !== 'correct' && state.phase !== 'revealed') || !state.nextSentence) {
        return state;
      }
      const next = state.nextSentence;
      return {
        ...state,
        phase: 'answering',
        sentenceId: next.sentenceId,
        fullSentence: next.fullSentence,
        difficulty: next.difficulty,
        userInput: '',
        feedback: null,
        reveal: null,
        nextSentence: null,
        hints: EMPTY_HINTS,
      };
    }

    case 'SHOW_SUMMARY':
      // After revealing the last sentence there is no next one: go to the final screen
      if (state.phase !== 'revealed' || state.nextSentence) return state;
      return { ...state, phase: 'complete' };

    case 'HINT_RECEIVED': {
      if (state.phase !== 'answering' || action.sentenceId !== state.sentenceId) return state;
      const { response } = action;
      if (!response.hintText) {
        // No more hints available
        return { ...state, hints: { ...state.hints, total: response.totalHints } };
      }
      return {
        ...state,
        hints: {
          shown: [...state.hints.shown, response.hintText],
          nextNumber: state.hints.nextNumber + 1,
          total: response.totalHints,
        },
      };
    }

    default:
      return state;
  }
}

// --- Persistence ---------------------------------------------------------

const DIFFICULTIES: readonly string[] = ['easy', 'medium', 'hard'];
const PHASES: readonly string[] = ['answering', 'correct', 'revealed', 'complete'];
const OUTCOMES: readonly unknown[] = ['solved', 'revealed', null];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || value === null || typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

function isSentenceData(value: unknown, totalSentences: number): value is NextSentenceData {
  return (
    isObject(value) &&
    isNonNegativeInt(value.sentenceId) &&
    value.sentenceId >= 1 &&
    value.sentenceId <= totalSentences &&
    isNonEmptyString(value.fullSentence) &&
    DIFFICULTIES.includes(value.difficulty as string)
  );
}

function isCheckResponse(value: unknown): value is CheckAnswerResponse {
  if (!isObject(value) || typeof value.correct !== 'boolean') return false;
  if (!isOptionalString(value.correctAnswer) || !isOptionalString(value.explanation)) return false;
  if (typeof value.nearMiss !== 'boolean') return false;
  const accepted = value.acceptedAnswers;
  return accepted === undefined || accepted === null || isStringArray(accepted);
}

function isRevealResponse(value: unknown): value is RevealResponse {
  return (
    isObject(value) &&
    isNonEmptyString(value.correctAnswer) &&
    typeof value.explanation === 'string' &&
    isStringArray(value.acceptedAnswers)
  );
}

/** Validates a parsed saved state: version, shape, internal consistency and day. */
export function isValidGameState(value: unknown, today: string): value is GameState {
  if (!isObject(value)) return false;
  if (value.version !== GAME_STATE_VERSION || value.date !== today) return false;
  if (!isNonEmptyString(value.gameSessionId)) return false;

  const total = value.totalSentences;
  if (!isNonNegativeInt(total) || total < 1) return false;

  const current = { sentenceId: value.sentenceId, fullSentence: value.fullSentence, difficulty: value.difficulty };
  if (!isSentenceData(current, total)) return false;
  const currentIndex = current.sentenceId - 1;

  const phase = value.phase;
  if (!PHASES.includes(phase as string)) return false;
  if (typeof value.userInput !== 'string') return false;

  const attempts = value.attempts;
  if (!Array.isArray(attempts) || attempts.length !== total || !attempts.every(isNonNegativeInt)) {
    return false;
  }

  // Earlier sentences are finished and later ones untouched; the current one
  // is finished in every phase except 'answering'
  const outcomes = value.outcomes;
  if (!Array.isArray(outcomes) || outcomes.length !== total) return false;
  const outcomesConsistent = outcomes.every((outcome, index) => {
    if (!OUTCOMES.includes(outcome)) return false;
    if (index < currentIndex) return outcome !== null;
    if (index > currentIndex) return outcome === null;
    return phase === 'answering' ? outcome === null : outcome !== null;
  });
  if (!outcomesConsistent) return false;

  const hints = value.hints;
  if (
    !isObject(hints) ||
    !isStringArray(hints.shown) ||
    !isNonNegativeInt(hints.nextNumber) ||
    !isNonNegativeInt(hints.total)
  ) {
    return false;
  }

  const feedback = value.feedback;
  if (feedback !== null && !isCheckResponse(feedback)) return false;
  const reveal = value.reveal;
  if (reveal !== null && !isRevealResponse(reveal)) return false;
  const nextSentence = value.nextSentence;
  if (nextSentence !== null && !isSentenceData(nextSentence, total)) return false;

  const currentOutcome = outcomes[currentIndex];
  const showsSolved = feedback !== null && feedback.correct === true && reveal === null;
  const showsRevealed = reveal !== null && feedback === null;

  // Phase-specific consistency
  switch (phase) {
    case 'answering':
      return nextSentence === null && reveal === null && (feedback === null || feedback.correct === false);
    case 'correct':
      return showsSolved && currentOutcome === 'solved' && nextSentence !== null;
    case 'revealed':
      return showsRevealed && currentOutcome === 'revealed';
    case 'complete':
      return (
        nextSentence === null &&
        (currentOutcome === 'solved' ? showsSolved : showsRevealed)
      );
    default:
      return false;
  }
}

/**
 * Upgrades a version 1 save: v1 had no reveal, so every finished sentence was
 * solved. Anything that is not a v1 object is returned unchanged; the result
 * is validated by isValidGameState either way.
 */
function migrateV1(value: unknown): unknown {
  if (!isObject(value) || value.version !== 1) return value;
  const total = value.totalSentences;
  const sentenceId = value.sentenceId;
  if (!isNonNegativeInt(total) || !isNonNegativeInt(sentenceId)) return value;

  const currentFinished = value.phase === 'correct' || value.phase === 'complete';
  const outcomes: SentenceOutcome[] = Array.from({ length: total }, (_, index) =>
    index < sentenceId - 1 || (index === sentenceId - 1 && currentFinished) ? 'solved' : null,
  );
  // v1 wrong-answer feedback may carry a solution the UI no longer shows: drop it
  const feedback =
    isObject(value.feedback) && value.feedback.correct === false
      ? { correct: false, nearMiss: false, nextSentence: null }
      : value.feedback;
  return { ...value, version: GAME_STATE_VERSION, outcomes, feedback, reveal: null };
}

/** Reads today's saved game, or null if there is none or it is invalid. */
export function loadSavedGameState(): GameState | null {
  try {
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    const raw = localStorage.getItem(GAME_STATE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = migrateV1(JSON.parse(raw));
    if (isValidGameState(parsed, todayKey())) return parsed;

    // Outdated, from another day or corrupted: discard it
    localStorage.removeItem(GAME_STATE_STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable (e.g. private mode): the game keeps working in memory
  }
}
