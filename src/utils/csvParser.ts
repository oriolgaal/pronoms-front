import { Sentence, DifficultyLevel } from '../types';

/**
 * Parse CSV content into an array of Sentence objects
 */
export function parseCSV(csvContent: string): Sentence[] {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');

  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header and one data row');
  }

  // Skip header line
  const dataLines = lines.slice(1);

  const sentences: Sentence[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;

    // Parse CSV line with proper handling of quoted fields
    const fields = parseCSVLine(line);

    if (fields.length !== 4) {
      console.warn(`Skipping line ${i + 2}: Expected 4 fields, got ${fields.length}`);
      continue;
    }

    const [fullSentence, shortSentence, difficulty, explanation] = fields;

    // Validate difficulty level
    if (!['facil', 'mitja', 'dificil'].includes(difficulty)) {
      console.warn(`Skipping line ${i + 2}: Invalid difficulty level "${difficulty}"`);
      continue;
    }

    sentences.push({
      fullSentence: fullSentence.trim(),
      shortSentence: shortSentence.trim(),
      difficulty: difficulty as DifficultyLevel,
      explanation: explanation.trim(),
    });
  }

  return sentences;
}

/**
 * Parse a single CSV line, handling quoted fields with commas
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Field separator
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Add the last field
  fields.push(currentField);

  return fields;
}

/**
 * Load sentences from a CSV file
 */
export async function loadSentences(csvPath: string = '/data/sentences.csv'): Promise<Sentence[]> {
  try {
    const response = await fetch(csvPath);

    if (!response.ok) {
      throw new Error(`Failed to load CSV file: ${response.statusText}`);
    }

    const csvContent = await response.text();
    return parseCSV(csvContent);
  } catch (error) {
    console.error('Error loading sentences:', error);
    throw new Error('Could not load game data. Please try again later.');
  }
}

/**
 * Get a random sentence from the array
 */
export function getRandomSentence(sentences: Sentence[]): Sentence {
  if (sentences.length === 0) {
    throw new Error('No sentences available');
  }

  const randomIndex = Math.floor(Math.random() * sentences.length);
  return sentences[randomIndex];
}

/**
 * Check if the user's answer is correct
 */
export function checkAnswer(userInput: string, correctAnswer: string): boolean {
  const normalize = (str: string) => str.trim();
  return normalize(userInput) === normalize(correctAnswer);
}
