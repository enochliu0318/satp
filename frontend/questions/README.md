# Questions Folder

This folder contains SAT practice question banks in JSON format.

## Structure

```
questions/
├── schema.json          # JSON Schema for validation
├── registry.json        # Index of available question banks
├── sample.json          # Sample questions (5 questions)
└── your-bank.json       # Your custom question banks
```

## Adding Your Own Question Banks

### 1. Prepare JSON File

Create a JSON file following the schema in `schema.json`. The structure:

```json
{
  "metadata": {
    "id": "unique-id",
    "title": "Display Title",
    "category": "Information & Ideas",
    "totalQuestions": 52,
    "timeLimitMinutes": 35,
    "source": "Source description",
    "generatedAt": "2026-10-19T20:00:00Z"
  },
  "questions": [
    {
      "id": 1,
      "passage": "Passage text...",
      "question": "Question text?",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "answer": "B",
      "explanation": "Explanation text (optional)",
      "tags": ["main-idea", "inference"]
    }
  ]
}
```

### 2. Register in registry.json

Add an entry to `registry.json`:

```json
{
  "your-bank-id": {
    "id": "your-bank-id",
    "title": "Your Bank Title",
    "file": "your-bank.json",
    "category": "Information & Ideas",
    "totalQuestions": 52,
    "timeLimitMinutes": 35
  }
}
```

### 3. Place File

Put your JSON file in this folder. It will appear in the "Built-in Practice Sets" dropdown.

## AI Generation Prompt Template

Use this prompt with AI to convert your PDF/text to JSON:

> Convert the following SAT practice questions to JSON format matching this schema:
>
> ```json
> {
>   "metadata": { "id": "...", "title": "...", "category": "...", "totalQuestions": N, "timeLimitMinutes": 35, "source": "...", "generatedAt": "ISO_DATE" },
>   "questions": [
>     { "id": 1, "passage": "...", "question": "...", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "answer": "B", "explanation": "...", "tags": [] }
>   ]
> }
> ```
>
> Rules:
> 1. Each question MUST have options A, B, C, D
> 2. answer must be exactly "A", "B", "C", or "D"
> 3. passage can be empty string "" for standalone questions
> 4. explanation and tags are optional
> 5. Output ONLY valid JSON, no markdown
>
> Questions to convert:
> [PASTE YOUR QUESTIONS HERE]

## Validation

Before adding, validate your JSON:
- Use the schema at `schema.json`
- Or load in the app - it will validate automatically

## File Naming

- Use lowercase with hyphens: `info-ideas-1.json`, `craft-structure-2.json`
- Keep IDs consistent with filename