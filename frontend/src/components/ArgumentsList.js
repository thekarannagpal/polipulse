// components/ArgumentsList.js
import React from 'react';

const ArgumentsList = ({ arguments: debateArguments, userSide }) => { // Destructure and rename
  if (debateArguments.length === 0) {
    return (
      <div className="arguments-list">
        <div className="no-arguments">
          <p>No arguments yet. Be the first to start the debate!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="arguments-list">
      {debateArguments.map((argument) => (
        <div 
          key={argument.id} 
          className={`argument-item ${argument.side} fade-in`}
        >
          <div className="argument-header">
            <span className={`argument-side ${argument.side}`}>
              {argument.side.toUpperCase()}
            </span>
            <span className="argument-score">
              Score: {argument.score || 0}
            </span>
          </div>
          <div className="argument-text">
            {argument.text}
          </div>
          <div className="argument-timestamp">
            {new Date(argument.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArgumentsList;
