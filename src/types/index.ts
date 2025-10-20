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
  correctAnswer?: string;      // Only when correct
  explanation?: string;        // Only when correct
  nextSentence?: NextSentenceData | null; // Only when correct (null = game complete)
}

export interface CheckAnswerRequest {
  gameSessionId: string;
  sentenceId: number;
  answer: string;
  attempts: number;
}

// Game State
export interface GameState {
  gameSessionId: string;
  currentSentenceId: number;
  currentSentence: string;
  difficulty: DifficultyLevel;
  userInput: string;
  attemptCounts: Record<number, number>; // { 1: 3, 2: 1, 3: 0, 4: 0, 5: 0 }
  isCorrect: boolean | null;
  correctAnswer: string;
  explanation: string;
  isComplete: boolean;
  nextSentenceData: NextSentenceData | null;
}
