# SAT Practice Platform

A static frontend SAT practice website with PDF-to-JSON converter.

## Features

- 🎯 **Digital SAT Style UI** - Passage on left, questions on right, question navigator
- ⏱️ **Timer** - Configurable per test, with pause/resume, auto-submit
- 📝 **Answer Review** - See correct/incorrect answers with explanations
- 📥 **Export Wrong Questions** - Download JSON of only missed questions
- 🔌 **Flexible Data Loading** - Local file, remote API, or built-in registry
- ⌨️ **Keyboard Shortcuts** - Arrow keys to navigate, 1-4 to select, Space to pause

## Quick Start

### 1. Try the Sample
Open `frontend/index.html` in a browser (or use VS Code Live Server) and click **"Load Sample"**.

### 2. Use Your Own Questions

#### Option A: Convert PDFs to JSON (Python)
```bash
cd converter
pip install -r requirements.txt
python pdf_to_json.py -q "path/to/questions.pdf" -a "path/to/answers.pdf" -o "../frontend/questions"
```

#### Option B: Use AI to Generate JSON
See `frontend/questions/README.md` for the AI prompt template.

#### Option C: Load via API
Enter your API endpoint URL in the "Remote API" section.

## Project Structure

```
satp/
├── frontend/                 # Static website
│   ├── index.html           # Main HTML
│   ├── css/styles.css       # SAT-style theme
│   ├── js/
│   │   ├── loader.js        # Data loading (file/API/registry)
│   │   └── app.js           # Main app logic
│   └── questions/
│       ├── schema.json      # JSON Schema validation
│       ├── registry.json    # Built-in question bank index
│       ├── sample.json      # 5 sample questions
│       └── README.md        # How to add questions
└── converter/               # PDF to JSON converter
    ├── pdf_to_json.py       # Main converter script
    └── requirements.txt     # Python dependencies
```

## Data Format

The app expects JSON matching `questions/schema.json`:

```json
{
  "metadata": {
    "id": "unique-id",
    "title": "Practice Set Title",
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
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "answer": "B",
      "explanation": "Why B is correct...",
      "tags": ["main-idea", "inference"]
    }
  ]
}
```

## Converter Usage

```bash
# Single PDF pair
python pdf_to_json.py -q questions.pdf -a answers.pdf -o ./output

# Batch process directory
python pdf_to_json.py -q ./pdfs/ -a ./answers/ -o ./output -b

# Custom category
python pdf_to_json.py -q questions.pdf -c "Information & Ideas"
```

## Keyboard Shortcuts (Practice Mode)

| Key | Action |
|-----|--------|
| ← / → | Previous / Next question |
| 1 / 2 / 3 / 4 | Select option A / B / C / D |
| Space | Pause / Resume timer |
| Click nav buttons | Jump to any question |

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Requires ES2020+ (optional chaining, nullish coalescing)

## License

MIT - Feel free to use for personal SAT prep!