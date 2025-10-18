# Joc dels Pronoms Febles

An educational web game to teach **Catalan weak pronouns (pronoms febles)** using interactive gameplay. Players see full sentences and must type the shortened version using correct weak pronouns.

## Project Overview

This is a **Phase 1 Proof of Concept (POC)** - a minimal but functional web application that runs locally without backend, user accounts, or complex features. The goal is to validate the concept before investing in more advanced functionality.

## Features (Phase 1)

- ✓ Random sentence selection from CSV data
- ✓ Multiple attempts per sentence
- ✓ Simple correct/incorrect feedback
- ✓ Grammatical explanations after each attempt
- ✓ "Show solution" option available at any time
- ✓ Three difficulty levels (Fàcil, Mitjà, Difícil)
- ✓ Basic instructions/help modal
- ✓ Catalan language interface
- ✓ Responsive design (mobile & desktop)

## Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 3
- **Data:** CSV file (30 sample sentences)
- **Deployment:** Static site (no backend needed)

## Project Structure

```
pronoms_febles/
├── public/
│   ├── data/
│   │   └── sentences.csv          # Game content (30 sentences)
│   └── vite.svg                    # Favicon
├── src/
│   ├── components/
│   │   ├── Game.tsx               # Main game logic
│   │   ├── Instructions.tsx       # Rules and help modal
│   │   └── Feedback.tsx           # Result display
│   ├── utils/
│   │   └── csvParser.ts           # CSV parsing and game utilities
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # React entry point
│   ├── index.css                  # Tailwind imports and global styles
│   └── vite-env.d.ts              # Vite type definitions
├── index.html                      # HTML entry point
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite config
├── tailwind.config.js              # Tailwind config
├── postcss.config.js               # PostCSS config
├── eslint.config.js                # ESLint config
├── CLAUDE.md                       # Development guidance
├── first_phase.md                  # Phase 1 specification
└── README.md                       # This file
```

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

1. **Clone or download the project:**
   ```bash
   cd pronoms_febles
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Navigate to `http://localhost:5173`
   - The game should load immediately

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

## Data Format

The game content is stored in `/public/data/sentences.csv` with the following structure:

```csv
frase_completa,frase_curta,nivell_dificultat,explicacio
```

### Columns

- `frase_completa` - Full sentence with strong pronouns (Catalan)
- `frase_curta` - Short sentence with weak pronouns (Catalan)
- `nivell_dificultat` - `facil`, `mitja`, or `dificil`
- `explicacio` - Grammatical explanation (Catalan)

### Current Content

The CSV file contains **30 sentences** with the following distribution:
- **Easy (Fàcil):** ~15 sentences - Simple pronouns, common verbs
- **Medium (Mitjà):** ~10 sentences - Pronoun combinations
- **Hard (Difícil):** ~5 sentences - Complex combinations and special cases

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

## Success Criteria (Phase 1)

The POC is considered successful if:

- ✅ Application loads correctly at localhost
- ✅ Sentences are read and parsed from CSV
- ✅ Random sentence is displayed each time
- ✅ User can type and check their answer
- ✅ Correct/incorrect feedback is shown
- ✅ Multiple attempts are allowed
- ✅ Solution can be viewed at any time
- ✅ Explanation is shown after each exercise
- ✅ User can proceed to next sentence
- ✅ Instructions are accessible and clear
- ✅ Responsive design works on mobile and desktop
- ✅ All content is in Catalan

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

**Status:** ✅ Phase 1 POC Complete
**Last Updated:** October 2025
