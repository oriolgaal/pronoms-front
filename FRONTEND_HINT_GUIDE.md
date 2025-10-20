# Frontend Integration Guide: Hint Feature

## Overview

This document explains how to integrate the progressive hint system into the frontend. The hint button reveals the grammatical explanation piece by piece, helping users understand the correct answer without showing everything at once.

---

## User Flow

1. User sees a sentence and tries to answer
2. User clicks "Pista" (Hint) button
3. First hint appears (part 1 of explanation)
4. User can click again for next hint (part 2)
5. Process continues until all hints are shown
6. When no more hints available, button is disabled or shows "No més pistes"

---

## API Endpoint

### POST /api/hint

**Request**:
```typescript
{
  sentenceId: number;  // Current sentence (1-5)
  hintNumber: number;  // Which hint to get (0-indexed)
}
```

**Response (Success)**:
```typescript
{
  hintText: string | null;  // Hint text (null if no more hints)
  hintNumber: number;       // Current hint index
  totalHints: number;       // Total hints available
}
```

---

## State Management

### Add to GameState Interface

```typescript
interface GameState {
  // ... existing fields ...
  currentHintNumber: number;  // Track which hint we're on (0-indexed)
  displayedHints: string[];   // Array of hints already shown
  totalHints: number;         // Total hints available for this sentence
  loadingHint: boolean;       // Loading state for hint button
}
```

### Initial State

```typescript
const [currentHintNumber, setCurrentHintNumber] = useState(0);
const [displayedHints, setDisplayedHints] = useState<string[]>([]);
const [totalHints, setTotalHints] = useState(0);
const [loadingHint, setLoadingHint] = useState(false);
```

---

## Implementation

### 1. Request Hint Function

```typescript
const requestHint = async () => {
  setLoadingHint(true);

  try {
    const response = await fetch('http://localhost:8000/api/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sentenceId: currentSentenceId,
        hintNumber: currentHintNumber
      })
    });

    if (!response.ok) {
      throw new Error('Error al obtenir la pista');
    }

    const data = await response.json();

    // Update state
    if (data.hintText) {
      // Add new hint to displayed hints
      setDisplayedHints(prev => [...prev, data.hintText]);
      setCurrentHintNumber(prev => prev + 1);
      setTotalHints(data.totalHints);
    } else {
      // No more hints available
      setTotalHints(data.totalHints);
    }
  } catch (error) {
    console.error('Error requesting hint:', error);
    // Show error message to user in Catalan
    alert('Error al obtenir la pista. Torna-ho a provar.');
  } finally {
    setLoadingHint(false);
  }
};
```

### 2. Reset Hints When Moving to Next Sentence

```typescript
const goToNextSentence = () => {
  if (!nextSentence) {
    setIsComplete(true);
    return;
  }

  // Reset hint state
  setCurrentHintNumber(0);
  setDisplayedHints([]);
  setTotalHints(0);

  // ... existing code to load next sentence ...
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

### 3. UI Components

#### Hint Button

```tsx
<button
  onClick={requestHint}
  disabled={
    loadingHint ||
    isCorrect === true ||  // Disable after correct answer
    (totalHints > 0 && currentHintNumber >= totalHints)  // No more hints
  }
  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
>
  {loadingHint ? 'Carregant...' : 'Pista'}
  {totalHints > 0 && ` (${currentHintNumber}/${totalHints})`}
</button>
```

#### Display Hints

```tsx
{displayedHints.length > 0 && (
  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
    <h3 className="font-bold mb-2">Pistes:</h3>
    {displayedHints.map((hint, index) => (
      <p key={index} className="mb-2">
        <span className="font-semibold">{index + 1}.</span> {hint}
      </p>
    ))}
    {currentHintNumber >= totalHints && totalHints > 0 && (
      <p className="text-sm text-gray-600 italic mt-2">
        No hi ha més pistes disponibles.
      </p>
    )}
  </div>
)}
```

---

## Complete Example Component

```tsx
import React, { useState } from 'react';

const Game: React.FC = () => {
  // ... existing state ...
  const [currentSentenceId, setCurrentSentenceId] = useState(1);
  const [currentHintNumber, setCurrentHintNumber] = useState(0);
  const [displayedHints, setDisplayedHints] = useState<string[]>([]);
  const [totalHints, setTotalHints] = useState(0);
  const [loadingHint, setLoadingHint] = useState(false);

  const requestHint = async () => {
    setLoadingHint(true);

    try {
      const response = await fetch('http://localhost:8000/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentenceId: currentSentenceId,
          hintNumber: currentHintNumber
        })
      });

      if (!response.ok) {
        throw new Error('Error al obtenir la pista');
      }

      const data = await response.json();

      if (data.hintText) {
        setDisplayedHints(prev => [...prev, data.hintText]);
        setCurrentHintNumber(prev => prev + 1);
        setTotalHints(data.totalHints);
      } else {
        setTotalHints(data.totalHints);
      }
    } catch (error) {
      console.error('Error requesting hint:', error);
      alert('Error al obtenir la pista. Torna-ho a provar.');
    } finally {
      setLoadingHint(false);
    }
  };

  const goToNextSentence = () => {
    // Reset hints
    setCurrentHintNumber(0);
    setDisplayedHints([]);
    setTotalHints(0);

    // ... rest of next sentence logic ...
  };

  return (
    <div className="game-container">
      {/* Sentence display */}
      <div className="sentence-display">
        <p>{currentSentence}</p>
      </div>

      {/* Input and buttons */}
      <div className="input-section">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Escriu la frase escurçada..."
        />
        <button onClick={checkAnswer}>Comprovar</button>
        <button
          onClick={requestHint}
          disabled={
            loadingHint ||
            isCorrect === true ||
            (totalHints > 0 && currentHintNumber >= totalHints)
          }
        >
          {loadingHint ? 'Carregant...' : 'Pista'}
          {totalHints > 0 && ` (${currentHintNumber}/${totalHints})`}
        </button>
      </div>

      {/* Display hints */}
      {displayedHints.length > 0 && (
        <div className="hints-display">
          <h3>Pistes:</h3>
          {displayedHints.map((hint, index) => (
            <p key={index}>
              <strong>{index + 1}.</strong> {hint}
            </p>
          ))}
          {currentHintNumber >= totalHints && totalHints > 0 && (
            <p className="no-more-hints">No hi ha més pistes disponibles.</p>
          )}
        </div>
      )}

      {/* Feedback and next button */}
      {/* ... existing feedback component ... */}
    </div>
  );
};

export default Game;
```

---

## Styling Recommendations

### Hint Button States

```css
/* Normal state */
.hint-button {
  background-color: #3b82f6;  /* Blue */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.hint-button:hover {
  background-color: #2563eb;  /* Darker blue */
}

/* Disabled state */
.hint-button:disabled {
  background-color: #d1d5db;  /* Gray */
  cursor: not-allowed;
  opacity: 0.5;
}

/* Loading state */
.hint-button.loading {
  opacity: 0.7;
  cursor: wait;
}
```

### Hint Display

```css
.hints-display {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fef3c7;  /* Light yellow */
  border: 1px solid #fbbf24;  /* Yellow border */
  border-radius: 0.375rem;
}

.hints-display h3 {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.hints-display p {
  margin-bottom: 0.5rem;
}

.no-more-hints {
  font-style: italic;
  color: #6b7280;  /* Gray */
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
```

---

## User Experience Guidelines

### When to Show Hint Button
- **Show**: During active gameplay (before correct answer)
- **Hide or Disable**: After correct answer is submitted

### Button Text Options
- **Default**: "Pista" or "Demana pista"
- **With counter**: "Pista (0/2)"
- **Loading**: "Carregant..."
- **No more hints**: Button disabled or text changes to "No més pistes"

### Hint Display
- Show hints in a visually distinct area (yellow/light background)
- Number each hint (1., 2., 3., etc.)
- Keep previous hints visible
- Show message when all hints are exhausted

### Accessibility
- Add ARIA labels for screen readers
- Ensure keyboard navigation works
- Use semantic HTML (`<button>`, not `<div>`)
- Provide loading states

---

## Testing Checklist

### Frontend Tests
- [ ] Hint button appears on game screen
- [ ] Clicking hint button requests first hint (hintNumber: 0)
- [ ] First hint displays correctly
- [ ] Clicking again requests second hint (hintNumber: 1)
- [ ] Multiple hints stack vertically
- [ ] Button shows counter (e.g., "1/2", "2/2")
- [ ] Button disables when all hints are shown
- [ ] "No more hints" message appears
- [ ] Hints reset when moving to next sentence
- [ ] Hint button disables after correct answer
- [ ] Loading state shows while fetching hint
- [ ] Error handling shows user-friendly message
- [ ] Catalan characters display correctly

---

## API Error Handling

```typescript
const requestHint = async () => {
  setLoadingHint(true);

  try {
    const response = await fetch('http://localhost:8000/api/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sentenceId: currentSentenceId,
        hintNumber: currentHintNumber
      })
    });

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Petició invàlida');
      } else if (response.status === 500) {
        throw new Error('Error del servidor');
      } else {
        throw new Error('Error desconegut');
      }
    }

    const data = await response.json();

    // Handle empty response
    if (!data) {
      throw new Error('Resposta buida del servidor');
    }

    // Process hint data
    if (data.hintText) {
      setDisplayedHints(prev => [...prev, data.hintText]);
      setCurrentHintNumber(prev => prev + 1);
      setTotalHints(data.totalHints);
    } else {
      setTotalHints(data.totalHints);
    }
  } catch (error) {
    console.error('Error requesting hint:', error);
    // Show user-friendly error in Catalan
    alert('Error al obtenir la pista. Torna-ho a provar.');
  } finally {
    setLoadingHint(false);
  }
};
```

---

## Summary for Frontend Team

### What You Need to Implement

1. **State Management**:
   - Add `currentHintNumber`, `displayedHints`, `totalHints`, `loadingHint` to state
   - Reset hint state when moving to next sentence

2. **API Call**:
   - POST to `/api/hint` with `sentenceId` and `hintNumber`
   - Handle response and update state

3. **UI Components**:
   - Add "Pista" button next to "Comprovar" button
   - Display hints in a yellow/highlighted box
   - Show hint counter (X/Y)
   - Disable button when no more hints

4. **User Experience**:
   - Show loading state
   - Handle errors gracefully
   - Stack hints vertically
   - Reset on next sentence

### API Endpoint

```
POST http://localhost:8000/api/hint
Content-Type: application/json

{
  "sentenceId": 1,
  "hintNumber": 0
}
```

### Response Format

```json
{
  "hintText": "El pronom 'em' es transforma en 'me' davant de vocal",
  "hintNumber": 0,
  "totalHints": 2
}
```

### Key Points
- Hints are 0-indexed (0, 1, 2, ...)
- `hintText` is `null` when no more hints available
- Frontend tracks current hint number
- Reset hint state on next sentence
- Disable hint button after correct answer
