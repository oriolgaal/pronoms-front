# Frontend Quick Reference - Hint Feature

## TL;DR

The hint button is **already implemented**. You just need the backend to create the `/api/hint` endpoint.

---

## What You See Now

A yellow "Pista" button appears next to the "Comprovar" button in the game interface.

---

## API Endpoint (Backend Must Implement)

```
POST http://localhost:8000/api/hint
```

### Request
```json
{
  "sentenceId": 1,
  "hintNumber": 0
}
```

### Response (Success)
```json
{
  "hintText": "El pronom 'em' es transforma en 'me' davant de vocal",
  "hintNumber": 0,
  "totalHints": 2
}
```

### Response (No More Hints)
```json
{
  "hintText": null,
  "hintNumber": 2,
  "totalHints": 2
}
```

---

## Backend Logic (Simple!)

```python
@app.route('/api/hint', methods=['POST'])
def get_hint():
    data = request.get_json()
    sentence_id = data['sentenceId']
    hint_number = data['hintNumber']

    # Get the explanation for this sentence
    explanation = get_explanation_for_sentence(sentence_id)

    # Split by period
    hints = [h.strip() for h in explanation.split('.') if h.strip()]

    # Return the requested hint
    if hint_number < len(hints):
        return {
            'hintText': hints[hint_number],
            'hintNumber': hint_number,
            'totalHints': len(hints)
        }
    else:
        return {
            'hintText': None,
            'hintNumber': hint_number,
            'totalHints': len(hints)
        }
```

---

## That's It!

The frontend handles:
- ✓ State management
- ✓ API calls
- ✓ UI rendering
- ✓ Button states
- ✓ Counter display
- ✓ Reset on next sentence

The backend just needs to:
- Split explanation by period
- Return the requested part

---

## Testing

1. Start backend with `/api/hint` endpoint
2. Run `npm run dev`
3. Click "Pista" button
4. Check browser network tab for API call
5. Verify hint appears in yellow box

---

## Full Documentation

- **Backend Spec**: [HINT_API_SPEC.md](HINT_API_SPEC.md)
- **Frontend Guide**: [FRONTEND_HINT_GUIDE.md](FRONTEND_HINT_GUIDE.md)
- **Implementation Summary**: [HINT_IMPLEMENTATION_SUMMARY.md](HINT_IMPLEMENTATION_SUMMARY.md)
