// components/DebateRoom.js
import React, { useState, useEffect } from 'react';
import ArgumentInput from './ArgumentInput';
import ArgumentsList from './ArgumentsList';
import SentimentGraph from './SentimentGraph';
import ReactionPanel from './ReactionPanel';

const DebateRoom = ({ socket, roomId, username, userSide }) => {
  const [debateArguments, setDebateArguments] = useState([]); // Changed from 'arguments'
  const [sentimentData, setSentimentData] = useState([]);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    socket.on('argument-posted', (argumentData) => {
      setDebateArguments(prev => [...prev, argumentData]); // Updated variable name
    });

    socket.on('user-joined', (userData) => {
      setParticipants(prev => [...prev, userData]);
    });

    socket.on('reaction-update', (reactionData) => {
      setSentimentData(prev => [...prev, {
        timestamp: new Date(),
        sentiment: reactionData.emoji,
        argumentId: reactionData.argumentId
      }]);
    });

    return () => {
      socket.off('argument-posted');
      socket.off('user-joined');
      socket.off('reaction-update');
    };
  }, [socket]);

  const submitArgument = (argumentText) => {
    socket.emit('new-argument', {
      roomId,
      argument: argumentText,
      side: userSide
    });
  };

  return (
    <div className="debate-room">
      <div className="debate-header">
        <h2>Room: {roomId}</h2>
        <div className="participants">
          <span>Participants: {participants.length}</span>
        </div>
      </div>

      <div className="debate-content">
        <div className="main-debate">
          <ArgumentsList arguments={debateArguments} userSide={userSide} /> {/* Updated prop */}
          {(userSide === 'pro' || userSide === 'con') && (
            <ArgumentInput onSubmit={submitArgument} />
          )}
        </div>

        <div className="sidebar">
          <SentimentGraph data={sentimentData} />
          <ReactionPanel 
            socket={socket} 
            roomId={roomId} 
            arguments={debateArguments} // Updated prop
          />
        </div>
      </div>
    </div>
  );
};

export default DebateRoom;
