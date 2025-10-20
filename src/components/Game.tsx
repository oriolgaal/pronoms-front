import React, { useState, useEffect } from 'react';
import { NextSentenceData } from '../types';
import { fetchNextSentence, checkAnswer, fetchHint } from '../utils/apiService';
import Feedback from './Feedback';

const Game: React.FC = () => {
  // Game state based on new API design
  const [gameSessionId, setGameSessionId] = useState<string>('');
  const [currentSentenceId, setCurrentSentenceId] = useState<number>(1);
  const [currentSentence, setCurrentSentence] = useState<string>('');
  const [totalSentences, setTotalSentences] = useState<number>(5);
  const [userInput, setUserInput] = useState<string>('');
  const [attemptCounts, setAttemptCounts] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
  });
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [nextSentenceData, setNextSentenceData] = useState<NextSentenceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // Hint state
  const [currentHintNumber, setCurrentHintNumber] = useState<number>(0);
  const [displayedHints, setDisplayedHints] = useState<string[]>([]);
  const [totalHints, setTotalHints] = useState<number>(0);
  const [loadingHint, setLoadingHint] = useState<boolean>(false);

  // Load game state from localStorage on mount
  useEffect(() => {
    const loadGameState = async () => {
      try {
        const savedState = localStorage.getItem('gameState');
        const savedDate = localStorage.getItem('gameDate');
        const today = new Date().toISOString().split('T')[0];

        if (savedState && savedDate === today) {
          // Restore state from localStorage
          const state = JSON.parse(savedState);

          // Only restore if we have valid data
          if (state.gameSessionId && state.currentSentence) {
            setGameSessionId(state.gameSessionId);
            setCurrentSentenceId(state.currentSentenceId);
            setCurrentSentence(state.currentSentence);
            setAttemptCounts(state.attemptCounts);
            setLoading(false);
          } else {
            // Saved state is incomplete, start fresh
            await startNewGame();
            localStorage.setItem('gameDate', today);
          }
        } else {
          // New day or no saved state, start fresh
          await startNewGame();
          localStorage.setItem('gameDate', today);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconegut');
        setLoading(false);
      }
    };

    loadGameState();
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameSessionId) {
      const gameState = {
        gameSessionId,
        currentSentenceId,
        currentSentence,
        attemptCounts,
      };
      localStorage.setItem('gameState', JSON.stringify(gameState));
    }
  }, [gameSessionId, currentSentenceId, currentSentence, attemptCounts]);

  const startNewGame = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchNextSentence();
      setGameSessionId(data.gameSessionId);
      setCurrentSentenceId(data.sentenceId);
      setCurrentSentence(data.fullSentence);
      setTotalSentences(data.totalSentences);
      setAttemptCounts({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      setIsComplete(false);
      setLoading(false);

      // Reset all feedback and game state
      setUserInput('');
      setIsCorrect(null);
      setExplanation('');
      setCorrectAnswer('');
      setShowFeedback(false);
      setNextSentenceData(null);

      // Reset hint state
      setCurrentHintNumber(0);
      setDisplayedHints([]);
      setTotalHints(0);

      // Store gameSessionId in localStorage
      localStorage.setItem('gameSessionId', data.gameSessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut');
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    if (!userInput.trim() || !gameSessionId) return;

    // Increment attempt count for current sentence
    const currentAttempts = attemptCounts[currentSentenceId] + 1;
    const newAttemptCounts = {
      ...attemptCounts,
      [currentSentenceId]: currentAttempts,
    };
    setAttemptCounts(newAttemptCounts);

    try {
      // Send to backend
      const response = await checkAnswer({
        gameSessionId,
        sentenceId: currentSentenceId,
        answer: userInput.trim(),
        attempts: currentAttempts,
      });

      if (response.correct) {
        setIsCorrect(true);
        setCorrectAnswer(response.correctAnswer || '');
        setExplanation(response.explanation || '');
        setShowFeedback(true);

        if (response.nextSentence) {
          setNextSentenceData(response.nextSentence);
        } else {
          // nextSentence is null, game is complete
          setIsComplete(true);
        }
      } else {
        setIsCorrect(false);
        setShowFeedback(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al comprovar la resposta');
    }
  };

  const handleNext = () => {
    if (nextSentenceData) {
      // Use data from previous check response
      setCurrentSentenceId(nextSentenceData.sentenceId);
      setCurrentSentence(nextSentenceData.fullSentence);
      setUserInput('');
      setIsCorrect(null);
      setCorrectAnswer('');
      setExplanation('');
      setShowFeedback(false);
      setNextSentenceData(null);

      // Reset hint state
      setCurrentHintNumber(0);
      setDisplayedHints([]);
      setTotalHints(0);
    }
  };

  const handleRetry = () => {
    setShowFeedback(false);
    setIsCorrect(null);
    setUserInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !showFeedback) {
      handleCheck();
    }
  };

  const requestHint = async () => {
    setLoadingHint(true);

    try {
      const response = await fetchHint({
        sentenceId: currentSentenceId,
        hintNumber: currentHintNumber,
      });

      // Update state
      if (response.hintText) {
        // Add new hint to displayed hints
        setDisplayedHints(prev => [...prev, response.hintText!]);
        setCurrentHintNumber(prev => prev + 1);
        setTotalHints(response.totalHints);
      } else {
        // No more hints available
        setTotalHints(response.totalHints);
      }
    } catch (err) {
      console.error('Error requesting hint:', err);
      setError(err instanceof Error ? err.message : 'Error al obtenir la pista');
    } finally {
      setLoadingHint(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Carregant el joc...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
          <p className="text-gray-600">{error}</p>
          <button
            onClick={startNewGame}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Tornar a intentar
          </button>
        </div>
      </div>
    );
  }

  if (isComplete) {
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
            <p className="font-semibold mb-2">Total d'intents per frase:</p>
            <ul className="mt-2 space-y-1">
              {Object.entries(attemptCounts).map(([id, count]) => (
                <li key={id}>Frase {id}: {count} {count === 1 ? 'intent' : 'intents'}</li>
              ))}
            </ul>
          </div>
          <div className="border-t border-green-300 pt-4 mb-6">
            <p className="text-gray-600 mb-3">Torna demà per a un nou repte!</p>
            <p className="text-gray-700 font-semibold">Vols tornar a intentar-ho?</p>
          </div>
          <button
            onClick={() => {
              setIsComplete(false);
              startNewGame();
            }}
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
              <span className="font-semibold">Frase:</span> {currentSentenceId} de {totalSentences}
            </div>
            <div>
              <span className="font-semibold">Intents:</span> {attemptCounts[currentSentenceId]}
            </div>
          </div>
        </div>

        {/* Full Sentence Display */}
        <div className="mb-8">
          <h3 className="text-gray-700 font-semibold mb-3 text-lg">Frase original:</h3>
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <p className="text-2xl text-gray-800">{currentSentence}</p>
          </div>
        </div>

        {/* Input Area */}
        {!showFeedback && (
          <>
            <div className="mb-6">
              <label htmlFor="answer" className="block text-gray-700 font-semibold mb-3 text-lg">
                Frase amb pronoms:
              </label>
              <input
                id="answer"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Escriu la teva resposta aquí..."
                autoFocus
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCheck}
                disabled={!userInput.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Comprovar
              </button>
              <button
                onClick={requestHint}
                disabled={
                  loadingHint ||
                  isCorrect === true ||
                  (totalHints > 0 && currentHintNumber >= totalHints)
                }
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {loadingHint ? 'Carregant...' : 'Pista'}
                {totalHints > 0 && ` (${currentHintNumber}/${totalHints})`}
              </button>
            </div>
          </>
        )}

        {/* Display Hints */}
        {displayedHints.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-yellow-800">Pistes:</h3>
            {displayedHints.map((hint, index) => (
              <p key={index} className="mb-2 text-gray-700">
                <span className="font-semibold text-yellow-700">{index + 1}.</span> {hint}
              </p>
            ))}
            {currentHintNumber >= totalHints && totalHints > 0 && (
              <p className="text-sm text-gray-600 italic mt-3 pt-3 border-t border-yellow-300">
                No hi ha més pistes disponibles.
              </p>
            )}
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <Feedback
            isCorrect={isCorrect === true}
            explanation={explanation}
            correctAnswer={correctAnswer}
            onNext={handleNext}
            onRetry={handleRetry}
            hasNextSentence={!!nextSentenceData}
          />
        )}
      </div>
    </div>
  );
};

export default Game;
