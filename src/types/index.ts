// Type definitions for the Catalan Weak Pronouns Game

export type DifficultyLevel = 'facil' | 'mitja' | 'dificil';

export interface Sentence {
  fullSentence: string;       // Full sentence with strong pronouns
  shortSentence: string;      // Short sentence with weak pronouns
  difficulty: DifficultyLevel; // Difficulty level
  explanation: string;         // Grammatical explanation in Catalan
}

export interface GameState {
  currentSentence: Sentence | null;
  userInput: string;
  attemptCount: number;
  isCorrect: boolean | null;
  showSolution: boolean;
  showInstructions: boolean;
}
