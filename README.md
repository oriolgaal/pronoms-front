# Joc dels Pronoms Febles

An educational web game to teach **Catalan weak pronouns (pronoms febles)** using interactive gameplay similar to Wordle. Players see full sentences and must type the shortened version using correct weak pronouns.

## Project Overview

This is a **Daily Challenge** version - a functional web application where users receive 5 sentences per day, same for all users. The game features anonymous session tracking, attempt counting, and localStorage persistence.

## Features (Current Version)

- ✅ **Daily Challenge System**: 5 sentences per day, same for all users
- ✅ **Anonymous Session Tracking**: 12-character session IDs
- ✅ **Attempt Tracking**: Frontend counts attempts, backend stores when correct
- ✅ **localStorage Persistence**: Game state saved across page refreshes
- ✅ **Daily Reset**: New challenge each day
- ✅ **Backend Answer Validation**: Secure validation via API
- ✅ **Grammatical Explanations**: Shown after correct answers
- ✅ **Completion Screen**: Summary of attempts when all 5 sentences done
- ✅ **Three Difficulty Levels**: Easy, Medium, Hard
- ✅ **Unlimited Retries**: No attempt limits per sentence
- ✅ **Catalan Language Interface**: All UI text in Catalan
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Configurable API Endpoint**: Via environment variables

## Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 3
- **Data Source:** Backend API (configurable endpoint)
- **API Integration:** Fetch API with TypeScript
- **Environment Config:** Vite environment variables

## Project Structure

```
pronoms_febles/
├── public/
│   └── vite.svg                    # Favicon
├── src/
│   ├── components/
│   │   ├── Game.tsx               # Main game logic with daily challenge
│   │   ├── Instructions.tsx       # Rules and help modal
│   │   └── Feedback.tsx           # Result display
│   ├── utils/
│   │   └── apiService.ts          # API communication (GET /api/new/, POST /api/check/)
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Tailwind imports and global styles
│   └── vite-env.d.ts              # Vite type definitions
├── .env.example                    # Example environment variables
├── .env                           # Local environment config (not committed)
├── index.html                      # HTML entry point
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite config
├── tailwind.config.js              # Tailwind config
├── postcss.config.js               # PostCSS config
├── eslint.config.js                # ESLint config
├── CLAUDE.md                       # Development guidance
└── README.md                       # This file
```

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend API running at `http://localhost:8000` (or configure custom URL)

### Installation Steps

1. **Clone or download the project:**
   ```bash
   cd pronoms_febles
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API endpoint (optional):**

   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` to set your API base URL:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

   Default: `http://localhost:8000`

4. **Ensure backend is running:**

   The backend API must be accessible at the configured URL with these endpoints:
   - `GET /api/new/` - Starts a new game and returns first sentence
   - `POST /api/check/` - Validates user's answer

   **Expected API Response Format (GET /api/new/):**
   ```json
   {
     "gameSessionId": "a7f3d9c24e8b1234",
     "sentenceId": 1,
     "fullSentence": "Dóna la pilota a mi",
     "difficulty": "easy"
   }
   ```

   See [new_api.md](new_api.md) for complete API specification.

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open in browser:**
   - Navigate to `http://localhost:5173`
   - The game will fetch sentences from the API automatically

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## How to Play

1. **Start the game** - Click "Començar a jugar" on the home screen
2. **Read the full sentence** - A sentence with strong pronouns is displayed
3. **Type the short form** - Enter the sentence using weak pronouns
4. **Check your answer** - Click "Comprovar" to validate
5. **Learn from feedback** - Read the grammatical explanation
6. **Continue** - Move to the next sentence

### Example

**Full sentence:** "Dóna la pilota a mi"
**Short sentence:** "Dóna-me-la"
**Explanation:** El pronom 'em' (a mi) es col·loca abans de 'la' i es transforma en 'me' davant de vocal o h muda.

## API Configuration

### Environment Variables

The application uses Vite environment variables for configuration:

- **`VITE_API_BASE_URL`** - Base URL for the backend API
  - Default: `http://localhost:8000`
  - Set in `.env` file

### API Endpoints

The game requires a backend with two endpoints:

#### 1. GET /api/new/

**Description:** Starts a new game and returns the first sentence

**URL Parameters:** None

**Response Format:**
```json
{
  "gameSessionId": "a7f3d9c24e8b1234",
  "sentenceId": 1,
  "fullSentence": "Dóna la pilota a mi",
  "difficulty": "easy"
}
```

#### 2. POST /api/check/

**Description:** Validates user's answer and returns result

**Request Body:**
```json
{
  "gameSessionId": "a7f3d9c24e8b",
  "sentenceId": 1,
  "answer": "Dóna-me-la",
  "attempts": 3
}
```

**Response Format (Correct, Not Last):**
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

**Response Format (Incorrect):**
```json
{
  "correct": false
}
```

**Complete API specification:** See [new_api.md](new_api.md) and [API_INTEGRATION.md](API_INTEGRATION.md)

### Error Handling

The frontend handles the following error scenarios:
- Network connection failures
- Server errors (4xx, 5xx)
- Invalid response format
- Missing or incomplete data

Users will see clear error messages in Catalan if any issues occur.

## Development Commands

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## Success Criteria (Current Version)

The daily challenge version is considered successful if:

- ✅ Application loads correctly at localhost
- ✅ Connects to backend API successfully
- ✅ Fetches daily challenge sentences (5 per day)
- ✅ Displays game session ID
- ✅ User can type and check their answer
- ✅ Backend validates answers correctly
- ✅ Correct feedback shows explanation and next sentence
- ✅ Incorrect feedback allows retry
- ✅ Attempt counting works per sentence
- ✅ Game state persists across page refreshes
- ✅ Daily reset works (new challenge each day)
- ✅ Completion screen shows when all 5 sentences done
- ✅ Instructions are accessible and clear
- ✅ Responsive design works on mobile and desktop
- ✅ All UI content is in Catalan

## Phase 1 - Out of Scope

The following features are **NOT included** in Phase 1:

- User authentication or registration
- Progress saving between sessions
- Statistics (correct/incorrect ratio, streaks)
- Level progression system
- Timer functionality
- Progressive hints
- Daily challenge mode
- Social sharing features
- Backend or API
- Database
- Web deployment
- Analytics tracking

These features may be implemented in **Phase 2** if the POC is successful.

## Next Steps After POC

1. **Gather feedback** from test users
2. **Validate content** with a Catalan language expert
3. **Decide on Phase 2** features:
   - Local statistics (localStorage)
   - Daily mode
   - Wordle-style letter-by-letter feedback
   - UI/UX improvements
   - Public deployment

## Contributing

This is currently a personal project in POC phase. Contributions for grammar corrections or additional sentences are welcome!

## Language Policy

- **Code, comments, commits:** English only
- **User interface, content:** Catalan only
- **Documentation:** English (technical) or Catalan (user-facing)

## License

This project is provided as-is for educational purposes.

## Acknowledgments

Inspired by Wordle and created to help learn Catalan weak pronouns.

---

**Status:** ✅ Frontend Implementation Complete - Ready for Backend Integration
**Version:** Daily Challenge System
**Last Updated:** October 2025

For complete API specification and integration guide, see:
- [new_api.md](new_api.md) - Backend API specification
- [API_INTEGRATION.md](API_INTEGRATION.md) - Frontend integration guide
- [QUICKSTART.md](QUICKSTART.md) - Quick start for developers
