/**
 * SAT Question Loader - Unified data loading interface
 * Supports 3 data sources: local file, remote API, built-in registry
 */

class QuestionLoader {
  /**
   * Load from local JSON file (File object from input)
   * @param {File} file - JSON file from file input
   * @returns {Promise<SATQuestionBank>}
   */
  static async fromFile(file) {
    if (!file) throw new Error('No file provided');
    if (!file.name.endsWith('.json')) throw new Error('File must be a JSON file');
    
    const text = await file.text();
    const data = JSON.parse(text);
    return this.validateAndNormalize(data);
  }

  /**
   * Load from remote API endpoint
   * @param {string} url - API endpoint returning SATQuestionBank JSON
   * @param {string} [apiKey] - Optional Bearer token
   * @returns {Promise<SATQuestionBank>}
   */
  static async fromAPI(url, apiKey = null) {
    if (!url) throw new Error('API URL required');
    
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return this.validateAndNormalize(data);
  }

  /**
   * Load from built-in registry
   * @param {string} id - Registry entry ID
   * @returns {Promise<SATQuestionBank>}
   */
  static async fromRegistry(id) {
    const registry = await this.getRegistry();
    if (!registry[id]) {
      throw new Error(`Question bank "${id}" not found in registry`);
    }
    const url = `questions/${registry[id].file}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load question bank: ${response.status}`);
    }
    const data = await response.json();
    return this.validateAndNormalize(data);
  }

  /**
   * Get the registry index
   * @returns {Promise<Object>}
   */
  static async getRegistry() {
    const response = await fetch('questions/registry.json');
    if (!response.ok) return {};
    return response.json();
  }

  /**
   * Validate and normalize question bank data
   * @param {Object} data - Raw parsed JSON
   * @returns {SATQuestionBank}
   */
  static validateAndNormalize(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data: root must be an object');
    }
    if (!data.metadata || !data.questions) {
      throw new Error('Invalid data: missing metadata or questions');
    }
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('Invalid data: questions must be a non-empty array');
    }

    // Normalize each question
    data.questions = data.questions.map((q, idx) => {
      if (!q.options || typeof q.options !== 'object') {
        throw new Error(`Question ${idx + 1}: missing options object`);
      }
      // Ensure options has A, B, C, D
      const opts = q.options;
      if (!opts.A || !opts.B || !opts.C || !opts.D) {
        throw new Error(`Question ${idx + 1}: options must have A, B, C, D`);
      }
      // Ensure answer is valid
      if (!['A', 'B', 'C', 'D'].includes(q.answer)) {
        throw new Error(`Question ${idx + 1}: answer must be A, B, C, or D`);
      }
      // Ensure passage exists (can be empty string)
      if (q.passage === undefined || q.passage === null) {
        q.passage = '';
      }
      // Ensure explanation exists
      if (q.explanation === undefined) {
        q.explanation = '';
      }
      // Ensure tags exists
      if (!q.tags) {
        q.tags = [];
      }
      return q;
    });

    // Ensure metadata has required fields
    const meta = data.metadata;
    if (!meta.id) meta.id = 'unknown';
    if (!meta.title) meta.title = 'Untitled Practice Set';
    if (!meta.category) meta.category = 'Mixed';
    if (!meta.totalQuestions) meta.totalQuestions = data.questions.length;
    if (!meta.generatedAt) meta.generatedAt = new Date().toISOString();

    return data;
  }

  /**
   * List all available registry entries
   * @returns {Promise<Array<{id: string, title: string, category: string, totalQuestions: number}>>}
   */
  static async listRegistry() {
    const registry = await this.getRegistry();
    return Object.values(registry).map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      totalQuestions: r.totalQuestions
    }));
  }
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuestionLoader;
}