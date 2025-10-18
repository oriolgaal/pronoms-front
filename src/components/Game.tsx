import React, { useState, useEffect } from 'react';
import { Sentence } from '../types';
import { loadSentences, getRandomSentence, checkAnswer } from '../utils/csvParser';
import Feedback from './Feedback';

const Game: React.FC = () => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentSentence, setCurrentSentence] = useState<Sentence | null>(null);
  const [userInput, setUserInput] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Load sentences on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadSentences();
        setSentences(data);
        setCurrentSentence(getRandomSentence(data));
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconegut');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCheck = () => {
    if (!currentSentence || !userInput.trim()) return;

    const correct = checkAnswer(userInput, currentSentence.shortSentence);
    setIsCorrect(correct);
    setAttemptCount(attemptCount + 1);
    setShowFeedback(true);

    if (!correct) {
      // Keep input field active for retry
    }
  };

  const handleShowSolution = () => {
    setShowSolution(true);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (sentences.length === 0) return;

    // Reset state for next sentence
    setCurrentSentence(getRandomSentence(sentences));
    setUserInput('');
    setAttemptCount(0);
    setIsCorrect(null);
    setShowSolution(false);
    setShowFeedback(false);
  };

  const handleRetry = () => {
    setShowFeedback(false);
    setIsCorrect(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil':
        return 'text-green-600 bg-green-100';
      case 'mitja':
        return 'text-yellow-600 bg-yellow-100';
      case 'dificil':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'facil':
        return 'Fàcil';
      case 'mitja':
        return 'Mitjà';
      case 'dificil':
        return 'Difícil';
      default:
        return difficulty;
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
        </div>
      </div>
    );
  }

  if (!currentSentence) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No hi ha frases disponibles.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header Info */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            <span className="font-semibold">Intent:</span> {attemptCount + 1}
          </div>
          <div
            className={`px-4 py-1 rounded-full font-semibold ${getDifficultyColor(
              currentSentence.difficulty
            )}`}
          >
            {getDifficultyLabel(currentSentence.difficulty)}
          </div>
        </div>

        {/* Full Sentence Display */}
        <div className="mb-8">
          <h3 className="text-gray-700 font-semibold mb-3 text-lg">Frase original:</h3>
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <p className="text-2xl text-gray-800">{currentSentence.fullSentence}</p>
          </div>
        </div>

        {/* Input Area */}
        {!showFeedback && (
          <>
            <div className="mb-6">
              <label htmlFor="answer" className="block text-gray-700 font-semibold mb-3 text-lg">
                Escriu la frase curta:
              </label>
              <input
                id="answer"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Escriu la teva resposta aquí..."
                autoFocus
                disabled={showFeedback}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCheck}
                disabled={!userInput.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Comprovar
              </button>
              <button
                onClick={handleShowSolution}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Veure solució
              </button>
            </div>
          </>
        )}

        {/* Feedback */}
        {showFeedback && (
          <Feedback
            isCorrect={isCorrect === true}
            explanation={currentSentence.explanation}
            correctAnswer={currentSentence.shortSentence}
            showSolution={showSolution}
            onNext={handleNext}
            onRetry={handleRetry}
          />
        )}
      </div>
    </div>
  );
};

export default Game;
