// services/argumentAnalyzer.js
const natural = require('natural');
const sentiment = require('sentiment');

class ArgumentAnalyzer {
  constructor() {
    this.sentiment = new sentiment();
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  async analyzeArgument(argumentText) {
    const analysis = {
      strength: this.calculateStrength(argumentText),
      evidence: this.detectEvidence(argumentText),
      tone: this.analyzeTone(argumentText),
      clarity: this.analyzeClarity(argumentText),
      relevance: this.analyzeRelevance(argumentText),
      score: 0,
      feedback: []
    };

    // Calculate overall score with weighted factors
    analysis.score = this.calculateOverallScore(analysis);
    
    // Generate feedback
    analysis.feedback = this.generateFeedback(analysis, argumentText);
    
    return analysis;
  }

  calculateStrength(text) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    
    // Logical connectors
    const logicalWords = ['because', 'therefore', 'however', 'furthermore', 'moreover', 'consequently', 'thus', 'hence'];
    const evidenceWords = ['study', 'research', 'data', 'statistics', 'evidence', 'survey', 'analysis', 'report'];
    const weakWords = ['maybe', 'perhaps', 'possibly', 'might', 'could', 'seems'];
    
    let strengthScore = 30; // Base score
    
    // Check for logical structure
    logicalWords.forEach(word => {
      if (tokens.includes(word)) strengthScore += 8;
    });
    
    // Check for evidence mentions
    evidenceWords.forEach(word => {
      if (tokens.includes(word)) strengthScore += 12;
    });
    
    // Penalize weak language
    weakWords.forEach(word => {
      if (tokens.includes(word)) strengthScore -= 5;
    });
    
    // Bonus for structured arguments (multiple sentences)
    const sentences = text.split(/[.!?]+/).length;
    if (sentences >= 3) strengthScore += 10;
    
    return Math.max(0, Math.min(100, strengthScore));
  }

  detectEvidence(text) {
    const evidencePatterns = [
      /\d+%/g, // Percentages
      /\d+\.\d+%/g, // Decimal percentages
      /study shows?/gi,
      /research indicates?/gi,
      /according to/gi,
      /data reveals?/gi,
      /scientists found/gi,
      /experts say/gi,
      /\$\d+/g, // Dollar amounts
      /\d+ (million|billion|thousand)/gi
    ];
    
    let evidenceScore = 20; // Base score
    
    evidencePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) evidenceScore += matches.length * 15;
    });
    
    // Check for source citations
    if (/\([^)]*\d{4}[^)]*\)/.test(text)) evidenceScore += 20; // Year citations
    if (/(university|institute|organization)/gi.test(text)) evidenceScore += 15;
    
    return Math.min(100, evidenceScore);
  }

  analyzeTone(text) {
    const sentimentResult = this.sentiment.analyze(text);
    
    // Check for inflammatory language
    const inflammatoryWords = ['hate', 'stupid', 'idiotic', 'moronic', 'ridiculous'];
    const respectfulWords = ['respect', 'understand', 'consider', 'acknowledge'];
    
    let civilityScore = 60 + (sentimentResult.score > 0 ? 10 : 0);
    
    inflammatoryWords.forEach(word => {
      if (text.toLowerCase().includes(word)) civilityScore -= 15;
    });
    
    respectfulWords.forEach(word => {
      if (text.toLowerCase().includes(word)) civilityScore += 10;
    });
    
    return Math.max(0, Math.min(100, civilityScore));
  }

  analyzeClarity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = text.length / sentences.length;
    
    let clarityScore = 50;
    
    // Optimal sentence length (10-25 words)
    if (avgSentenceLength >= 50 && avgSentenceLength <= 150) clarityScore += 20;
    else if (avgSentenceLength > 200) clarityScore -= 15;
    
    // Check for clear structure
    if (sentences.length >= 2) clarityScore += 15;
    if (/firstly|secondly|finally|in conclusion/gi.test(text)) clarityScore += 15;
    
    return Math.max(0, Math.min(100, clarityScore));
  }

  analyzeRelevance(text) {
    // This would ideally compare against the debate statement
    // For now, we'll use general political/debate relevance indicators
    const relevantTerms = [
      'policy', 'government', 'society', 'economic', 'social', 'political',
      'public', 'citizen', 'democracy', 'rights', 'law', 'regulation',
      'impact', 'effect', 'consequence', 'benefit', 'cost', 'advantage'
    ];
    
    let relevanceScore = 40;
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    
    relevantTerms.forEach(term => {
      if (tokens.includes(term)) relevanceScore += 6;
    });
    
    return Math.min(100, relevanceScore);
  }

  calculateOverallScore(analysis) {
    return Math.round(
      (analysis.strength * 0.30) +
      (analysis.evidence * 0.25) +
      (analysis.tone * 0.20) +
      (analysis.clarity * 0.15) +
      (analysis.relevance * 0.10)
    );
  }

  generateFeedback(analysis, text) {
    const feedback = [];
    
    if (analysis.strength < 40) {
      feedback.push("💡 Try using logical connectors like 'because', 'therefore', or 'however' to strengthen your argument structure.");
    }
    
    if (analysis.evidence < 50) {
      feedback.push("📊 Consider adding statistics, studies, or specific examples to support your claims.");
    }
    
    if (analysis.tone < 60) {
      feedback.push("🤝 Use more respectful language to improve the tone of your argument.");
    }
    
    if (analysis.clarity < 50) {
      feedback.push("✏️ Try breaking down complex ideas into clearer, shorter sentences.");
    }
    
    if (analysis.score >= 80) {
      feedback.push("🏆 Excellent argument! Well-structured with good evidence and tone.");
    } else if (analysis.score >= 60) {
      feedback.push("👍 Good argument! Consider the suggestions above to make it even stronger.");
    }
    
    return feedback;
  }
}

module.exports = ArgumentAnalyzer;
