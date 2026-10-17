import React from 'react';
import { RevealResponse } from '../types';
import AlternativeAnswers from './AlternativeAnswers';

interface RevealedSolutionProps {
  reveal: RevealResponse;
  onNext: () => void;
  onFinish: () => void;
}

/** Solution shown after "Veure solució": not a correct answer, so amber instead of green. */
const RevealedSolution: React.FC<RevealedSolutionProps> = ({ reveal, onNext, onFinish }) => {
  const hasNextSentence = !!reveal.nextSentence;

  return (
    <div role="status" className="mt-6 p-6 bg-amber-50 border-2 border-amber-500 rounded-lg">
      <div className="mb-4">
        <h3 className="font-semibold text-amber-800 mb-2 text-lg">La resposta era:</h3>
        <p className="text-2xl font-bold text-amber-900">{reveal.correctAnswer}</p>
      </div>

      {reveal.explanation && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Explicació:</h4>
          <p className="text-gray-600">{reveal.explanation}</p>
        </div>
      )}

      <AlternativeAnswers correctAnswer={reveal.correctAnswer} acceptedAnswers={reveal.acceptedAnswers} />

      <button
        onClick={hasNextSentence ? onNext : onFinish}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {hasNextSentence ? 'Següent frase' : 'Veure resultats'}
      </button>
    </div>
  );
};

export default RevealedSolution;
