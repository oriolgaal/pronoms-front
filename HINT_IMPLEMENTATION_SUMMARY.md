# Hint Feature Implementation Summary

## What Was Implemented

The hint feature has been **fully implemented** in the frontend. Users can now request progressive hints that reveal the grammatical explanation piece by piece.

---

## Changes Made

### 1. Type Definitions ([src/types/index.ts](src/types/index.ts))

Added new interfaces for hint functionality:

```typescript
export interface HintRequest {
  sentenceId: number;
  hintNumber: number;
}

export interface HintResponse {
  hintText: string | null;
  hintNumber: number;
  totalHints: number;
}
```

### 2. API Service ([src/utils/apiService.ts](src/utils/apiService.ts))

Added `fetchHint()` function:

```typescript
export async function fetchHint(request: HintRequest): Promise<HintResponse>
```

- Sends POST request to `/api/hint`
- Validates response structure
- Handles errors gracefully

### 3. Game Component ([src/components/Game.tsx](src/components/Game.tsx))

#### New State Variables:
- `currentHintNumber`: Tracks which hint we're on (0-indexed)
- `displayedHints`: Array of hints already shown
- `totalHints`: Total hints available for current sentence
- `loadingHint`: Loading state for hint button

#### New Functions:
- `requestHint()`: Fetches hints from API
- Updated `handleNext()`: Resets hint state when moving to next sentence

#### New UI Elements:
- **Hint Button**: Yellow button next to "Comprovar" button
  - Shows "Pista" text
  - Displays counter: "Pista (1/2)"
  - Shows "Carregant..." when loading
  - Disabled when: loading, answer is correct, or all hints shown

- **Hints Display**: Yellow box showing all requested hints
  - Numbered list (1., 2., 3., etc.)
  - Visible only when hints have been requested
  - Shows "No hi ha més pistes disponibles" when exhausted

---

## How It Works

### User Flow

1. User sees a sentence and input field
2. User clicks "Pista" button
3. First hint appears in yellow box below
4. User can click "Pista" again for next hint
5. Button shows counter: "Pista (1/2)", "Pista (2/2)", etc.
6. When all hints shown, button is disabled
7. When user moves to next sentence, hints reset

### Technical Flow

```
User clicks "Pista"
  ↓
requestHint() called
  ↓
fetchHint() sends POST to /api/hint
  ↓
Backend splits explanation by "." and returns hint part
  ↓
Frontend adds hint to displayedHints array
  ↓
UI renders hint in yellow box
  ↓
currentHintNumber incremented for next request
```

---

## API Integration

### Endpoint

```
POST http://localhost:8000/api/hint
Content-Type: application/json

{
  "sentenceId": 1,
  "hintNumber": 0
}
```

### Response

```json
{
  "hintText": "El pronom 'em' es transforma en 'me' davant de vocal",
  "hintNumber": 0,
  "totalHints": 2
}
```

When no more hints available:
```json
{
  "hintText": null,
  "hintNumber": 2,
  "totalHints": 2
}
```

---

## What Backend Needs to Implement

The backend must implement the `/api/hint` endpoint that:

1. **Accepts POST request** with:
   - `sentenceId` (number, 1-5)
   - `hintNumber` (number, 0-indexed)

2. **Splits explanation by period (.)**:
   ```python
   explanation = "Sentence one. Sentence two. Sentence three."
   parts = [part.strip() for part in explanation.split('.') if part.strip()]
   # Result: ["Sentence one", "Sentence two", "Sentence three"]
   ```

3. **Returns response**:
   - `hintText`: The requested hint part (or null if out of range)
   - `hintNumber`: Echo back the request number
   - `totalHints`: Total number of hint parts available

4. **Validates input**:
   - `sentenceId` must be 1-5
   - `hintNumber` must be non-negative integer
   - Return 400 for invalid input

### Backend Implementation Example

See [HINT_API_SPEC.md](HINT_API_SPEC.md) for complete backend specification with Python/Flask example code.

---

## Testing Checklist

### Frontend (Completed ✓)
- [x] Hint button appears on game screen
- [x] Button styled with yellow background
- [x] Button positioned next to "Comprovar" button
- [x] TypeScript types defined
- [x] API service function created
- [x] State management implemented
- [x] Hints display in yellow box
- [x] Hints reset on next sentence
- [x] Build completes without errors

### Backend (Required)
- [ ] `/api/hint` endpoint exists
- [ ] Accepts POST requests with JSON body
- [ ] Splits explanation by period
- [ ] Returns correct hint for hintNumber 0
- [ ] Returns correct hint for hintNumber 1
- [ ] Returns null when hintNumber exceeds available hints
- [ ] Returns totalHints correctly
- [ ] Validates sentenceId (1-5)
- [ ] Validates hintNumber (>= 0)
- [ ] Returns 400 for invalid input
- [ ] Handles UTF-8 Catalan characters

### Integration Testing (After Backend Ready)
- [ ] First hint request works
- [ ] Second hint request works
- [ ] Multiple hints stack vertically
- [ ] Counter displays correctly
- [ ] Button disables when all hints shown
- [ ] "No more hints" message appears
- [ ] Hints reset on next sentence
- [ ] Error handling works
- [ ] Loading state shows correctly

---

## Files Modified

1. [src/types/index.ts](src/types/index.ts) - Added `HintRequest` and `HintResponse` interfaces
2. [src/utils/apiService.ts](src/utils/apiService.ts) - Added `fetchHint()` function
3. [src/components/Game.tsx](src/components/Game.tsx) - Added hint state, UI, and logic

---

## Next Steps

### For Backend Team

1. **Read the spec**: Review [HINT_API_SPEC.md](HINT_API_SPEC.md)
2. **Implement endpoint**: Create POST `/api/hint` endpoint
3. **Test manually**: Use curl or Postman to test
4. **Validate integration**: Test with frontend running

### For Frontend Team

1. **Test when backend ready**: Start dev server with `npm run dev`
2. **Verify functionality**: Click hint button and verify requests
3. **Test edge cases**: Try all hints, invalid states, errors
4. **Report issues**: Log any bugs or unexpected behavior

---

## Visual Example

### Before Clicking Hint:
```
┌─────────────────────────────────────┐
│ Frase original:                     │
│ Dóna la pilota a mi                 │
│                                     │
│ Escriu la frase curta:              │
│ [________________]                  │
│                                     │
│ [Comprovar] [Pista]                 │
└─────────────────────────────────────┘
```

### After Clicking Hint Once:
```
┌─────────────────────────────────────┐
│ Frase original:                     │
│ Dóna la pilota a mi                 │
│                                     │
│ Escriu la frase curta:              │
│ [________________]                  │
│                                     │
│ [Comprovar] [Pista (1/2)]           │
│                                     │
│ ┌─ Pistes: ─────────────────────┐  │
│ │ 1. El pronom 'em' es          │  │
│ │    transforma en 'me'         │  │
│ │    davant de vocal            │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### After Clicking Hint Twice (All Hints Shown):
```
┌─────────────────────────────────────┐
│ Frase original:                     │
│ Dóna la pilota a mi                 │
│                                     │
│ Escriu la frase curta:              │
│ [________________]                  │
│                                     │
│ [Comprovar] [Pista (2/2)] [disabled]│
│                                     │
│ ┌─ Pistes: ─────────────────────┐  │
│ │ 1. El pronom 'em' es          │  │
│ │    transforma en 'me'         │  │
│ │    davant de vocal            │  │
│ │ 2. Els pronoms es col·loquen  │  │
│ │    després del verb imperatiu │  │
│ │                               │  │
│ │ No hi ha més pistes           │  │
│ │ disponibles.                  │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## Summary

✅ **Frontend implementation is complete and ready**
⏳ **Waiting for backend to implement `/api/hint` endpoint**
📖 **Backend spec available in [HINT_API_SPEC.md](HINT_API_SPEC.md)**
🎨 **UI follows existing design patterns with yellow theme for hints**
🔄 **Hint state properly resets on next sentence**
🛡️ **Error handling implemented**
✨ **Build passes with no TypeScript errors**

Once the backend implements the `/api/hint` endpoint according to the specification, the feature will be fully functional!
