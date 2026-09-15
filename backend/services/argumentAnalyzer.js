// services/argumentAnalyzer.js
const natural = require('natural');
const sentiment = require('sentiment');
const axios = require('axios');

class ArgumentAnalyzer {
  constructor() {
    this.sentiment = new sentiment();
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  getApiKey() {
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null;
  }

  async analyzeArgument(argumentText, debateStatement = '', claimedSide = 'pro', customApiKey = null) {
    const apiKey = customApiKey || this.getApiKey();

    if (apiKey) {
      try {
        const geminiAnalysis = await this.analyzeWithGemini(argumentText, debateStatement, claimedSide, apiKey);
        if (geminiAnalysis) {
          return geminiAnalysis;
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local NLP engine:', err.message);
      }
    }

    // Local enhanced NLP fallback
    return this.analyzeLocally(argumentText, debateStatement, claimedSide);
  }

  async analyzeWithGemini(argumentText, debateStatement, claimedSide, apiKey) {
    const prompt = `You are an expert debate judge and AI natural language evaluator analyzing a debate argument.

Debate Resolution / Motion: "${debateStatement || 'General Debate'}"
Claimed Speaker Side: "${claimedSide.toUpperCase()}" (Affirmative/Support = PRO, Negative/Oppose = CON)
Argument Text: "${argumentText}"

Analyze the argument text carefully and evaluate:
1. Motion Alignment: Is the argument actually supporting or opposing the resolution? Does it match the claimed side (${claimedSide})?
2. Logical Strength (0-100): Structure, logic, coherence.
3. Evidence Detection (0-100): Statistics, data, studies, sources, dollar amounts mentioned.
4. Tone & Civility (0-100): Respectfulness vs inflammatory language.
5. Clarity (0-100): Communication quality.
6. Relevance (0-100): Connection to debate statement.

Respond strictly in valid JSON format with NO markdown wrapping, matching this exact schema:
{
  "strength": 85,
  "evidence": 90,
  "tone": 95,
  "clarity": 88,
  "relevance": 92,
  "score": 88,
  "motionAlignment": "WITH_MOTION",
  "sideMatch": true,
  "strengthLevel": "Strong Argument",
  "evidenceDetected": true,
  "toneLabel": "Civil & Respectful",
  "feedback": [
    "Clear logical flow with supporting reasoning.",
    "Arguments align strongly with the affirmative position."
  ],
  "aiEngine": "Gemini 2.5 AI Engine"
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    }, { timeout: 8000 });

    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (responseText) {
      const parsed = JSON.parse(responseText.trim());
      return {
        strength: parsed.strength || 70,
        evidence: parsed.evidence || 50,
        tone: parsed.tone || 80,
        clarity: parsed.clarity || 75,
        relevance: parsed.relevance || 80,
        score: parsed.score || 75,
        motionAlignment: parsed.motionAlignment || 'WITH_MOTION',
        sideMatch: typeof parsed.sideMatch === 'boolean' ? parsed.sideMatch : true,
        strengthLevel: parsed.strengthLevel || 'Moderate Argument',
        evidenceDetected: !!parsed.evidenceDetected,
        toneLabel: parsed.toneLabel || 'Civil',
        feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
        aiEngine: 'Gemini 2.5 AI Engine'
      };
    }
    return null;
  }

  analyzeLocally(argumentText, debateStatement = '', claimedSide = 'pro') {
    const strength = this.calculateStrength(argumentText);
    const evidence = this.detectEvidence(argumentText);
    const tone = this.analyzeTone(argumentText);
    const clarity = this.analyzeClarity(argumentText);
    const relevance = this.analyzeRelevance(argumentText, debateStatement);
    const alignment = this.analyzeMotionAlignment(argumentText, debateStatement, claimedSide);

    const overallScore = Math.round(
      (strength * 0.25) +
      (evidence * 0.25) +
      (tone * 0.20) +
      (clarity * 0.15) +
      (relevance * 0.15)
    );

    const feedback = this.generateFeedback({ strength, evidence, tone, clarity, relevance, score: overallScore, alignment }, argumentText);

    return {
      strength,
      evidence,
      tone,
      clarity,
      relevance,
      score: overallScore,
      motionAlignment: alignment.motionAlignment,
      sideMatch: alignment.sideMatch,
      strengthLevel: strength >= 75 ? 'Strong Argument' : (strength >= 50 ? 'Moderate Argument' : 'Needs Structure'),
      evidenceDetected: evidence > 30,
      toneLabel: tone >= 70 ? 'Civil & Constructive' : 'Needs Civility',
      feedback,
      aiEngine: 'Local Natural NLP Engine'
    };
  }

  calculateStrength(text) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
    const logicalWords = ['because', 'therefore', 'however', 'furthermore', 'moreover', 'consequently', 'thus', 'hence', 'whereas', 'since'];
    const evidenceWords = ['study', 'research', 'data', 'statistics', 'evidence', 'survey', 'analysis', 'report', 'finding', 'proven'];
    const weakWords = ['maybe', 'perhaps', 'possibly', 'might', 'could', 'seems', 'guess', 'sorta'];
    
    let strengthScore = 35;
    
    logicalWords.forEach(word => {
      if (tokens.includes(word)) strengthScore += 8;
    });
    
    evidenceWords.forEach(word => {
      if (tokens.includes(word)) strengthScore += 10;
    });
    
    weakWords.forEach(word => {
      if (tokens.includes(word)) strengthScore -= 5;
    });
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    if (sentences >= 3) strengthScore += 10;
    if (text.length > 150) strengthScore += 10;
    
    return Math.max(0, Math.min(100, strengthScore));
  }

  detectEvidence(text) {
    const evidencePatterns = [
      /\d+%/g,
      /\d+\.\d+%/g,
      /study shows?/gi,
      /research indicates?/gi,
      /according to/gi,
      /data reveals?/gi,
      /scientists found/gi,
      /experts say/gi,
      /\$\d+/g,
      /\d+ (million|billion|thousand)/gi,
      /report published/gi
    ];
    
    let evidenceScore = 15;
    evidencePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) evidenceScore += matches.length * 18;
    });
    
    if (/\([^)]*\d{4}[^)]*\)/.test(text)) evidenceScore += 20;
    if (/(university|institute|organization|journal)/gi.test(text)) evidenceScore += 15;
    
    return Math.min(100, evidenceScore);
  }

  analyzeTone(text) {
    const sentimentResult = this.sentiment.analyze(text);
    const inflammatoryWords = ['hate', 'stupid', 'idiotic', 'moronic', 'ridiculous', 'dumb', 'cheat', 'nonsense'];
    const respectfulWords = ['respect', 'understand', 'consider', 'acknowledge', 'appreciate', 'perspective', 'valid'];
    
    let civilityScore = 65 + (sentimentResult.score > 0 ? 10 : -5);
    
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
    if (sentences.length === 0) return 40;

    const avgSentenceLength = text.length / sentences.length;
    let clarityScore = 55;
    
    if (avgSentenceLength >= 40 && avgSentenceLength <= 140) clarityScore += 20;
    else if (avgSentenceLength > 200) clarityScore -= 15;
    
    if (sentences.length >= 2) clarityScore += 15;
    if (/firstly|secondly|finally|in conclusion|on one hand|furthermore/gi.test(text)) clarityScore += 10;
    
    return Math.max(0, Math.min(100, clarityScore));
  }

  analyzeRelevance(text, debateStatement = '') {
    let relevanceScore = 40;
    const tokens = this.tokenizer.tokenize(text.toLowerCase()) || [];
    
    if (debateStatement) {
      const statementTokens = this.tokenizer.tokenize(debateStatement.toLowerCase()) || [];
      const stopWords = new Set(['should', 'would', 'could', 'the', 'is', 'a', 'an', 'and', 'or', 'to', 'in', 'for', 'be']);
      const keyStatementWords = statementTokens.filter(w => !stopWords.has(w) && w.length > 2);
      
      let matches = 0;
      keyStatementWords.forEach(kw => {
        if (tokens.includes(kw)) matches++;
      });
      
      if (keyStatementWords.length > 0) {
        relevanceScore += Math.round((matches / keyStatementWords.length) * 45);
      }
    }
    
    const generalDebateTerms = ['policy', 'government', 'society', 'economic', 'social', 'political', 'rights', 'law', 'effect', 'benefit'];
    generalDebateTerms.forEach(term => {
      if (tokens.includes(term)) relevanceScore += 4;
    });
    
    return Math.min(100, relevanceScore);
  }

  analyzeMotionAlignment(text, debateStatement = '', claimedSide = 'pro') {
    const textLower = text.toLowerCase();
    const proIndicators = ['support', 'agree', 'beneficial', 'positive', 'essential', 'necessary', 'advantage', 'approve', 'vital'];
    const conIndicators = ['oppose', 'disagree', 'harmful', 'negative', 'dangerous', 'flawed', 'disadvantage', 'reject', 'risk'];

    let proCount = 0;
    let conCount = 0;

    proIndicators.forEach(word => { if (textLower.includes(word)) proCount++; });
    conIndicators.forEach(word => { if (textLower.includes(word)) conCount++; });

    let impliedStance = 'NEUTRAL';
    if (proCount > conCount) impliedStance = 'PRO';
    else if (conCount > proCount) impliedStance = 'CON';

    const sideMatch = impliedStance === 'NEUTRAL' || impliedStance === claimedSide.toUpperCase();
    
    return {
      motionAlignment: impliedStance === 'PRO' ? 'WITH_MOTION' : (impliedStance === 'CON' ? 'AGAINST_MOTION' : 'NEUTRAL'),
      sideMatch
    };
  }

  generateFeedback(analysis, text) {
    const feedback = [];
    
    if (analysis.alignment && !analysis.alignment.sideMatch) {
      feedback.push("⚠️ Warning: Your argument language seems to contrast with your claimed side. Ensure your reasoning directly supports your chosen stance!");
    }

    if (analysis.strength < 45) {
      feedback.push("💡 Strengthen your logical structure using connectors like 'because', 'therefore', or 'furthermore'.");
    }
    
    if (analysis.evidence < 40) {
      feedback.push("📊 Add specific statistics, research studies, or real-world data to back up your point.");
    }
    
    if (analysis.tone < 60) {
      feedback.push("🤝 Maintain a respectful tone to maximize your civility evaluation.");
    }
    
    if (analysis.score >= 80) {
      feedback.push("🏆 Outstanding argument! Strong logical structure, evidence, and clear alignment.");
    } else if (analysis.score >= 60) {
      feedback.push("👍 Solid argument. Use the feedback tips above to elevate your score even higher.");
    }
    
    return feedback;
  }
}

module.exports = ArgumentAnalyzer;
