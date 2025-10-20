# API Integration Guide - Daily Challenge Version

> **⚠️ OUTDATED:** This document describes an older daily challenge system that is no longer being implemented.
>
> **For current API specification, see [new_api.md](new_api.md)**
>
> The current implementation uses:
> - `GET /api/new/` - Start new game (not `/api/next/`)
> - Sequential game flow with retry-on-incorrect
> - 16-character session IDs (not 12-character)
> - **Attempt tracking WITH SQLite database** (this doc says "no statistics" which is incorrect)
>
> **THIS DOCUMENT IS KEPT FOR HISTORICAL REFERENCE ONLY. DO NOT USE.**

---

## Overview (Historical - No Longer Implemented)

The Catalan Pronouns Game was planned to implement a **daily challenge** system where every day, 5 sentences are selected from the backend and presented to all users in the same order. The game features:

- **5 sentences per day**, same for all users
- **Anonymous session tracking** with 12-character session IDs
- **Attempt tracking** per sentence (frontend-managed, backend-stored)
- **localStorage persistence** for game state across page refreshes
- **Daily reset** - new challenge each day

## Changes Made

### Updated Files

1. **`src/types/index.ts`**
   - Changed `DifficultyLevel` from Catalan ('facil', 'mitja', 'dificil') to English ('easy', 'medium', 'hard')
   - Added API response types: `NextSentenceResponse`, `CheckAnswerRequest`, `CheckAnswerResponse`
   - Updated `GameState` interface for session tracking and attempt counting

2. **`src/utils/apiService.ts`**
   - Completely refactored for new API design
   - `fetchNextSentence(sentenceId?)` - GET /api/next/ or /api/next/{id}
   - `checkAnswer(request)` - POST /api/check/ with answer validation
   - Error handling for network issues and validation errors

3. **`src/components/Game.tsx`**
   - Complete rewrite for daily challenge logic
   - Game session tracking with `gameSessionId`
   - Attempt counting per sentence (Record<number, number>)
   - localStorage persistence for game state and session
   - Daily reset detection based on stored date
   - Completion screen when all 5 sentences answered
   - Uses next sentence data from API response instead of fetching again

4. **`src/components/Feedback.tsx`**
   - Added `hasNextSentence` prop to conditionally show "Next" button
   - Updated "Show Solution" behavior (solution not available in frontend)
   - Better handling of correct/incorrect states

### Removed Files

- ✅ `src/utils/csvParser.ts` - No longer needed, data comes from backend
- ✅ `public/data/sentences.csv` - Moved to backend
- ✅ `public/data/` directory - Removed

### Environment Configuration

- `.env.example` - Example environment configuration
- `.env` - Local configuration (not committed)
  - `VITE_API_BASE_URL` - Configurable API base URL (default: http://localhost:8000)

## API Specification

### 1. GET /api/next/ or GET /api/next/{id}

**Purpose:** Get a sentence to play

**URL:**
```
GET {VITE_API_BASE_URL}/api/next/
GET {VITE_API_BASE_URL}/api/next/{id}
```

Default base URL: `http://localhost:8000`

**Parameters:**
- `id` (optional, in URL path): Sentence number (1-5). Defaults to 1 if omitted.

**Validation:**
- `id` must be between 1 and 5 (inclusive)
- Returns 404 if `id` is out of range

**Response (200 OK):**
```json
{
  "gameSessionId": "a7f3d9c24e8b",
  "sentenceId": 1,
  "fullSentence": "Dóna la pilota a mi",
  "difficulty": "easy",
  "totalSentences": 5
}
```

**Response Fields:**
- `gameSessionId` (string): 12-character unique session identifier
- `sentenceId` (number): Current sentence ID (1-5)
- `fullSentence` (string): Full Catalan sentence with strong pronouns
- `difficulty` (string): "easy", "medium", or "hard"
- `totalSentences` (number): Always 5

**Notes:**
- Same `gameSessionId` returned for the same day (can be cached by backend)
- Users can call `/api/next/3` directly without completing 1-2 first
- No sequential enforcement by backend

---

### 2. POST /api/check/

**Purpose:** Check user's answer and get result

**URL:**
```
POST {VITE_API_BASE_URL}/api/check/
```

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "gameSessionId": "a7f3d9c24e8b",
  "sentenceId": 1,
  "answer": "Dóna-me-la",
  "attempts": 3
}
```

**Request Fields:**
- `gameSessionId` (string, required): Session ID from `/api/next/`
- `sentenceId` (number, required): Sentence being checked (1-5)
- `answer` (string, required): User's answer (shortened sentence)
- `attempts` (number, required): Total attempts for this sentence (tracked by frontend)

**Validation:**
- `sentenceId` must be between 1 and 5
- `gameSessionId` must be 12 characters
- `answer` is trimmed and compared case-sensitively
- Returns 400 for invalid input

**Response - Correct Answer (Not Last Sentence) (200 OK):**
```json
{
  "correct": true,
  "explanation": "El pronom 'em' es transforma en 'me' davant de vocal.",
  "nextSentence": {
    "sentenceId": 2,
    "fullSentence": "Porta el llibre a ella",
    "difficulty": "medium"
  }
}
```

**Response - Correct Answer (Last Sentence) (200 OK):**
```json
{
  "correct": true,
  "explanation": "Els pronoms 'li' i 'ho' es combinen en 'li-ho'.",
  "isComplete": true
}
```

**Response - Incorrect Answer (200 OK):**
```json
{
  "correct": false
}
```

**Response Fields:**
- `correct` (boolean): Whether the answer is correct
- `explanation` (string, optional): Grammatical explanation in Catalan (only when correct)
- `nextSentence` (object, optional): Next sentence data (only when correct and not last)
  - `sentenceId` (number): Next sentence ID
  - `fullSentence` (string): Full sentence text
  - `difficulty` (string): Difficulty level
- `isComplete` (boolean, optional): True when last sentence completed

**Backend Behavior:**
- When `correct: true`, saves statistics to database:
  - `date`: Current date (YYYY-MM-DD)
  - `sentence_id`: Sentence ID (1-5)
  - `game_session_id`: Session identifier
  - `attempts`: Attempt count from frontend
- When `correct: false`, no data is saved
- Answer comparison: exact match, case-sensitive, trimmed whitespace

---

### Error Responses

**400 Bad Request:**
- Invalid `sentenceId` (not 1-5)
- Malformed JSON
- Missing required fields

**404 Not Found:**
- Invalid sentence ID in `/api/next/{id}` (must be 1-5)

**500 Internal Server Error:**
- Database errors
- CSV loading errors
- Unexpected server errors

The frontend handles all errors with user-friendly Catalan messages.

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
```

**Note:** Vite requires the `VITE_` prefix for environment variables to be exposed to the client.

### Changing the API Endpoint

1. Edit `.env` file
2. Update `VITE_API_BASE_URL` to your backend URL
3. Restart the development server (`npm run dev`)

Example for production:
```env
VITE_API_BASE_URL=https://api.pronoms-febles.cat
```

## Frontend Flow

### 1. Initial Load / Page Refresh

```
1. Check localStorage for 'gameState' and 'gameDate'
2. Compare saved date with today's date
3. If same day:
   - Restore gameSessionId, currentSentenceId, attemptCounts
   - Fetch current sentence from /api/next/{id}
   - Resume where user left off
4. If new day or no saved state:
   - Start fresh game
   - Fetch sentence 1 from /api/next/
   - Store today's date in localStorage
   - Initialize attempt counts to {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
```

### 2. Playing a Sentence

```
1. User enters answer and clicks "Comprovar" (Check)
2. Increment attempt count for current sentence
3. Send POST to /api/check/ with:
   - gameSessionId
   - sentenceId
   - answer (trimmed)
   - attempts (current count)
4. If correct:
   - Show explanation
   - If not last sentence: Show "Next" button
   - If last sentence: Show completion screen
5. If incorrect:
   - Show "Try again" message
   - Allow retry (attempt count continues incrementing)
```

### 3. Moving to Next Sentence

```
1. When user answers correctly (and it's not the last sentence):
   - API response includes nextSentence data
   - User clicks "Següent frase" (Next sentence)
2. Frontend uses data from API response:
   - setCurrentSentenceId(nextSentence.sentenceId)
   - setCurrentSentence(nextSentence.fullSentence)
   - setDifficulty(nextSentence.difficulty)
3. No additional API call needed
4. Reset userInput, feedback states
5. Attempt count for new sentence starts at 0
```

### 4. Completion

```
When user answers the 5th sentence correctly:
1. API response has isComplete: true
2. Frontend shows completion screen with:
   - Success message: "Enhorabona!"
   - Summary of attempts per sentence
   - "Come back tomorrow" message
3. User can exit to home screen
4. Game state remains in localStorage
5. Next day, game automatically resets
```

### 5. State Persistence

```
Every time gameSessionId, currentSentenceId, or attemptCounts changes:
1. Save to localStorage as 'gameState'
2. Also store 'gameDate' as YYYY-MM-DD

localStorage structure:
{
  "gameState": {
    "gameSessionId": "a7f3d9c24e8b",
    "currentSentenceId": 3,
    "attemptCounts": {1: 2, 2: 1, 3: 0, 4: 0, 5: 0}
  },
  "gameDate": "2025-10-19"
}
```

## Development Testing

### Running Locally

1. Start your backend API server:
   ```bash
   # Example - your backend command
   python manage.py runserver 8000
   ```

2. Verify API is accessible:
   ```bash
   curl http://localhost:8000/api/next/
   ```

3. Start the frontend:
   ```bash
   npm run dev
   ```

4. Test the game at `http://localhost:5173`

### Testing Error Scenarios

**Test network failure:**
- Stop the backend server
- Observe error message: "No es pot connectar amb el servidor..."

**Test invalid response:**
- Configure backend to return invalid JSON
- Observe error handling

**Test empty response:**
- Configure backend to return empty array
- Observe validation error

## Backend Requirements

For detailed backend implementation, see [new_api.md](new_api.md).

### Key Backend Responsibilities

1. **Daily Sentence Selection**
   - Select 5 sentences per day using date-based seed
   - Distribution: 2 easy, 2 medium, 1 hard
   - Same sentences for all users on same day
   - Cache selection in database

2. **Game Session Management**
   - Generate 12-character session IDs
   - Return same ID for same day (can be cached)
   - No user accounts required

3. **Answer Validation**
   - Exact match, case-sensitive, trimmed
   - Return next sentence data when correct and not last
   - Return isComplete flag when last sentence

4. **Statistics Tracking**
   - Save attempt counts when answer is correct
   - Store: date, sentence_id, game_session_id, attempts
   - Unique constraint: (date, game_session_id, sentence_id)

5. **Database Schema**
   ```sql
   CREATE TABLE daily_sentences (
     date TEXT PRIMARY KEY,
     sentence_ids TEXT NOT NULL  -- JSON: [12, 45, 67, 23, 89]
   );

   CREATE TABLE sentence_stats (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     date TEXT NOT NULL,
     sentence_id INTEGER NOT NULL,  -- 1-5
     game_session_id TEXT NOT NULL,
     attempts INTEGER NOT NULL,
     completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     UNIQUE(date, game_session_id, sentence_id)
   );
   ```

6. **CORS Configuration**
   - Allow requests from frontend origin
   - Enable credentials if needed
   - Handle preflight OPTIONS requests

7. **Error Handling**
   - 400 for validation errors
   - 404 for invalid sentence IDs
   - 500 for server errors
   - Proper JSON error responses

## Migration from Previous Version

### Removed Components

- ✅ `src/utils/csvParser.ts` - CSV parsing no longer needed
- ✅ `public/data/sentences.csv` - Data moved to backend
- ✅ `public/data/` directory - Removed

### Breaking Changes

1. **Difficulty levels changed from Catalan to English**
   - Old: 'facil', 'mitja', 'dificil'
   - New: 'easy', 'medium', 'hard'

2. **Game flow changed from batch mode to daily challenge**
   - Old: Fetch batches of 5, get new batch when done
   - New: 5 sentences per day, fixed challenge

3. **Answer validation moved to backend**
   - Old: Frontend checkAnswer() function
   - New: POST /api/check/ endpoint

4. **Session tracking added**
   - gameSessionId required for all game operations
   - Attempt tracking per sentence
   - localStorage persistence

## Troubleshooting

**Problem:** "No es pot connectar amb el servidor"
- **Solution:** Ensure backend is running and accessible at configured URL

**Problem:** Sentences not loading
- **Solution:** Check browser console for detailed error messages
- **Solution:** Verify API response format matches specification

**Problem:** Environment variables not working
- **Solution:** Restart dev server after changing `.env`
- **Solution:** Ensure variable name has `VITE_` prefix

**Problem:** CORS errors in browser console
- **Solution:** Configure backend to allow requests from `http://localhost:5173`

## Security Notes

- `.env` file is not committed to git (in `.gitignore`)
- Use `.env.example` as template for team members
- For production, set environment variables in hosting platform
- Never commit API keys or secrets to repository

## Testing

### Manual Testing Steps

1. **Start backend server**
   ```bash
   # Ensure backend is running on port 8000
   curl http://localhost:8000/api/next/
   ```

2. **Start frontend**
   ```bash
   npm run dev
   # Opens on http://localhost:5173
   ```

3. **Test initial load**
   - Click "Començar a jugar"
   - Verify sentence 1 loads
   - Check console for gameSessionId

4. **Test answer checking**
   - Enter correct answer → Should show explanation and next sentence
   - Enter wrong answer → Should show retry option
   - Check attempts increment correctly

5. **Test persistence**
   - Answer a sentence
   - Refresh page
   - Verify state is restored (same sentence, same attempts)

6. **Test completion**
   - Complete all 5 sentences
   - Verify completion screen shows
   - Check attempt summary

7. **Test new day**
   - Clear localStorage or change 'gameDate'
   - Refresh page
   - Verify new game starts

### Browser Console Testing

```javascript
// View current state
JSON.parse(localStorage.getItem('gameState'))

// Check date
localStorage.getItem('gameDate')

// Simulate new day
localStorage.setItem('gameDate', '2025-01-01')
location.reload()

// Clear everything
localStorage.clear()
location.reload()
```

## Troubleshooting

**Problem:** "No es pot connectar amb el servidor"
- **Solution:** Ensure backend running at configured URL
- Check VITE_API_BASE_URL in .env

**Problem:** Game doesn't load
- **Solution:** Check browser console for errors
- Verify API response format matches specification

**Problem:** State doesn't persist
- **Solution:** Check localStorage is enabled
- Verify gameSessionId is being saved

**Problem:** Wrong sentence after refresh
- **Solution:** Backend must return correct sentence for given ID
- Check /api/next/{id} endpoint

**Problem:** CORS errors
- **Solution:** Configure backend CORS headers
- Allow origin: http://localhost:5173

## Next Steps

### Frontend (Complete ✅)
- ✅ Type definitions for new API
- ✅ API service implementation
- ✅ Game component refactor
- ✅ localStorage persistence
- ✅ Feedback component updates
- ✅ Documentation

### Backend (In Progress)
- ⏳ Implement GET /api/next/ and /api/next/{id}
- ⏳ Implement POST /api/check/
- ⏳ Daily sentence selection algorithm
- ⏳ Database schema and migrations
- ⏳ Session ID generation
- ⏳ Statistics tracking

### Testing
- ⏳ Integration testing with real backend
- ⏳ End-to-end user flow testing
- ⏳ Cross-browser testing
- ⏳ Mobile responsive testing

### Deployment
- ⏳ Deploy backend to production
- ⏳ Configure production API URL
- ⏳ Set up monitoring and logging
- ⏳ Performance optimization

---

**Status:** Frontend Implementation Complete - Ready for Backend Integration
**Last Updated:** October 2025

For complete API design specification, see [new_api.md](new_api.md).
