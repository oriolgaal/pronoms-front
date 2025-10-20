# Hint API Specification

## Overview

The hint system allows users to request progressive hints for the current sentence. The backend splits the grammatical explanation into parts (by period `.`) and returns them one at a time.

---

## Backend Endpoint

### POST /api/hint

**Purpose**: Request a progressive hint for the current sentence

**Request Body**:
```json
{
  "sentenceId": 1,
  "hintNumber": 0
}
```

**Request Fields**:
- `sentenceId` (number, required): The current sentence ID (1-5)
- `hintNumber` (number, required): Which hint to return (0-indexed)

**Response - Success** (200 OK):
```json
{
  "hintText": "El pronom 'em' es transforma en 'me' davant de vocal",
  "hintNumber": 0,
  "totalHints": 2
}
```

**Response - No More Hints** (200 OK):
```json
{
  "hintText": null,
  "hintNumber": 2,
  "totalHints": 2
}
```

**Response - Error** (400 Bad Request):
```json
{
  "error": "Invalid sentence ID"
}
```

**Response Fields**:
- `hintText` (string | null): The hint text (null if no more hints available)
- `hintNumber` (number): The current hint index (0-indexed)
- `totalHints` (number): Total number of hints available for this sentence

---

## Backend Implementation Logic

### Algorithm

1. **Retrieve sentence data**: Get the explanation for the given `sentenceId` from CSV
2. **Split explanation**: Split the explanation string by period (`.`)
3. **Clean parts**: Remove empty strings and trim whitespace
4. **Validate hint number**: Check if `hintNumber` is within valid range (0 to totalHints-1)
5. **Return response**:
   - If valid: Return the requested hint part with position and total
   - If out of range: Return null for hintText

### Example

**Explanation in CSV**:
```
"El pronom 'em' es transforma en 'me' davant de vocal. Els pronoms es col·loquen després del verb imperatiu."
```

**Split result**:
```python
parts = [
    "El pronom 'em' es transforma en 'me' davant de vocal",
    "Els pronoms es col·loquen després del verb imperatiu"
]
# totalHints = 2
```

**Request/Response sequence**:

1. `hintNumber: 0` → Returns: `"El pronom 'em' es transforma en 'me' davant de vocal"`, `totalHints: 2`
2. `hintNumber: 1` → Returns: `"Els pronoms es col·loquen després del verb imperatiu"`, `totalHints: 2`
3. `hintNumber: 2` → Returns: `hintText: null`, `totalHints: 2` (no more hints)

### Python Implementation Example

```python
from flask import Flask, request, jsonify
import csv

app = Flask(__name__)

# Load sentences data (implement your CSV loading logic)
def load_sentences():
    # Return list of sentence dictionaries
    pass

sentences = load_sentences()

@app.route('/api/hint', methods=['POST'])
def get_hint():
    data = request.get_json()

    # Validate input
    sentence_id = data.get('sentenceId')
    hint_number = data.get('hintNumber')

    if not isinstance(sentence_id, int) or sentence_id < 1 or sentence_id > 5:
        return jsonify({'error': 'Invalid sentence ID'}), 400

    if not isinstance(hint_number, int) or hint_number < 0:
        return jsonify({'error': 'Invalid hint number'}), 400

    # Get sentence (adjust based on your data structure)
    sentence = sentences[sentence_id - 1]
    explanation = sentence['explanation']

    # Split explanation by period
    hint_parts = [part.strip() for part in explanation.split('.') if part.strip()]
    total_hints = len(hint_parts)

    # Check if hint_number is valid
    if hint_number >= total_hints:
        return jsonify({
            'hintText': None,
            'hintNumber': hint_number,
            'totalHints': total_hints
        })

    # Return the requested hint
    return jsonify({
        'hintText': hint_parts[hint_number],
        'hintNumber': hint_number,
        'totalHints': total_hints
    })
```

---

## Error Handling

**400 Bad Request** cases:
- `sentenceId` is not an integer
- `sentenceId` is not between 1 and 5
- `hintNumber` is not an integer
- `hintNumber` is negative
- Missing required fields

**500 Internal Server Error** cases:
- CSV loading errors
- Server errors

---

## Testing Checklist

### Backend Tests
- [ ] Returns first hint part when `hintNumber: 0`
- [ ] Returns second hint part when `hintNumber: 1`
- [ ] Returns `hintText: null` when `hintNumber` exceeds available hints
- [ ] Correctly counts total hints for different explanations
- [ ] Handles explanations with 1 sentence (no periods)
- [ ] Handles explanations with multiple sentences
- [ ] Trims whitespace from hint parts
- [ ] Removes empty strings from split result
- [ ] Validates `sentenceId` range (1-5)
- [ ] Validates `hintNumber` is non-negative
- [ ] Returns 400 for invalid inputs
- [ ] UTF-8 Catalan characters handled correctly

---

## Database Considerations

**Note**: The hint system does NOT require database tracking for Phase 1. Hints are read-only and do not affect game state or statistics.

**Future Enhancement** (Phase 2+):
- Track how many hints were used per sentence
- Add `hints_used` column to `sentence_attempts` table
- Use this data for statistics and leaderboards

---

## API Summary

| Endpoint | Method | Purpose | Request | Response |
|----------|--------|---------|---------|----------|
| `/api/hint` | POST | Get progressive hint | `sentenceId`, `hintNumber` | Hint text, position, total |

**Key Points**:
- Hints are 0-indexed
- Split explanation by period (`.`)
- Return null when no more hints available
- Frontend tracks current hint number
- Backend is stateless (no hint tracking in database for Phase 1)
