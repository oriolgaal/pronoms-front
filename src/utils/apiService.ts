import { NextSentenceResponse, CheckAnswerRequest, CheckAnswerResponse, HintRequest, HintResponse } from '../types';

// Configuration for API endpoint
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  endpoints: {
    new: '/api/new/',
    check: '/api/check/',
    hint: '/api/hint',
  },
};

/**
 * Fetches the first sentence to start a new game
 * @returns Promise<NextSentenceResponse> - Sentence data with session info
 */
export async function fetchNextSentence(): Promise<NextSentenceResponse> {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.new}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate the response structure
    if (!data.gameSessionId || !data.sentenceId || !data.fullSentence || !data.difficulty) {
      throw new Error('Format de resposta incorrecte del servidor');
    }

    return {
      gameSessionId: data.gameSessionId,
      sentenceId: data.sentenceId,
      fullSentence: data.fullSentence,
      difficulty: data.difficulty,
      totalSentences: data.totalSentences || 5,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No es pot connectar amb el servidor. Comprova que el backend està en funcionament.');
    }
    throw error;
  }
}

/**
 * Checks the user's answer with the backend
 * @param request - CheckAnswerRequest object with game session, sentence ID, answer, and attempts
 * @returns Promise<CheckAnswerResponse> - Result with correctness and next sentence data
 */
export async function checkAnswer(request: CheckAnswerRequest): Promise<CheckAnswerResponse> {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.check}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Petició invàlida. Comprova les dades enviades.');
      }
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate the response structure
    if (typeof data.correct !== 'boolean') {
      throw new Error('Format de resposta incorrecte del servidor');
    }

    return {
      correct: data.correct,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      nextSentence: data.nextSentence,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No es pot connectar amb el servidor. Comprova que el backend està en funcionament.');
    }
    throw error;
  }
}

/**
 * Fetches a hint for the current sentence
 * @param request - HintRequest object with sentence ID and hint number
 * @returns Promise<HintResponse> - Hint text, current hint number, and total hints
 */
export async function fetchHint(request: HintRequest): Promise<HintResponse> {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.hint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Petició invàlida. Comprova les dades enviades.');
      }
      throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate the response structure
    if (typeof data.hintNumber !== 'number' || typeof data.totalHints !== 'number') {
      throw new Error('Format de resposta incorrecte del servidor');
    }

    return {
      hintText: data.hintText,
      hintNumber: data.hintNumber,
      totalHints: data.totalHints,
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No es pot connectar amb el servidor. Comprova que el backend està en funcionament.');
    }
    throw error;
  }
}
