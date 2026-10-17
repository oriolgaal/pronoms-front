import React from 'react';

interface AlternativeAnswersProps {
  correctAnswer?: string | null;      // Canonical answer, excluded from the list
  acceptedAnswers?: string[] | null;  // Every accepted answer, canonical first
}

/** Accepted answers other than the canonical one, without duplicates. */
function alternativeAnswers(
  correctAnswer?: string | null,
  acceptedAnswers?: string[] | null,
): string[] {
  if (!acceptedAnswers) return [];
  const alternatives = acceptedAnswers.filter((answer) => answer && answer !== correctAnswer);
  return Array.from(new Set(alternatives));
}

/** "També és correcte: …" line; renders nothing when there are no alternatives. */
const AlternativeAnswers: React.FC<AlternativeAnswersProps> = ({ correctAnswer, acceptedAnswers }) => {
  const alternatives = alternativeAnswers(correctAnswer, acceptedAnswers);
  if (alternatives.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="font-semibold text-gray-700 mb-2">També és correcte:</h4>
      <ul className="space-y-1">
        {alternatives.map((answer) => (
          <li key={answer} className="text-lg font-semibold text-gray-800">
            {answer}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlternativeAnswers;
