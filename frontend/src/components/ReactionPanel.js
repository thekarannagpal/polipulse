// components/ReactionPanel.js
import React, { useState, useEffect } from 'react';

const ReactionPanel = ({ socket, roomId, arguments: debateArguments }) => { // Destructure and rename
  const [reactionCounts, setReactionCounts] = useState({});
  const [selectedArgument, setSelectedArgument] = useState(null);

  const reactions = ['👍', '👎', '😮', '🤔', '👏', '😡'];

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
    <div className="reaction-panel">
      <h3>Audience Reactions</h3>
      
      {debateArguments.length > 0 ? (
        <>
          <div className="argument-selector">
            <label>React to argument:</label>
            <select 
              value={selectedArgument || ''} 
              onChange={(e) => setSelectedArgument(e.target.value)}
            >
              <option value="">Select an argument</option>
              {debateArguments.map((arg) => (
                <option key={arg.id} value={arg.id}>
                  {arg.side.toUpperCase()}: {arg.text.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          <div className="reaction-buttons">
            {reactions.map((emoji) => (
              <button
                key={emoji}
                className="reaction-btn"
                onClick={() => handleReaction(emoji)}
                disabled={!selectedArgument}
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="reaction-stats">
            <h4>Current Reactions</h4>
            {Object.entries(reactionCounts).map(([key, count]) => {
              const [argumentId, emoji] = key.split('-');
              const argument = debateArguments.find(arg => arg.id.toString() === argumentId);
              return (
                <div key={key} className="reaction-count">
                  <span className="reaction-emoji">{emoji}</span>
                  <span className="reaction-number">{count}</span>
                  {argument && (
                    <span className="reaction-context">
                      ({argument.side})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p>No arguments to react to yet.</p>
      )}
    </div>
  );
};

export default ReactionPanel;
