import {
  NextSentenceResponse,
  NextSentenceData,
  CheckAnswerRequest,
  CheckAnswerResponse,
  HintRequest,
  HintResponse,
  RevealRequest,
  RevealResponse,
} from '../types';

// Configuration for API endpoint
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  endpoints: {
    new: '/api/new/',
    check: '/api/check/',
    hint: '/api/hint',
    reveal: '/api/reveal/',
  },
};

/**
 * Error thrown by the API helpers. `status` is the HTTP status code when the
 * server answered, or undefined for network failures and malformed responses.
 */
export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const CONNECTION_ERROR_MESSAGE =
  'No es pot connectar amb el servidor. Comprova que el backend està en funcionament.';
const INVALID_FORMAT_MESSAGE = 'Format de resposta incorrecte del servidor';

/**
 * Performs a fetch and returns the parsed JSON body, throwing an ApiError
 * that carries the HTTP status when the request fails.
 */
async function requestJson(url: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    // fetch only rejects on network failures (offline, DNS, CORS...)
    throw new ApiError(CONNECTION_ERROR_MESSAGE);
  }

  if (!response.ok) {
    if (response.status === 400) {
      throw new ApiError('Petició invàlida. Comprova les dades enviades.', 400);
    }
    if (response.status === 404) {
      throw new ApiError('No s\'ha trobat la sessió de joc.', 404);
    }
    throw new ApiError(
      `Error del servidor: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError(INVALID_FORMAT_MESSAGE);
  }
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function stringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((v) => typeof v === 'string') ? value : null;
}

/** Validates the optional `nextSentence` object shared by check and reveal responses. */
function parseNextSentence(value: unknown): NextSentenceData | null {
  if (value === null || value === undefined) return null;
  const next = value as Partial<NextSentenceData>;
  if (
    typeof next !== 'object' ||
    typeof next.sentenceId !== 'number' ||
    typeof next.fullSentence !== 'string' ||
    !next.difficulty
  ) {
    throw new ApiError(INVALID_FORMAT_MESSAGE);
  }
  return { sentenceId: next.sentenceId, fullSentence: next.fullSentence, difficulty: next.difficulty };
}

function postJson(url: string, body: unknown): Promise<unknown> {
  return requestJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

/**
 * Fetches the first sentence to start a new game
 * @returns Promise<NextSentenceResponse> - Sentence data with session info
 */
export async function fetchNextSentence(): Promise<NextSentenceResponse> {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.new}`;
  const data = (await requestJson(url)) as Partial<NextSentenceResponse> | null;

  // Validate the response structure
  if (!data || !data.gameSessionId || !data.sentenceId || !data.fullSentence || !data.difficulty) {
    throw new ApiError(INVALID_FORMAT_MESSAGE);
  }

  return {
    gameSessionId: data.gameSessionId,
    sentenceId: data.sentenceId,
    fullSentence: data.fullSentence,
    difficulty: data.difficulty,
    totalSentences: data.totalSentences || 5,
  };
}

/**
 * Checks the user's answer with the backend
 * @param request - CheckAnswerRequest object with game session, sentence ID, answer, and attempts
 * @returns Promise<CheckAnswerResponse> - Result with correctness and next sentence data
 */
export async function checkAnswer(request: CheckAnswerRequest): Promise<CheckAnswerResponse> {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.check}`;
  const data = (await postJson(url, request)) as Partial<CheckAnswerResponse> | null;

  // Validate the response structure
  if (!data || typeof data.correct !== 'boolean') {
    throw new ApiError(INVALID_FORMAT_MESSAGE);
  }

  // The solution is only sent for a correct answer; ignore it otherwise
  if (!data.correct) {
    return { correct: false, nearMiss: data.nearMiss === true, nextSentence: null };
  }

  return {
    correct: true,
    correctAnswer: optionalString(data.correctAnswer),
    explanation: optionalString(data.explanation),
    acceptedAnswers: stringArray(data.acceptedAnswers),
    nearMiss: false,
    nextSentence: parseNextSentence(data.nextSentence),
  };
}

/**
 * Reveals the solution of the current sentence ("Veure solució"). The server
 * marks the sentence as revealed and advances the session.
 * @param request - RevealRequest with game session and sentence ID
 * @returns Promise<RevealResponse> - Solution, explanation, accepted answers and next sentence
 */
export async function revealSolution(request: RevealRequest): Promise<RevealResponse> {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.reveal}`;
  const data = (await postJson(url, request)) as Partial<RevealResponse> | null;

  if (!data || typeof data.correctAnswer !== 'string' || !data.correctAnswer) {
    throw new ApiError(INVALID_FORMAT_MESSAGE);
  }

  return {
    correctAnswer: data.correctAnswer,
    explanation: optionalString(data.explanation) ?? '',
    acceptedAnswers: stringArray(data.acceptedAnswers) ?? [data.correctAnswer],
    nextSentence: parseNextSentence(data.nextSentence),
  };
}

/**
 * Fetches a hint for the current sentence
 * @param request - HintRequest object with game session, sentence ID and hint number
 * @returns Promise<HintResponse> - Hint text, current hint number, and total hints
 */
export async function fetchHint(request: HintRequest): Promise<HintResponse> {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.hint}`;
  const data = (await postJson(url, request)) as Partial<HintResponse> | null;

  // Validate the response structure
  if (!data || typeof data.hintNumber !== 'number' || typeof data.totalHints !== 'number') {
    throw new ApiError(INVALID_FORMAT_MESSAGE);
  }

  return {
    hintText: data.hintText ?? null,
    hintNumber: data.hintNumber,
    totalHints: data.totalHints,
  };
}
