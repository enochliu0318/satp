/**
 * SAT Practice App - Core application logic
 * Handles question navigation, answering, timing, scoring, and review
 */

class SATApp {
  constructor() {
    this.bank = null;
    this.currentIndex = 0;
    this.userAnswers = {}; // questionId -> 'A'|'B'|'C'|'D'
    this.startTime = null;
    this.timerInterval = null;
    this.timeLimit = 0; // seconds
    this.isPaused = false;
    this.isSubmitted = false;
    this.elapsedBeforePause = 0;
    
    // AI API Proxy URL - REPLACE YOUR_SUBDOMAIN with your Cloudflare account subdomain
    // Format: https://satp-ai-proxy.YOUR_SUBDOMAIN.workers.dev
    // Find your subdomain: Cloudflare Dashboard → Workers & Pages → Overview → "Subdomain"
    // Example: if your Pages URL is satp.pages.dev, subdomain might be "enochliu0318"
    this.aiProxyUrl = 'https://satp-ai-proxy.YOUR_SUBDOMAIN.workers.dev';
    
    // DOM elements
    this.elements = {};
    this.bindElements();
    this.bindEvents();
    this.showWelcomeScreen();
  }

  bindElements() {
    // Screens
    this.elements.welcomeScreen = document.getElementById('welcome-screen');
    this.elements.practiceScreen = document.getElementById('practice-screen');
    this.elements.resultsScreen = document.getElementById('results-screen');
    this.elements.reviewScreen = document.getElementById('review-screen');
    
    // Welcome screen
    this.elements.fileInput = document.getElementById('file-input');
    this.elements.apiUrlInput = document.getElementById('api-url-input');
    this.elements.apiKeyInput = document.getElementById('api-key-input');
    this.elements.registrySelect = document.getElementById('registry-select');
    this.elements.loadFileBtn = document.getElementById('load-file-btn');
    this.elements.loadApiBtn = document.getElementById('load-api-btn');
    this.elements.loadRegistryBtn = document.getElementById('load-registry-btn');
    this.elements.loadSampleBtn = document.getElementById('load-sample-btn');
    this.elements.loadingIndicator = document.getElementById('loading-indicator');
    
    // AI API elements
    this.elements.aiPdfInput = document.getElementById('ai-pdf-input');
    this.elements.loadAiPdfBtn = document.getElementById('load-ai-pdf-btn');
    this.elements.aiApiUrl = document.getElementById('ai-api-url');
    this.elements.aiApiKey = document.getElementById('ai-api-key');
    this.elements.aiModel = document.getElementById('ai-model');
    this.elements.aiPrompt = document.getElementById('ai-prompt');
    this.elements.aiConfig = document.getElementById('ai-config');
    this.elements.toggleAiConfig = document.getElementById('toggle-ai-config');
    
    // Practice screen
    this.elements.timerDisplay = document.getElementById('timer-display');
    this.elements.progressText = document.getElementById('progress-text');
    this.elements.progressBar = document.getElementById('progress-bar');
    this.elements.passageContent = document.getElementById('passage-content');
    this.elements.questionNumber = document.getElementById('question-number');
    this.elements.questionText = document.getElementById('question-text');
    this.elements.optionsContainer = document.getElementById('options-container');
    this.elements.prevBtn = document.getElementById('prev-btn');
    this.elements.nextBtn = document.getElementById('next-btn');
    this.elements.submitBtn = document.getElementById('submit-btn');
    this.elements.questionNav = document.getElementById('question-nav');
    this.elements.pauseBtn = document.getElementById('pause-btn');
    
    // Results screen
    this.elements.scoreDisplay = document.getElementById('score-display');
    this.elements.correctCount = document.getElementById('correct-count');
    this.elements.totalCount = document.getElementById('total-count');
    this.elements.timeTaken = document.getElementById('time-taken');
    this.elements.reviewBtn = document.getElementById('review-btn');
    this.elements.restartBtn = document.getElementById('restart-btn');
    
    // Review screen
    this.elements.reviewList = document.getElementById('review-list');
    this.elements.backToResultsBtn = document.getElementById('back-to-results-btn');
    this.elements.exportWrongBtn = document.getElementById('export-wrong-btn');
  }

  bindEvents() {
    // Welcome screen
    this.elements.loadFileBtn.addEventListener('click', () => this.elements.fileInput.click());
    this.elements.fileInput.addEventListener('change', (e) => this.handleFileLoad(e.target.files[0]));
    this.elements.loadApiBtn.addEventListener('click', () => this.handleApiLoad());
    this.elements.loadRegistryBtn.addEventListener('click', () => this.handleRegistryLoad());
    this.elements.loadSampleBtn.addEventListener('click', () => this.loadSample());
    
    // AI API events
    this.elements.loadAiPdfBtn.addEventListener('click', () => this.elements.aiPdfInput.click());
    this.elements.aiPdfInput.addEventListener('change', (e) => this.handleAiPdfLoad(e.target.files[0]));
    this.elements.toggleAiConfig.addEventListener('click', () => this.toggleAiConfig());
    
    // Practice screen
    this.elements.prevBtn.addEventListener('click', () => this.navigate(-1));
    this.elements.nextBtn.addEventListener('click', () => this.navigate(1));
    this.elements.submitBtn.addEventListener('click', () => this.submit());
    this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
    
    // Results screen
    this.elements.reviewBtn.addEventListener('click', () => this.showReview());
    this.elements.restartBtn.addEventListener('click', () => this.restart());
    
    // Review screen
    this.elements.backToResultsBtn.addEventListener('click', () => this.showResults());
    this.elements.exportWrongBtn.addEventListener('click', () => this.exportWrongQuestions());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  // ==================== Welcome Screen ====================
  
  showWelcomeScreen() {
    this.hideAllScreens();
    this.elements.welcomeScreen.classList.remove('hidden');
    this.populateRegistry();
  }

  async populateRegistry() {
    try {
      const items = await QuestionLoader.listRegistry();
      this.elements.registrySelect.innerHTML = '<option value="">-- Select a practice set --</option>';
      items.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.textContent = `${item.title} (${item.totalQuestions} questions)`;
        this.elements.registrySelect.appendChild(opt);
      });
      this.elements.loadRegistryBtn.disabled = items.length === 0;
    } catch (e) {
      this.elements.loadRegistryBtn.disabled = true;
    }
  }

  async handleFileLoad(file) {
    if (!file) return;
    this.setLoading(true);
    try {
      this.bank = await QuestionLoader.fromFile(file);
      this.startPractice();
    } catch (e) {
      this.showError(`Failed to load file: ${e.message}`);
    } finally {
      this.setLoading(false);
      this.elements.fileInput.value = '';
    }
  }

  async handleApiLoad() {
    const url = this.elements.apiUrlInput.value.trim();
    const apiKey = this.elements.apiKeyInput.value.trim() || null;
    if (!url) {
      this.showError('Please enter an API URL');
      return;
    }
    this.setLoading(true);
    try {
      this.bank = await QuestionLoader.fromAPI(url, apiKey);
      this.startPractice();
    } catch (e) {
      this.showError(`API load failed: ${e.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  async handleRegistryLoad() {
    const id = this.elements.registrySelect.value;
    if (!id) {
      this.showError('Please select a practice set');
      return;
    }
    this.setLoading(true);
    try {
      this.bank = await QuestionLoader.fromRegistry(id);
      this.startPractice();
    } catch (e) {
      this.showError(`Failed to load: ${e.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  async loadSample() {
    this.setLoading(true);
    try {
      const response = await fetch('questions/sample.json');
      const data = await response.json();
      this.bank = QuestionLoader.validateAndNormalize(data);
      this.startPractice();
    } catch (e) {
      this.showError(`Failed to load sample: ${e.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  toggleAiConfig() {
    this.elements.aiConfig.classList.toggle('visible');
    this.elements.toggleAiConfig.textContent = this.elements.aiConfig.classList.contains('visible')
      ? '⚙️ Hide API Config'
      : '⚙️ Configure API';
  }

  async handleAiPdfLoad(file) {
    if (!file) return;
    if (!file.name.endsWith('.pdf')) {
      this.showError('Please select a PDF file');
      return;
    }

    const apiUrl = this.elements.aiApiUrl.value.trim();
    const apiKey = this.elements.aiApiKey.value.trim();
    const model = this.elements.aiModel.value;
    const customPrompt = this.elements.aiPrompt.value.trim();

    if (!apiUrl || !apiKey) {
      this.showError('Please configure API endpoint and key first (click Configure API)');
      this.elements.aiConfig.classList.add('visible');
      this.elements.toggleAiConfig.textContent = '⚙️ Hide API Config';
      return;
    }

    this.setLoading(true);
    this.elements.loadingIndicator.querySelector('p').textContent = 'Uploading PDF to AI...';

    try {
      // Convert PDF to base64
      const base64 = await this.fileToBase64(file);
      
      // Build the prompt
      const prompt = customPrompt || this.getDefaultPrompt();
      
      // Call the AI API
      this.bank = await this.callAiApi(apiUrl, apiKey, model, base64, prompt, file.name);
      
      this.startPractice();
    } catch (e) {
      this.showError(`AI parsing failed: ${e.message}`);
    } finally {
      this.setLoading(false);
      this.elements.loadingIndicator.querySelector('p').textContent = 'Loading questions...';
      this.elements.aiPdfInput.value = '';
    }
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  getDefaultPrompt() {
    return `You are an SAT question extractor. Parse the provided PDF content and extract all SAT Reading & Writing questions into a strict JSON format.

Output ONLY valid JSON matching this schema:
{
  "metadata": {
    "id": "auto-generated",
    "title": "Extracted from PDF",
    "category": "Information & Ideas",
    "totalQuestions": N,
    "timeLimitMinutes": 35,
    "source": "PDF upload via AI",
    "generatedAt": "ISO_DATE"
  },
  "questions": [
    {
      "id": 1,
      "passage": "Full passage text (empty string if none)",
      "question": "Question text",
      "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
      "answer": "B",
      "explanation": "Explanation if available",
      "tags": ["main-idea", "inference"]
    }
  ]
}

Rules:
1. Every question MUST have all 4 options (A, B, C, D)
2. answer must be exactly "A", "B", "C", or "D"
3. passage can be empty string "" for standalone questions
4. Include explanation if available in source
5. Output ONLY JSON, no markdown, no extra text`;
  }

  async callAiApi(apiUrl, apiKey, model, pdfBase64, prompt, filename) {
    // NVIDIA API format (adjust for your specific API)
    const payload = {
      model: model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { 
              type: "file", 
              file: {
                filename: filename,
                file_data: pdfBase64
              }
            }
          ]
        }
      ],
      max_tokens: 8192,
      temperature: 0.1
    };

    // Use proxy if configured, otherwise direct call
    const targetUrl = this.aiProxyUrl 
      ? this.aiProxyUrl 
      : apiUrl;
    
    const requestBody = this.aiProxyUrl
      ? { apiUrl, apiKey, payload }
      : payload;

    const headers = this.aiProxyUrl
      ? { 'Content-Type': 'application/json' }
      : { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API ${response.status}: ${err}`);
    }

    const data = await response.json();
    
    // Extract JSON from response (handle different API formats)
    let content = '';
    if (data.choices?.[0]?.message?.content) {
      content = data.choices[0].message.content;
    } else if (data.output?.text) {
      content = data.output.text;
    } else if (data.response) {
      content = data.response;
    } else if (data.choices?.[0]?.message?.content === undefined && data.error) {
      // Proxy error response
      throw new Error(data.error.message || JSON.stringify(data.error));
    } else {
      throw new Error('Unexpected API response format');
    }

    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return QuestionLoader.validateAndNormalize(parsed);
  }

  // ==================== Practice Screen ====================
  
  startPractice() {
    this.currentIndex = 0;
    this.userAnswers = {};
    this.isSubmitted = false;
    this.isPaused = false;
    this.elapsedBeforePause = 0;
    
    // Set time limit from metadata (default 35 min per module)
    this.timeLimit = (this.bank.metadata.timeLimitMinutes || 35) * 60;
    this.startTime = Date.now();
    
    this.hideAllScreens();
    this.elements.practiceScreen.classList.remove('hidden');
    this.renderQuestion();
    this.renderNav();
    this.startTimer();
  }

  renderQuestion() {
    const q = this.bank.questions[this.currentIndex];
    
    // Update progress
    this.elements.progressText.textContent = `Question ${this.currentIndex + 1} of ${this.bank.questions.length}`;
    this.elements.progressBar.style.width = `${((this.currentIndex + 1) / this.bank.questions.length) * 100}%`;
    this.elements.questionNumber.textContent = `${this.currentIndex + 1}.`;
    
    // Passage
    if (q.passage && q.passage.trim()) {
      this.elements.passageContent.innerHTML = this.formatPassage(q.passage);
      this.elements.passageContent.parentElement.classList.remove('hidden');
    } else {
      this.elements.passageContent.parentElement.classList.add('hidden');
    }
    
    // Question
    this.elements.questionText.textContent = q.question;
    
    // Options
    this.elements.optionsContainer.innerHTML = '';
    ['A', 'B', 'C', 'D'].forEach(letter => {
      const opt = document.createElement('div');
      opt.className = 'option';
      opt.dataset.letter = letter;
      if (this.userAnswers[q.id] === letter) {
        opt.classList.add('selected');
      }
      opt.innerHTML = `
        <span class="option-letter">${letter}</span>
        <span class="option-text">${this.escapeHtml(q.options[letter])}</span>
      `;
      opt.addEventListener('click', () => this.selectOption(q.id, letter));
      this.elements.optionsContainer.appendChild(opt);
    });
    
    // Navigation buttons
    this.elements.prevBtn.disabled = this.currentIndex === 0;
    this.elements.nextBtn.disabled = this.currentIndex === this.bank.questions.length - 1;
    this.elements.submitBtn.classList.toggle('hidden', this.currentIndex !== this.bank.questions.length - 1);
    this.elements.nextBtn.classList.toggle('hidden', this.currentIndex === this.bank.questions.length - 1);
  }

  renderNav() {
    this.elements.questionNav.innerHTML = '';
    this.bank.questions.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.className = 'nav-btn';
      btn.textContent = idx + 1;
      btn.dataset.index = idx;
      if (idx === this.currentIndex) btn.classList.add('current');
      if (this.userAnswers[q.id]) btn.classList.add('answered');
      btn.addEventListener('click', () => this.goToQuestion(idx));
      this.elements.questionNav.appendChild(btn);
    });
  }

  formatPassage(text) {
    // Preserve paragraphs, escape HTML
    return this.escapeHtml(text).replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  selectOption(questionId, letter) {
    if (this.isSubmitted) return;
    this.userAnswers[questionId] = letter;
    this.renderQuestion();
    this.renderNav();
  }

  navigate(delta) {
    const newIndex = this.currentIndex + delta;
    if (newIndex >= 0 && newIndex < this.bank.questions.length) {
      this.goToQuestion(newIndex);
    }
  }

  goToQuestion(index) {
    this.currentIndex = index;
    this.renderQuestion();
    this.renderNav();
  }

  handleKeydown(e) {
    if (this.elements.practiceScreen.classList.contains('hidden')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.navigate(-1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.navigate(1);
        break;
      case '1': case '2': case '3': case '4':
        if (!this.isSubmitted) {
          const letters = ['A', 'B', 'C', 'D'];
          this.selectOption(this.bank.questions[this.currentIndex].id, letters[e.key - '1']);
        }
        break;
      case ' ':
        e.preventDefault();
        this.togglePause();
        break;
    }
  }

  // ==================== Timer ====================
  
  startTimer() {
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    this.updateTimer();
  }

  updateTimer() {
    if (this.isPaused) return;
    
    const elapsed = this.elapsedBeforePause + Math.floor((Date.now() - this.startTime) / 1000);
    const remaining = Math.max(0, this.timeLimit - elapsed);
    
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    this.elements.timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    // Warning colors
    this.elements.timerDisplay.classList.remove('warning', 'danger');
    if (remaining <= 60) this.elements.timerDisplay.classList.add('danger');
    else if (remaining <= 300) this.elements.timerDisplay.classList.add('warning');
    
    // Auto-submit when time runs out
    if (remaining <= 0) {
      this.submit();
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.elements.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
    this.elements.pauseBtn.classList.toggle('paused', this.isPaused);
    
    if (!this.isPaused) {
      this.startTime = Date.now();
    } else {
      this.elapsedBeforePause += Math.floor((Date.now() - this.startTime) / 1000);
    }
  }

  getElapsedTime() {
    if (this.isPaused) {
      return this.elapsedBeforePause;
    }
    return this.elapsedBeforePause + Math.floor((Date.now() - this.startTime) / 1000);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // ==================== Submit & Results ====================
  
  submit() {
    if (this.isSubmitted) return;
    this.isSubmitted = true;
    clearInterval(this.timerInterval);
    
    this.calculateScore();
    this.showResults();
  }

  calculateScore() {
    let correct = 0;
    this.bank.questions.forEach(q => {
      if (this.userAnswers[q.id] === q.answer) {
        correct++;
      }
    });
    this.score = correct;
    this.total = this.bank.questions.length;
  }

  showResults() {
    this.hideAllScreens();
    this.elements.resultsScreen.classList.remove('hidden');
    
    const percentage = Math.round((this.score / this.total) * 100);
    this.elements.scoreDisplay.textContent = `${percentage}%`;
    this.elements.scoreDisplay.className = 'score-display ' + (percentage >= 70 ? 'pass' : 'fail');
    this.elements.correctCount.textContent = this.score;
    this.elements.totalCount.textContent = this.total;
    this.elements.timeTaken.textContent = this.formatTime(this.getElapsedTime());
  }

  // ==================== Review ====================
  
  showReview() {
    this.hideAllScreens();
    this.elements.reviewScreen.classList.remove('hidden');
    this.renderReview();
  }

  renderReview() {
    this.elements.reviewList.innerHTML = '';
    
    this.bank.questions.forEach((q, idx) => {
      const userAnswer = this.userAnswers[q.id] || '—';
      const isCorrect = userAnswer === q.answer;
      
      const item = document.createElement('div');
      item.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
      item.innerHTML = `
        <div class="review-header">
          <span class="review-question-num">Question ${idx + 1}</span>
          <span class="review-status">${isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
        </div>
        ${q.passage && q.passage.trim() ? `
        <div class="review-passage">
          <strong>Passage:</strong>
          <div class="passage-text">${this.formatPassage(q.passage)}</div>
        </div>
        ` : ''}
        <div class="review-question"><strong>Question:</strong> ${this.escapeHtml(q.question)}</div>
        <div class="review-options">
          ${['A', 'B', 'C', 'D'].map(letter => `
            <div class="review-option ${letter === q.answer ? 'correct-answer' : ''} ${letter === userAnswer && letter !== q.answer ? 'your-wrong-answer' : ''}">
              <span class="option-letter">${letter}</span>
              <span class="option-text">${this.escapeHtml(q.options[letter])}</span>
              ${letter === q.answer ? '<span class="answer-badge">Correct</span>' : ''}
              ${letter === userAnswer && letter !== q.answer ? '<span class="answer-badge your-choice">Your Choice</span>' : ''}
            </div>
          `).join('')}
        </div>
        ${q.explanation ? `
        <div class="review-explanation">
          <strong>Explanation:</strong> ${this.escapeHtml(q.explanation)}
        </div>
        ` : ''}
      `;
      this.elements.reviewList.appendChild(item);
    });
  }

  exportWrongQuestions() {
    const wrongQuestions = this.bank.questions.filter(q => this.userAnswers[q.id] !== q.answer);
    if (wrongQuestions.length === 0) {
      alert('No wrong questions to export! Great job!');
      return;
    }
    
    const exportData = {
      metadata: {
        ...this.bank.metadata,
        id: this.bank.metadata.id + '-wrong',
        title: this.bank.metadata.title + ' - Wrong Questions Only',
        totalQuestions: wrongQuestions.length,
        generatedAt: new Date().toISOString()
      },
      questions: wrongQuestions.map((q, idx) => ({
        ...q,
        id: idx + 1,
        userAnswer: this.userAnswers[q.id]
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wrong-questions-${this.bank.metadata.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ==================== Utility ====================
  
  showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  setLoading(loading) {
    this.elements.loadingIndicator.classList.toggle('hidden', !loading);
    this.elements.loadFileBtn.disabled = loading;
    this.elements.loadApiBtn.disabled = loading;
    this.elements.loadRegistryBtn.disabled = loading;
    this.elements.loadSampleBtn.disabled = loading;
  }

  hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  }

  restart() {
    this.showWelcomeScreen();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.satApp = new SATApp();
});