// components/ReactionPanel.js
import React, { useState, useEffect } from 'react';

const ReactionPanel = ({ socket, roomId, arguments: debateArguments }) => {
  const [reactionCounts, setReactionCounts] = useState({});
  const [selectedArgument, setSelectedArgument] = useState(null);

  const reactions = [
    { emoji: '👍', label: 'Agree' },
    { emoji: '👎', label: 'Disagree' },
    { emoji: '👏', label: 'Applause' },
    { emoji: '🤔', label: 'Insightful' },
    { emoji: '😮', label: 'Surprised' },
    { emoji: '😡', label: 'Outraged' }
  ];

  // Auto-select latest argument when arguments change if none selected
  useEffect(() => {
    if (debateArguments.length > 0 && !selectedArgument) {
      setSelectedArgument(debateArguments[debateArguments.length - 1].id);
    }
  }, [debateArguments, selectedArgument]);

  useEffect(() => {
    socket.on('reaction-update', (reactionData) => {
      setReactionCounts(prev => {
        const key = `${reactionData.argumentId}-${reactionData.emoji}`;
        return {
          ...prev,
          [key]: (prev[key] || 0) + 1
        };
      });
    });

    return () => {
      socket.off('reaction-update');
    };
  }, [socket]);

  const handleReaction = (emoji) => {
    if (selectedArgument) {
      socket.emit('audience-reaction', {
        roomId,
        emoji,
        argumentId: selectedArgument
      });
    }
  };

  return (
    <div className="reaction-panel-container">
      <div className="panel-header">
        <h4>🎭 Audience Sentiment Reaction</h4>
      </div>
      
      {debateArguments.length > 0 ? (
        <div className="panel-body">
          <div className="argument-selector-group">
            <label className="selector-label">Target Argument:</label>
            <select 
              value={selectedArgument || ''} 
              onChange={(e) => setSelectedArgument(e.target.value)}
              className="custom-select"
            >
              {debateArguments.map((arg, idx) => (
                <option key={arg.id || idx} value={arg.id}>
                  #{idx + 1} [{arg.side.toUpperCase()}] {arg.text.substring(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          <div className="reaction-buttons-grid">
            {reactions.map((r) => (
              <button
                key={r.emoji}
                className="reaction-badge-btn"
                onClick={() => handleReaction(r.emoji)}
                disabled={!selectedArgument}
                title={`React: ${r.label}`}
              >
                <span className="reaction-emoji">{r.emoji}</span>
                <span className="reaction-text">{r.label}</span>
              </button>
            ))}
          </div>

          <div className="reaction-stats-box">
            <div className="stats-header">
              <span>Reaction Tally</span>
            </div>

            {Object.keys(reactionCounts).length === 0 ? (
              <p className="no-stats">Click an emoji above to submit your audience reaction!</p>
            ) : (
              <div className="reaction-chips-wrapper">
                {Object.entries(reactionCounts).map(([key, count]) => {
                  const [argumentId, emoji] = key.split('-');
                  const argument = debateArguments.find(arg => arg.id.toString() === argumentId);
                  return (
                    <div key={key} className="reaction-tally-chip">
                      <span className="chip-emoji">{emoji}</span>
                      <span className="chip-count">{count}</span>
                      {argument && (
                        <span className={`chip-side ${argument.side}`}>
                          {argument.side}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="empty-panel">
          <p>No arguments posted yet to react to.</p>
        </div>
      )}
    </div>
  );
};

export default ReactionPanel;
