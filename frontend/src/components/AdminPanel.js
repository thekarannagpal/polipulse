// components/AdminPanel.js
import React, { useState } from 'react';

const AdminPanel = ({ socket, roomId, onStartDebate }) => {
  const [debateStatement, setDebateStatement] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [debateStarted, setDebateStarted] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30); // minutes

  const aiPrompts = [
    "Should social media platforms be held legally responsible for misinformation?",
    "Is artificial intelligence more beneficial or harmful to society?",
    "Should governments implement universal basic income?",
    "Is climate change action more important than economic growth?",
    "Should healthcare be completely free and government-funded?",
    "Is remote work better for productivity than office work?",
    "Should violent video games be banned to reduce real-world violence?",
    "Is nuclear energy the best solution for climate change?"
  ];

  const generateAIStatement = () => {
    setIsGeneratingAI(true);
    // Simulate AI generation delay
    setTimeout(() => {
      const randomStatement = aiPrompts[Math.floor(Math.random() * aiPrompts.length)];
      setDebateStatement(randomStatement);
      setIsGeneratingAI(false);
    }, 2000);
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
    <div className="admin-panel">
      <h2>🛠️ Admin Panel</h2>
      
      <div className="debate-setup">
        <div className="statement-section">
          <h3>Debate Statement</h3>
          <textarea
            value={debateStatement}
            onChange={(e) => setDebateStatement(e.target.value)}
            placeholder="Enter the debate statement that participants will argue about..."
            rows="4"
            disabled={debateStarted}
          />
          
          <div className="statement-controls">
            <button 
              onClick={generateAIStatement}
              disabled={isGeneratingAI || debateStarted}
              className="ai-generate-btn"
            >
              {isGeneratingAI ? '🤖 Generating...' : '🤖 Generate with AI'}
            </button>
            
            <div className="time-limit">
              <label>Time Limit (minutes):</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                min="5"
                max="120"
                disabled={debateStarted}
              />
            </div>
          </div>
        </div>

        <div className="debate-controls">
          {!debateStarted ? (
            <button 
              onClick={startDebate}
              disabled={!debateStatement.trim()}
              className="start-debate-btn"
            >
              🚀 Start Debate
            </button>
          ) : (
            <div className="active-debate">
              <div className="debate-status">
                <span className="status-indicator">🔴 LIVE</span>
                <span>Debate in Progress</span>
              </div>
              <button onClick={endDebate} className="end-debate-btn">
                ⏹️ End Debate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
