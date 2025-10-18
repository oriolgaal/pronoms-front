import React from 'react';

interface FeedbackProps {
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string;
  showSolution: boolean;
  onNext: () => void;
  onRetry: () => void;
}

const Feedback: React.FC<FeedbackProps> = ({
  isCorrect,
  explanation,
  correctAnswer,
  showSolution,
  onNext,
  onRetry,
}) => {
  if (isCorrect) {
    return (
      <div className="mt-6 p-6 bg-green-50 border-2 border-green-500 rounded-lg">
        <div className="flex items-center mb-4">
          <svg
            className="w-8 h-8 text-green-500 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h3 className="text-2xl font-bold text-green-700">Correcte!</h3>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Explicació:</h4>
          <p className="text-gray-600">{explanation}</p>
        </div>

        <button
          onClick={onNext}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Següent frase
        </button>
      </div>
    );
  }

  if (showSolution) {
    return (
      <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-500 rounded-lg">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-blue-700 mb-2">Solució:</h3>
          <p className="text-2xl font-bold text-blue-900 mb-4">{correctAnswer}</p>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Explicació:</h4>
          <p className="text-gray-600">{explanation}</p>
        </div>

        <button
          onClick={onNext}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Següent frase
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 bg-red-50 border-2 border-red-500 rounded-lg">
      <div className="flex items-center mb-4">
        <svg
          className="w-8 h-8 text-red-500 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <h3 className="text-2xl font-bold text-red-700">Incorrecte</h3>
      </div>

      <p className="text-gray-600 mb-4">Torna-ho a provar!</p>

      <button
        onClick={onRetry}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Tornar
      </button>
    </div>
  );
};

export default Feedback;
