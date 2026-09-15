// components/AdminPanel.js
import React, { useState } from 'react';

const AdminPanel = ({ socket, roomId, onStartDebate }) => {
  const [debateStatement, setDebateStatement] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [debateStarted, setDebateStarted] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30); // minutes
  const [geminiKey, setGeminiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  const topicPresets = [
    { label: "🤖 AI Responsibility", topic: "Should social media platforms and AI developers be held legally liable for spread of misinformation?" },
    { label: "💼 Remote Work", topic: "Is remote work inherently superior to traditional office work for long-term economic productivity?" },
    { label: "🌱 Climate vs Growth", topic: "Should governments prioritize immediate aggressive climate action over short-term economic growth?" },
    { label: "🪙 Universal Basic Income", topic: "Is Universal Basic Income (UBI) essential to mitigate automation-driven job displacement?" }
  ];

  const aiPrompts = [
    "Should social media platforms be held legally responsible for misinformation?",
    "Is artificial intelligence more beneficial or harmful to human society?",
    "Should governments implement universal basic income in the next decade?",
    "Is climate change action more urgent than economic growth?",
    "Should healthcare be completely free and government-funded?",
    "Is remote work better for long-term career growth than in-person work?",
    "Should commercial autonomous vehicles be mandated on public highways?",
    "Is nuclear energy the most viable bridge to 100% renewable grid resilience?"
  ];

  const generateAIStatement = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      const randomStatement = aiPrompts[Math.floor(Math.random() * aiPrompts.length)];
      setDebateStatement(randomStatement);
      setIsGeneratingAI(false);
    }, 800);
  };

  const handleSaveGeminiKey = () => {
    if (socket && roomId) {
      socket.emit('set-gemini-key', { roomId, apiKey: geminiKey.trim() });
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 3000);
    }
  };

  const startDebate = () => {
    if (debateStatement.trim()) {
      const debateData = {
        roomId,
        statement: debateStatement,
        timeLimit: timeLimit * 60, // convert to seconds
        startTime: new Date().toISOString()
      };
      
      socket.emit('start-debate', debateData);
      setDebateStarted(true);
      onStartDebate(debateData);
    }
  };

  const endDebate = () => {
    socket.emit('end-debate', { roomId });
    setDebateStarted(false);
  };

  return (
    <div className="admin-panel-card fade-in">
      <div className="admin-card-header">
        <div className="admin-header-title">
          <span className="admin-badge-icon">🛠️</span>
          <div>
            <h3>Debate Management Studio</h3>
            <p className="admin-subtitle">Session Control & AI Topic Configuration</p>
          </div>
        </div>

        <div className="admin-status-badge">
          {debateStarted ? (
            <span className="status-live"><span className="pulse-dot"></span> SESSION ACTIVE</span>
          ) : (
            <span className="status-ready">READY TO LAUNCH</span>
          )}
        </div>
      </div>
      
      <div className="admin-setup-body">
        {/* Gemini API Key Configuration Section */}
        <div className="gemini-key-bar">
          <div className="key-bar-label">
            <span>✨ Gemini 2.5 AI Engine Key (Optional)</span>
            <span className="key-hint">Paste API Key for Deep Motion Stance Evaluation & AI Scoring</span>
          </div>
          <div className="key-input-row">
            <input
              type="password"
              placeholder="Paste Gemini API Key (e.g. AIzaSy...)"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="key-input"
            />
            <button 
              type="button" 
              onClick={handleSaveGeminiKey}
              className="key-save-btn"
            >
              {keySaved ? '✓ Active' : 'Set Gemini AI Key'}
            </button>
          </div>
        </div>

        <div className="statement-section">
          <label className="section-label">Debate Resolution / Statement</label>
          <div className="textarea-wrapper">
            <textarea
              value={debateStatement}
              onChange={(e) => setDebateStatement(e.target.value)}
              placeholder="e.g. Resolved: The development of autonomous AI systems should require strict international governance standards."
              rows="3"
              disabled={debateStarted}
              className="admin-textarea"
            />
            {isGeneratingAI && <div className="ai-overlay">✨ Synthesizing AI Topic...</div>}
          </div>

          {!debateStarted && (
            <div className="preset-chips">
              <span className="preset-label">Quick Prompts:</span>
              {topicPresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="chip-btn"
                  onClick={() => setDebateStatement(p.topic)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <div className="statement-controls-bar">
            <button 
              onClick={generateAIStatement}
              disabled={isGeneratingAI || debateStarted}
              className="ai-generate-btn"
            >
              {isGeneratingAI ? '⚡ Synthesizing...' : '🤖 Generate Resolution with AI'}
            </button>
            
            <div className="time-limit-group">
              <label>Timer (Min):</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                min="5"
                max="120"
                disabled={debateStarted}
                className="time-input"
              />
            </div>
          </div>
        </div>

        <div className="debate-action-zone">
          {!debateStarted ? (
            <button 
              onClick={startDebate}
              disabled={!debateStatement.trim()}
              className="start-debate-btn"
            >
              🚀 Launch Debate Session
            </button>
          ) : (
            <div className="active-control-panel">
              <p className="active-text">Participants are actively arguing on this statement.</p>
              <button onClick={endDebate} className="end-debate-btn">
                ⏹️ Conclude Debate & Announce Winner
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
