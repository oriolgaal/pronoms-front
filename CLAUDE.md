# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An educational web game to teach **Catalan weak pronouns (pronoms febles)** using interactive gameplay similar to Wordle. Players see full sentences and must type the shortened version using correct weak pronouns.

**Current Status:** Project in planning/specification phase. No code exists yet - this is a Proof of Concept (POC) specification.

## Language Policy

**IMPORTANT:** All development artifacts must be in English:
- Code (variables, functions, classes, interfaces)
- File names and folder names
- CSV column headers
- Code comments
- Git commit messages
- Documentation for developers

**Catalan ONLY for:**
- User-facing text in the UI
- Game content (sentences, explanations)
- CSV data values (the actual sentence content)
- Instructions and help text shown to players

**Example:**
```typescript
// Good: English code, Catalan UI
interface Sentence {
  fullSentence: string;  // Code in English
  shortSentence: string;
  explanation: string;
}

// UI displays in Catalan:
<button>Comprovar</button>
<p>Incorrecte. Torna-ho a provar!</p>
```

---

## Common Commands

### Setup & Installation (When Project is Created)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Expected Development Workflow

```bash
# 1. Create React + Vite + TypeScript project
npm create vite@latest pronoms_febles -- --template react-ts

# 2. Install additional dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Start local development
npm run dev
```

---

## Architecture & Code Structure

### High-Level Architecture

```
pronoms_febles/
├── data/
│   └── sentences.csv              # Game content (frases)
├── src/
│   ├── components/
│   │   ├── Game.tsx               # Main game component
│   │   ├── Instructions.tsx       # Rules & how-to-play
│   │   └── Feedback.tsx           # Result feedback display
│   ├── utils/
│   │   └── csvParser.ts           # CSV parsing logic
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces
│   ├── App.tsx                    # Main app container
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Tailwind + global styles
├── public/
│   └── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

### Core Components

#### 1. **Game.tsx** (Main Game Logic)
- Loads CSV data on mount
- Displays full Catalan sentence
- Accepts user input for short form
- Validates answer and provides feedback
- Manages attempt counter
- Handles "show solution" feature
- Transitions to next sentence

#### 2. **Feedback.tsx** (Result Display)
- Shows "Correct!" with grammatical explanation
- Shows "Incorrect, try again" for wrong answers
- Displays solution when user requests it
- Provides "Next sentence" button

#### 3. **Instructions.tsx** (Help/Tutorial)
- Explains game rules
- Shows examples of pronoun transformations
- Tips for common patterns
- Accessible via header link

#### 4. **csvParser.ts** (Data Loading)
- Reads sentences from `/data/sentences.csv`
- Parses CSV with proper UTF-8 encoding for Catalan characters
- Validates data format
- Returns typed Sentence objects
- Handles CSV parsing errors gracefully

### Data Models (TypeScript)

```typescript
type DifficultyLevel = 'easy' | 'medium' | 'hard';

interface Sentence {
  fullSentence: string;        // Full sentence with strong pronouns (Catalan text)
  shortSentence: string;       // Short sentence with weak pronouns (Catalan text)
  difficulty: DifficultyLevel; // Difficulty level
  explanation: string;         // Grammatical explanation (Catalan text)
}

interface GameState {
  currentSentence: Sentence | null;
  userInput: string;
  attemptCount: number;
  isCorrect: boolean | null;
  showSolution: boolean;
  showInstructions: boolean;
}
```

---

## Development Phases

### Phase 1: MVP / POC (2-3 weeks)

**Goal:** Validate concept with basic working game

**Features:**
- Random sentence selection from CSV
- User input for shortened form
- Simple correct/incorrect feedback
- Multiple attempts allowed
- "Show solution" button
- Grammatical explanation display
- Basic responsive UI
- Catalan interface
- Instructions/help page

**Technology Stack:**
- React with TypeScript
- Vite build tool
- Tailwind CSS styling
- Local CSV data
- Browser LocalStorage (if needed)

**Success Criteria:**
- Load in < 2 seconds
- Responsive (mobile & desktop)
- All game flows working
- CSV data loads correctly
- Clear Catalan interface

### Phase 2: Growth (1-2 months after Phase 1)

**Features:**
- Statistics tracking (streak, games played, accuracy)
- Practice mode (unlimited attempts)
- Difficulty level selection
- Daily challenge mode
- Share results feature (emoji grid)
- Ad integration

### Phase 3: Enhancement (3+ months)

**Features:**
- User accounts (optional)
- Community leaderboards
- Weekly challenges
- Achievement system
- PWA/offline support

---

## Key Implementation Details

### Answer Validation
- **Comparison:** Exact match (case-sensitive)
- **Trimming:** Remove leading/trailing whitespace
- **Significance:** Hyphens and apostrophes are significant
- **Encoding:** UTF-8 for Catalan characters

### CSV Data Format

**File Location:** `data/sentences.csv`

**Columns (headers in English, content in Catalan):**
- `full_sentence`: Full sentence with strong pronouns (Catalan text)
- `short_sentence`: Short sentence with weak pronouns (Catalan text)
- `difficulty`: 'easy', 'medium', or 'hard'
- `explanation`: Grammatical explanation (Catalan text)

**Example:**
```csv
full_sentence,short_sentence,difficulty,explanation
"Dóna la pilota a mi","Dóna-me-la","easy","El pronom 'em' es transforma en 'me' davant de vocal."
```

**Requirements:**
- Minimum 20-30 sentences for POC
- UTF-8 encoding
- Distribution: 12-15 easy, 5-8 medium, 3-7 hard
- Proper CSV escaping for special characters

---

## User Interface Flow

**Home Screen:**
- Game title
- "Start Playing" button
- "How to Play" link

**Game Screen:**
- Attempt counter
- Difficulty level
- Full sentence display (prominent)
- Input field
- "Check" button
- "Show Solution" button

**Feedback Screen:**
- Result (Correct/Incorrect)
- Explanation
- "Next Sentence" button

**Instructions Page:**
- Game rules
- Examples
- Tips for patterns
- Modal or separate page

---

## Development Checklist

- [ ] Create Vite + React + TypeScript project
- [ ] Install and configure Tailwind CSS
- [ ] Create folder structure (components, utils, types)
- [ ] Define TypeScript types
- [ ] Implement CSV parser
- [ ] Create Game component
- [ ] Create Feedback component
- [ ] Create Instructions component
- [ ] Implement validation logic
- [ ] Create sentences.csv with 20-30 entries
- [ ] Add responsive styling
- [ ] Test on mobile and desktop
- [ ] Verify Catalan text accuracy
- [ ] Create README
- [ ] Test error handling

---

## Build & Deployment

### Development Server
```bash
npm run dev
# Runs on http://localhost:5173
```

### Production Build
```bash
npm run build
# Generates /dist folder for deployment
```

### Deployment Options (Free Tier)
- **Vercel:** Zero-config React deployment
- **Netlify:** Easy CI/CD
- **GitHub Pages:** Static hosting

### Performance Goals
- Load time: < 2 seconds
- Lighthouse mobile score: 90+
- WCAG 2.1 AA accessibility compliance

---

## Project Resources

### Catalan Language
- Institut d'Estudis Catalans (official grammar)
- Optimot (language consultation)

### Technical Documentation
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com

### Inspiration
- Wordle: https://www.nytimes.com/games/wordle

---

## Quick Reference

**Q: What code exists?**
A: None. This is the specification phase.

**Q: What's the tech stack?**
A: React, TypeScript, Vite, Tailwind CSS

**Q: Where's the data?**
A: CSV file with 20-30 Catalan sentences

**Q: Is there a backend?**
A: Not for Phase 1

**Q: What's the target audience?**
A: Catalan language learners and speakers

---

**Status:** Ready for development
**Target Audience:** Catalan language learners
**Estimated Phase 1 Timeline:** 2-3 weeks
