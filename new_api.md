# New API Design - Catalan Pronouns Game

## Overview

This document describes the new API design for the Catalan pronouns game. The game presents 5 sentences sequentially, requiring users to transform full sentences with strong pronouns into shortened versions using weak pronouns.

---

## Core Concepts

### Game Flow
- **5 sentences per game session**, presented sequentially
- **Linear progression**: Sentences must be completed in order (1→2→3→4→5)
- **Retry on incorrect**: Users can retry incorrect answers until they get it right
- **Advance on correct**: Only correct answers advance to the next sentence

### Game Sessions
- Each game session gets a unique **16-character identifier**
- Generated on first API call (`/api/new/`)
- Used to track game progress

### Design Principles
- **Attempt tracking**: Backend saves attempts to SQLite database on correct answers
- **Sequential progression**: Users cannot skip to arbitrary sentences
- **Advance only when correct**: Only correct answers move to the next sentence
- **Retry on incorrect**: Users can retry indefinitely until correct

---

## API Endpoints

### 1. GET /api/new/

**Purpose**: Start a new game and get the first sentence

**Parameters**: None

**Response** (200 OK):
```json
{
  "gameSessionId": "a7f3d9c24e8b1234",
  "sentenceId": 1,
  "fullSentence": "Dóna la pilota a mi",
  "difficulty": "easy"
}
```

**Fields**:
- `gameSessionId` (string): 16-character unique session identifier
- `sentenceId` (number): Always 1 (first sentence)
- `fullSentence` (string): Full Catalan sentence with strong pronouns
- `difficulty` (string): "easy", "medium", or "hard"

**Notes**:
- Always creates a new game session with unique ID
- Always returns the first sentence
- This endpoint should only be called once at the start of a game

---

### 2. POST /api/check/

**Purpose**: Check user's answer and get result

**Request Body**:
```json
{
  "gameSessionId": "a7f3d9c24e8b1234",
  "sentenceId": 1,
  "answer": "Dóna-me-la"
}
```

**Request Fields**:
- `gameSessionId` (string, required): Session ID from `/api/new/`
- `sentenceId` (number, required): Sentence being checked (1-5)
- `answer` (string, required): User's answer (shortened sentence)

**Validation**:
- `sentenceId` must be between 1 and 5
- `gameSessionId` must be 16 characters
- `answer` is trimmed and compared case-sensitively
- Returns 400 for invalid input

**Response - Correct Answer (Sentences 1-4)** (200 OK):
```json
{
  "correct": true,
  "correctAnswer": "Dóna-me-la",
  "explanation": "El pronom 'em' es transforma en 'me' davant de vocal.",
  "nextSentence": {
    "sentenceId": 2,
    "fullSentence": "Porta els plats a nosaltres",
    "difficulty": "medium"
  }
}
```

**Response - Correct Answer (Sentence 5 - Game Complete)** (200 OK):
```json
{
  "correct": true,
  "correctAnswer": "Porta'ns-els",
  "explanation": "Els pronoms 'ens' i 'els' es combinen...",
  "nextSentence": null
}
```

**Response - Incorrect Answer** (200 OK):
```json
{
  "correct": false
}
```

**Fields**:
- `correct` (boolean): Whether the answer was correct
- `correctAnswer` (string): The correct answer (only returned when correct)
- `explanation` (string): Grammatical explanation in Catalan (only returned when correct)
- `nextSentence` (object | null): Next sentence data (only returned when correct)
  - Object with `sentenceId`, `fullSentence`, `difficulty` for sentences 1-4
  - `null` when game is complete (after sentence 5)

**Backend Behavior**:
- **Correct answer**:
  - Returns `correctAnswer`, `explanation`, and `nextSentence`
  - **MUST save to database**: `gameSessionId`, `sentenceId`, `attempts` in SQLite
  - Returns `nextSentence: null` after sentence 5 to indicate completion
- **Incorrect answer**:
  - Returns only `correct: false`, allowing retry on same sentence
  - Does NOT save to database (user will retry)
- Validates that `sentenceId` matches current session position
- Answer comparison: exact match, case-sensitive, trimmed whitespace

---

## Database Schema

### SQLite Database

The backend MUST use a SQLite database to store game statistics.

**Database Location**: `backend/game_data.db` (or similar backend directory)

**Table: sentence_attempts**

```sql
CREATE TABLE sentence_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_session_id TEXT NOT NULL,
  sentence_id INTEGER NOT NULL,
  attempts INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_session_id, sentence_id)
);
```

**Table Fields**:
- `id`: Auto-incrementing primary key
- `game_session_id`: 16-character session identifier from `/api/new/`
- `sentence_id`: Sentence number (1-5)
- `attempts`: Number of attempts before getting correct answer
- `completed_at`: Timestamp when sentence was completed correctly

**Constraints**:
- `UNIQUE(game_session_id, sentence_id)`: Prevents duplicate entries for same session/sentence
- If user completes same sentence again (e.g., restarts game), the UNIQUE constraint will prevent duplicate saves

**Backend MUST**:
- Save a row when user submits a **correct** answer
- Include the `attempts` count from the frontend request
- Handle UNIQUE constraint violations gracefully (e.g., ignore or update)

**Example Insert**:
```sql
INSERT INTO sentence_attempts (game_session_id, sentence_id, attempts)
VALUES ('a7f3d9c24e8b1234', 1, 3)
ON CONFLICT(game_session_id, sentence_id) DO NOTHING;
```

---

## Data Files

### CSV Location
- **Backend only**: CSV file should NOT be in `public/` folder
- **Path**: Store in backend directory (e.g., `backend/data/sentences.csv`)
- **Reason**: Frontend should not have direct access to all answers

### CSV Format
```csv
full_sentence,short_sentence,difficulty,explanation
"Dóna la pilota a mi","Dóna-me-la","easy","El pronom 'em' es transforma en 'me' davant de vocal."
```

---

## Frontend Implementation Guide

### State Management

```typescript
interface GameState {
  gameSessionId: string;
  currentSentenceId: number;
  currentSentence: string;
  difficulty: string;
  userInput: string;
  isCorrect: boolean | null;
  correctAnswer: string;
  explanation: string;
  nextSentence: { sentenceId: number; fullSentence: string; difficulty: string } | null;
  isComplete: boolean;
}
```

### Initialization

```typescript
// On component mount or game start
const startGame = async () => {
  const response = await fetch('http://localhost:8000/api/new/');
  const data = await response.json();

  setGameSessionId(data.gameSessionId);
  setCurrentSentenceId(data.sentenceId);
  setCurrentSentence(data.fullSentence);
  setDifficulty(data.difficulty);

  // Store gameSessionId in localStorage for persistence
  localStorage.setItem('gameSessionId', data.gameSessionId);
};
```

### Checking Answer

```typescript
const checkAnswer = async () => {
  // Send to backend
  const response = await fetch('http://localhost:8000/api/check/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gameSessionId,
      sentenceId: currentSentenceId,
      answer: userInput.trim()
    })
  });

  const data = await response.json();

  if (data.correct) {
    // Show feedback (correct answer + explanation)
    setIsCorrect(true);
    setCorrectAnswer(data.correctAnswer);
    setExplanation(data.explanation);

    if (data.nextSentence) {
      // Store next sentence data for later
      setNextSentence(data.nextSentence);
    } else {
      // Game complete (nextSentence is null)
      setIsComplete(true);
    }
  } else {
    // Incorrect - allow retry
    setIsCorrect(false);
    // User stays on same sentence, can try again
  }
};
```

### Moving to Next Sentence

```typescript
const goToNextSentence = () => {
  if (!nextSentence) {
    setIsComplete(true);
    return;
  }

  // Use data from previous check response
  setCurrentSentenceId(nextSentence.sentenceId);
  setCurrentSentence(nextSentence.fullSentence);
  setDifficulty(nextSentence.difficulty);
  setUserInput('');
  setIsCorrect(null);
  setCorrectAnswer('');
  setExplanation('');
  setNextSentence(null);
};
```

### Persistence

```typescript
// Save game state to localStorage
useEffect(() => {
  const gameState = {
    gameSessionId,
    currentSentenceId,
    // ... other state
  };
  localStorage.setItem('gameState', JSON.stringify(gameState));
}, [gameSessionId, currentSentenceId]);

// Load game state on mount
useEffect(() => {
  const savedState = localStorage.getItem('gameState');
  if (savedState) {
    const state = JSON.parse(savedState);
    // Restore state
    setGameSessionId(state.gameSessionId);
    setCurrentSentenceId(state.currentSentenceId);
    // Note: In current implementation, you would need to restart
    // the game since we cannot fetch arbitrary sentence IDs
  } else {
    startGame();
  }
}, []);
```

---

## Error Handling

### Frontend
```typescript
try {
  const response = await fetch('/api/check/', { /* ... */ });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  // ... handle response
} catch (error) {
  console.error('Error checking answer:', error);
  // Show user-friendly error message in Catalan
  setError('Error al comprovar la resposta. Torna-ho a provar.');
}
```

### Backend
- **400 Bad Request**: Invalid `sentenceId` (not 1-5), malformed JSON, invalid session ID
- **404 Not Found**: Invalid endpoint
- **500 Internal Server Error**: CSV loading errors, server errors

---

## Testing Checklist

### Backend
- [ ] `/api/new/` always returns sentence 1
- [ ] `/api/new/` generates unique 16-character session ID
- [ ] `/api/check/` advances to next sentence only when correct
- [ ] `/api/check/` returns only `correct: false` for incorrect answers
- [ ] `/api/check/` returns `nextSentence` for correct answers on sentences 1-4
- [ ] `/api/check/` returns `nextSentence: null` for correct answer on sentence 5
- [ ] `/api/check/` returns `correctAnswer` and `explanation` only when correct
- [ ] `/api/check/` validates answer correctly (case-sensitive, trimmed)
- [ ] **`/api/check/` saves to SQLite database on correct answer** (gameSessionId, sentenceId, attempts)
- [ ] Database handles UNIQUE constraint properly (no duplicate session/sentence pairs)
- [ ] UTF-8 Catalan characters handled correctly

### Frontend
- [ ] `/api/new/` called only once at game start
- [ ] Correct check responses include `correctAnswer`, `explanation`, and `nextSentence`
- [ ] Incorrect check responses only return `correct: false`
- [ ] Wrong answers allow user to retry on same sentence
- [ ] Wrong answers do NOT advance to next sentence
- [ ] Game completion detected when `nextSentence === null` (after sentence 5)
- [ ] Game session ID persisted across page refreshes
- [ ] Correct answers show explanation and next sentence button
- [ ] Last correct sentence shows completion screen
- [ ] State persists in localStorage
- [ ] Error handling shows user-friendly messages in Catalan

---

## Future Enhancements (Not in Phase 1)

- **Statistics tracking**: Track attempts per sentence, completion rate
- **Retry mechanism**: Allow multiple attempts on same sentence
- **Share results**: Generate emoji grid (like Wordle)
- **Daily challenge**: Date-based sentence selection
- **Practice mode**: Play random sentences
- **Streaks**: Track consecutive games played

---

## Summary

### Backend Responsibilities
1. Generate unique 16-character game session IDs
2. Validate answers (exact match, case-sensitive, trimmed)
3. Return next sentence data only when answer is correct
4. Advance to next sentence only on correct answer
5. Return correct answer and explanation only when user is correct
6. **Save attempt statistics to SQLite database** (gameSessionId, sentenceId, attempts) when answer is correct
7. Handle database UNIQUE constraints properly

### Frontend Responsibilities
1. Store next sentence data from correct check responses
2. Display correct answer and explanation only when correct
3. Allow retry on same sentence when incorrect
4. Store game session ID in localStorage
5. Manage game state (current sentence, user input, feedback)
6. Persist state across page refreshes
7. **Track and send attempt count** with each check request

### Key Design Decisions
- **Sequential flow**: Users must go through sentences in order (1→2→3→4→5)
- **Retry on incorrect**: Wrong answers allow retry on same sentence
- **Advance only on correct**: Only correct answers move to next sentence
- **16-character session ID**: Unique hex identifier per game
- **Attempt tracking**: Frontend tracks attempts, backend saves to SQLite on correct answer
- **Feedback only when correct**: Correct answer and explanation shown only for correct responses
- **Backend-only CSV**: Prevents frontend access to answers
- **Game loop**: new → check (retry until correct) → check (retry until correct) → ... → complete
