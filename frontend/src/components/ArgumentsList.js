// components/ArgumentsList.js
import React from 'react';

const ArgumentsList = ({ arguments: debateArguments, userSide }) => {
  if (debateArguments.length === 0) {
    return (
      <div className="arguments-list empty">
        <div className="no-arguments-card">
          <div className="empty-icon">🎙️</div>
          <h4>The Floor is Open</h4>
          <p>No arguments submitted yet. Be the first to present your case!</p>
        </div>
      </div>
    );
  }

  const getScoreBadgeColor = (score) => {
    if (score >= 75) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="arguments-list-container">
      {debateArguments.map((argument, index) => {
        const isPro = argument.side === 'pro';
        const score = argument.score || 0;
        const scoreClass = getScoreBadgeColor(score);
        const analysis = argument.analysis || {};

        return (
          <div 
            key={argument.id || index} 
            className={`argument-card ${argument.side} fade-in`}
          >
            <div className="arg-card-header">
              <div className="arg-author-info">
                <span className={`side-badge ${argument.side}`}>
                  {isPro ? '🟢 PRO AFFIRMATIVE' : '🔴 CON NEGATIVE'}
                </span>
                <span className="arg-time">{formatTime(argument.timestamp)}</span>
                
                {analysis.aiEngine && (
                  <span className={`engine-chip ${analysis.aiEngine.includes('Gemini') ? 'gemini-engine' : 'local-engine'}`}>
                    {analysis.aiEngine.includes('Gemini') ? '⚡ Gemini 2.5 AI' : '🧠 Local NLP'}
                  </span>
                )}
              </div>

              <div className={`score-ring-badge ${scoreClass}`} title="AI Argument Strength & Logic Score (0-100)">
                <span className="score-value">{score}</span>
                <span className="score-label">AI SCORE</span>
              </div>
            </div>

            <div className="arg-card-body">
              <p className="arg-text">{argument.text}</p>
            </div>

            <div className="arg-analysis-chips">
              {analysis.sideMatch === false && (
                <span className="analysis-chip mismatch-warning" title="Warning: Speech sentiment contrasts with claimed role">
                  ⚠️ Stance Contradiction Warning
                </span>
              )}
              {analysis.motionAlignment && (
                <span className="analysis-chip stance-chip" title="Evaluated motion alignment">
                  🎯 {analysis.motionAlignment === 'WITH_MOTION' ? 'Supports Motion' : (analysis.motionAlignment === 'AGAINST_MOTION' ? 'Opposes Motion' : 'Neutral Position')}
                </span>
              )}
              {analysis.evidenceDetected && (
                <span className="analysis-chip evidence" title="Contains statistics, data, or citations">
                  📊 Evidence Detected
                </span>
              )}
              <span className="analysis-chip tone" title="Civility evaluation">
                🤝 {analysis.toneLabel || 'Civil Tone'}
              </span>
              {analysis.strengthLevel && (
                <span className="analysis-chip strength">
                  💡 {analysis.strengthLevel}
                </span>
              )}
            </div>

            {Array.isArray(analysis.feedback) && analysis.feedback.length > 0 && (
              <div className="ai-feedback-box">
                <span className="feedback-icon">🤖</span>
                <div className="feedback-tips">
                  {analysis.feedback.map((tip, idx) => (
                    <p key={idx}>{tip}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ArgumentsList;
