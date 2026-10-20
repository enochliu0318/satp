# SAT Practice Platform

A static frontend SAT practice website with PDF-to-JSON converter and AI API PDF parsing.

## Features

- 🎯 **Digital SAT Style UI** - Passage on left, questions on right, question navigator
- ⏱️ **Timer** - Configurable per test, with pause/resume, auto-submit
- 📝 **Answer Review** - See correct/incorrect answers with explanations
- 📥 **Export Wrong Questions** - Download JSON of only missed questions
- 🔌 **Flexible Data Loading** - Local file, remote API, built-in registry, **AI API Parse PDF**
- ⌨️ **Keyboard Shortcuts** - Arrow keys to navigate, 1-4 to select, Space to pause

## Quick Start

### 1. Try the Sample
Open `frontend/index.html` in a browser (or use VS Code Live Server) and click **"Load Sample"**.

### 2. Use Your Own Questions

#### Option A: AI API Parse PDF (New!)
1. Open the site → Click **"⚙️ Configure API"** on the "AI API Parse PDF" card
2. Enter your NVIDIA API endpoint, key, and select model
3. Click **"Upload PDF to AI"** → select your PDF
4. AI extracts questions → auto-loads into practice mode

#### Option B: Convert PDFs to JSON (Python)
```bash
cd converter
pip install -r requirements.txt
python pdf_to_json.py -q "path/to/questions.pdf" -a "path/to/answers.pdf" -o "../frontend/questions"
```

#### Option C: Use AI to Generate JSON
See `frontend/questions/README.md` for the AI prompt template.

#### Option D: Load via API
Enter your API endpoint URL in the "Remote JSON API" section.

---

## 🚀 Deploy to Cloudflare Pages (Free)

### Prerequisites
- GitHub account
- Cloudflare account (free)

### Step 1: Push to GitHub
```bash
# In your local satp directory
git init
git add .
git commit -m "Initial commit: SAT Practice Platform"

# Create repo on GitHub (https://github.com/new), then:
git remote add origin https://github.com/YOUR_USERNAME/sat-practice.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Cloudflare Pages
1. Go to **Cloudflare Dashboard** → **Pages** → **Create a project**
2. **Connect to Git** → Select your GitHub repo `sat-practice`
3. Configure build settings:
   - **Project name**: `sat-practice` (or your choice)
   - **Production branch**: `main`
   - **Framework preset**: `None` (static site)
   - **Build command**: (leave empty)
   - **Build output directory**: `frontend`
   - **Root directory**: `/`
4. Click **Save and Deploy**

### Step 3: Access Your Site
- URL: `https://sat-practice.pages.dev` (or your custom domain)
- Auto-deploys on every push to `main`

### Alternative: Wrangler CLI Deploy
```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy from local
wrangler pages deploy frontend --project-name=sat-practice
```

---

## Project Structure

```
satp/
├── frontend/                 # Static website (deployed to Cloudflare)
│   ├── index.html           # Main HTML
│   ├── css/styles.css       # SAT-style theme
│   ├── js/
│   │   ├── loader.js        # Data loading (file/API/registry/AI)
│   │   └── app.js           # Main app logic + AI integration
│   └── questions/
│       ├── schema.json      # JSON Schema validation
│       ├── registry.json    # Built-in question bank index
│       ├── sample.json      # 5 sample questions
│       └── README.md        # How to add questions
├── converter/               # PDF to JSON converter (local only)
│   ├── pdf_to_json.py       # Main converter script
│   └── requirements.txt     # Python dependencies
├── wrangler.toml            # Cloudflare Pages config
├── deploy.sh                # Quick deploy script
├── .gitignore
└── README.md
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