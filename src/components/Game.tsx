import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ApiError, fetchNextSentence, checkAnswer, fetchHint, revealSolution } from '../utils/apiService';
import {
  SentenceOutcome,
  gameReducer,
  loadSavedGameState,
  saveGameState,
  todayKey,
} from '../state/gameReducer';
import Feedback from './Feedback';
import RevealedSolution from './RevealedSolution';

interface Notice {
  kind: 'info' | 'error';
  text: string;
}

const SESSION_EXPIRED_NOTICE: Notice = {
  kind: 'info',
  text: 'La sessió havia caducat; hem començat una partida nova.',
};

/** Builds an inline, recoverable error message in Catalan. */
function recoverableErrorNotice(err: unknown, action: string): Notice {
  let detail = 'Torna-ho a provar.';
  if (err instanceof ApiError) {
    if (err.status === undefined) {
      detail = 'Comprova la connexió i torna-ho a provar.';
    } else if (err.status >= 500) {
      detail = "El servidor no respon correctament. Torna-ho a provar d'aquí a una estona.";
    } else if (err.status === 400) {
      detail = 'La petició no és vàlida. Torna-ho a provar.';
    }
  }
  return { kind: 'error', text: `No s'ha pogut ${action}. ${detail}` };
}

function attemptsLabel(count: number): string {
  return `${count} ${count === 1 ? 'intent' : 'intents'}`;
}

/** Final screen line for one sentence, e.g. "encertada (2 intents)". */
function outcomeLabel(outcome: SentenceOutcome, attempts: number): string {
  const result = outcome === 'revealed' ? 'revelada' : 'encertada';
  return `${result} (${attemptsLabel(attempts)})`;
}

const Game: React.FC = () => {
  // Single serializable game state, restored synchronously from localStorage
  const [game, dispatch] = useReducer(gameReducer, null, loadSavedGameState);

  // Transient UI state (not persisted)
  const [isStarting, setIsStarting] = useState<boolean>(game === null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [loadingHint, setLoadingHint] = useState<boolean>(false);

  // Synchronous in-flight guards: state updates are not visible within the same tick.
  // Check and reveal share one guard so they can never overlap.
  const answerRequestRef = useRef(false);
  const hintingRef = useRef(false);
  const startingRef = useRef(false);
  const restoredRef = useRef(game !== null);

  const startNewGame = useCallback(async (noticeAfterStart?: Notice) => {
    if (startingRef.current) return;
    startingRef.current = true;
    setIsStarting(true);
    setFatalError(null);
    setNotice(null);

    try {
      const data = await fetchNextSentence();
      dispatch({ type: 'GAME_STARTED', data, date: todayKey() });
      setNotice(noticeAfterStart ?? null);
    } catch (err) {
      // Without a session there is no game to keep: show the full error screen
      setFatalError(err instanceof Error ? err.message : 'Error desconegut');
    } finally {
      startingRef.current = false;
      setIsStarting(false);
    }
  }, []);

  // Start a new game on mount unless today's game was restored
  useEffect(() => {
    if (!restoredRef.current) {
      startNewGame();
    }
  }, [startNewGame]);

  /** 404 means the session is gone: start over with a notice. Anything else stays inline. */
  const handleRequestError = (err: unknown, action: string) => {
    if (err instanceof ApiError && err.status === 404) {
      startNewGame(SESSION_EXPIRED_NOTICE);
    } else {
      setNotice(recoverableErrorNotice(err, action));
    }
  };

  // Persist the whole game state on every change
  useEffect(() => {
    if (game) {
      saveGameState(game);
    }
  }, [game]);

  const handleCheck = async () => {
    if (!game || game.phase !== 'answering' || answerRequestRef.current) return;
    const answer = game.userInput.trim();
    if (!answer) return;

    const { gameSessionId, sentenceId } = game;
    // The attempt is only recorded once the server has answered
    const attempts = game.attempts[sentenceId - 1] + 1;

    answerRequestRef.current = true;
    setIsChecking(true);
    setNotice(null);

    try {
      const response = await checkAnswer({ gameSessionId, sentenceId, answer, attempts });
      dispatch({ type: 'CHECK_SUCCEEDED', sentenceId, attempts, response });
    } catch (err) {
      handleRequestError(err, 'comprovar la resposta');
    } finally {
      answerRequestRef.current = false;
      setIsChecking(false);
    }
  };

  const handleReveal = async () => {
    if (!game || game.phase !== 'answering' || answerRequestRef.current) return;
    const { gameSessionId, sentenceId } = game;

    answerRequestRef.current = true;
    setIsRevealing(true);
    setNotice(null);

    try {
      const response = await revealSolution({ gameSessionId, sentenceId });
      dispatch({ type: 'REVEAL_SUCCEEDED', sentenceId, response });
    } catch (err) {
      handleRequestError(err, 'mostrar la solució');
    } finally {
      answerRequestRef.current = false;
      setIsRevealing(false);
    }
  };

  const handleNext = () => {
    setNotice(null);
    dispatch({ type: 'NEXT_SENTENCE' });
  };

  const handleShowSummary = () => {
    setNotice(null);
    dispatch({ type: 'SHOW_SUMMARY' });
  };

  const handleRetry = () => {
    dispatch({ type: 'RETRY' });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !game?.feedback) {
      handleCheck();
    }
  };

  const requestHint = async () => {
    if (!game || hintingRef.current) return;
    const { gameSessionId, sentenceId } = game;
    const hintNumber = game.hints.nextNumber;

    hintingRef.current = true;
    setLoadingHint(true);
    setNotice(null);

    try {
      const response = await fetchHint({ gameSessionId, sentenceId, hintNumber });
      dispatch({ type: 'HINT_RECEIVED', sentenceId, response });
    } catch (err) {
      handleRequestError(err, 'obtenir la pista');
    } finally {
      hintingRef.current = false;
      setLoadingHint(false);
    }
  };

  if (isStarting || (!game && !fatalError)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregant el joc...</p>
        </div>
      </div>
    );
  }

  if (fatalError || !game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 border-2 border-red-200 rounded-lg max-w-md">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-gray-600">{fatalError}</p>
          <button
            onClick={() => startNewGame()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Tornar a intentar
          </button>
        </div>
      </div>
    );
  }

  const { sentenceId, totalSentences, attempts, outcomes, hints, feedback } = game;
  const isAnswerRequestPending = isChecking || isRevealing;

  if (game.phase === 'complete') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-green-50 border-2 border-green-200 rounded-lg max-w-md">
          <svg
            className="w-16 h-16 text-green-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-3xl font-bold text-green-700 mb-2">Enhorabona!</h2>
          <p className="text-xl text-gray-600 mb-4">Has completat les frases d'avui!</p>
          <div className="text-gray-600 mb-6">
            <p className="font-semibold mb-2">Resultat per frase:</p>
            <ul className="mt-2 space-y-1">
              {attempts.map((count, index) => (
                <li key={index}>
                  Frase {index + 1}:{' '}
                  <span className={outcomes[index] === 'revealed' ? 'text-amber-700' : 'text-green-700'}>
                    {outcomeLabel(outcomes[index], count)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-green-300 pt-4 mb-6">
            <p className="text-gray-600 mb-3">Torna demà per a un nou repte!</p>
            <p className="text-gray-700 font-semibold">Vols tornar a intentar-ho?</p>
          </div>
          <button
            onClick={() => startNewGame()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Tornar a començar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header Info */}
        <div className="mb-6">
          <div className="flex gap-4 text-gray-600">
            <div>
              <span className="font-semibold">Frase:</span> {sentenceId} de {totalSentences}
            </div>
            <div>
              <span className="font-semibold">Intents:</span> {attempts[sentenceId - 1]}
            </div>
          </div>
        </div>

        {/* Inline notices (recoverable errors, session restarted) */}
        {notice && (
          <div
            role={notice.kind === 'error' ? 'alert' : 'status'}
            className={`mb-6 p-4 rounded-lg border-2 ${
              notice.kind === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* Full Sentence Display */}
        <div className="mb-8">
          <h3 className="text-gray-700 font-semibold mb-3 text-lg">Frase original:</h3>
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <p className="text-2xl text-gray-800">{game.fullSentence}</p>
          </div>
        </div>

        {/* Input Area */}
        {game.phase === 'answering' && !feedback && (
          <>
            <div className="mb-6">
              <label htmlFor="answer" className="block text-gray-700 font-semibold mb-3 text-lg">
                Frase amb pronoms:
              </label>
              <input
                id="answer"
                type="text"
                value={game.userInput}
                onChange={(e) => dispatch({ type: 'INPUT_CHANGED', value: e.target.value })}
                onKeyDown={handleKeyDown}
                readOnly={isAnswerRequestPending}
                aria-busy={isAnswerRequestPending}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Escriu la teva resposta aquí..."
                autoFocus
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCheck}
                disabled={isAnswerRequestPending || !game.userInput.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isChecking ? 'Comprovant…' : 'Comprovar'}
              </button>
              <button
                onClick={requestHint}
                disabled={loadingHint || (hints.total > 0 && hints.nextNumber >= hints.total)}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loadingHint ? 'Carregant...' : 'Pista'}
                {hints.total > 0 && ` (${hints.nextNumber}/${hints.total})`}
              </button>
              <button
                onClick={handleReveal}
                disabled={isAnswerRequestPending}
                className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isRevealing ? 'Carregant...' : 'Veure solució'}
              </button>
            </div>
          </>
        )}

        {/* Display Hints */}
        {hints.shown.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-yellow-800">Pistes:</h3>
            {hints.shown.map((hint, index) => (
              <p key={index} className="mb-2 text-gray-700">
                <span className="font-semibold text-yellow-700">{index + 1}.</span> {hint}
              </p>
            ))}
            {hints.nextNumber >= hints.total && hints.total > 0 && (
              <p className="text-sm text-gray-600 italic mt-3 pt-3 border-t border-yellow-300">
                No hi ha més pistes disponibles.
              </p>
            )}
          </div>
        )}

        {/* Feedback (kept in state so it survives a reload) */}
        {feedback && (
          <Feedback
            response={feedback}
            onNext={handleNext}
            onRetry={handleRetry}
            hasNextSentence={!!game.nextSentence}
          />
        )}

        {/* Revealed solution ("Veure solució"), also persisted */}
        {game.phase === 'revealed' && game.reveal && (
          <RevealedSolution reveal={game.reveal} onNext={handleNext} onFinish={handleShowSummary} />
        )}
      </div>
    </div>
  );
};

export default Game;
