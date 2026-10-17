// Type definitions for the Catalan Weak Pronouns Game

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Sentence {
  fullSentence: string;       // Full sentence with strong pronouns
  shortSentence: string;      // Short sentence with weak pronouns
  difficulty: DifficultyLevel; // Difficulty level
  explanation: string;         // Grammatical explanation in Catalan
}

// API Response Types
export interface NextSentenceResponse {
  gameSessionId: string;       // 16-character unique session identifier
  sentenceId: number;          // Current sentence ID (1-5)
  fullSentence: string;        // Full Catalan sentence
  difficulty: DifficultyLevel; // Difficulty level
  totalSentences: number;      // Always 5
}

export interface NextSentenceData {
  sentenceId: number;
  fullSentence: string;
  difficulty: DifficultyLevel;
}

export interface CheckAnswerResponse {
  correct: boolean;
  correctAnswer?: string | null;      // Only when correct
  explanation?: string | null;        // Only when correct
  acceptedAnswers?: string[] | null;  // Only when correct; canonical answer first
  nearMiss: boolean;                  // Wrong answer only off in apostrophes, hyphens or spaces
  nextSentence: NextSentenceData | null; // null on a wrong answer or after the last sentence
}

export interface CheckAnswerRequest {
  gameSessionId: string;
  sentenceId: number;
  answer: string;
  attempts: number;
}

// Reveal API Types ("Veure solució")
export interface RevealRequest {
  gameSessionId: string;
  sentenceId: number;
}

export interface RevealResponse {
  correctAnswer: string;
  explanation: string;
  acceptedAnswers: string[];             // Canonical answer first
  nextSentence: NextSentenceData | null; // null after the last sentence
}

// Hint API Types
export interface HintRequest {
  gameSessionId: string;
  sentenceId: number;
  hintNumber: number;
}

export interface HintResponse {
  hintText: string | null;
  hintNumber: number;
  totalHints: number;
}
