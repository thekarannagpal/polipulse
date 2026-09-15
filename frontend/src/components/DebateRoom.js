// components/DebateRoom.js
import React, { useState, useEffect } from 'react';
import ArgumentInput from './ArgumentInput';
import ArgumentsList from './ArgumentsList';
import SentimentGraph from './SentimentGraph';
import ReactionPanel from './ReactionPanel';

const DebateRoom = ({ socket, roomId, username, userSide, debateActive }) => {
  const [debateArguments, setDebateArguments] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState('reactions');

  useEffect(() => {
    socket.on('argument-posted', (argumentData) => {
      setDebateArguments(prev => [...prev, argumentData]);
    });

    socket.on('user-joined', (userData) => {
      setParticipants(prev => {
        // filter unique by socketId or username
        if (prev.some(p => p.username === userData.username && p.side === userData.side)) {
          return prev;
        }
        return [...prev, userData];
      });
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

  // Calculate scores
  const proArgs = debateArguments.filter(a => a.side === 'pro');
  const conArgs = debateArguments.filter(a => a.side === 'con');

  const proAvgScore = proArgs.length 
    ? Math.round(proArgs.reduce((acc, curr) => acc + (curr.score || 0), 0) / proArgs.length) 
    : 0;
  const conAvgScore = conArgs.length 
    ? Math.round(conArgs.reduce((acc, curr) => acc + (curr.score || 0), 0) / conArgs.length) 
    : 0;

  const totalScoreSum = (proAvgScore + conAvgScore) || 100;
  const proPct = Math.round((proAvgScore / totalScoreSum) * 100) || 50;
  const conPct = 100 - proPct;

  return (
    <div className="debate-arena fade-in">
      {/* Dynamic Score Comparison Header */}
      <div className="score-summary-bar">
        <div className="score-side pro-side">
          <div className="side-metric">
            <span className="side-label">🟢 PRO / AFFIRMATIVE</span>
            <span className="side-count">{proArgs.length} Arguments</span>
          </div>
          <div className="side-score-box">
            <span className="score-num">{proAvgScore}</span>
            <span className="score-unit">Avg AI Score</span>
          </div>
        </div>

        <div className="score-versus-center">
          <div className="vs-badge">VS</div>
          <div className="ratio-bar-wrapper">
            <div className="ratio-bar-fill pro-fill" style={{ width: `${proPct}%` }}></div>
            <div className="ratio-bar-fill con-fill" style={{ width: `${conPct}%` }}></div>
          </div>
          <div className="ratio-labels">
            <span>{proPct}%</span>
            <span>{conPct}%</span>
          </div>
        </div>

        <div className="score-side con-side">
          <div className="side-score-box">
            <span className="score-num">{conAvgScore}</span>
            <span className="score-unit">Avg AI Score</span>
          </div>
          <div className="side-metric text-right">
            <span className="side-label">🔴 CON / NEGATIVE</span>
            <span className="side-count">{conArgs.length} Arguments</span>
          </div>
        </div>
      </div>

      <div className="arena-grid">
        {/* Main Debate Timeline */}
        <div className="main-debate-column">
          <div className="column-header">
            <h3>💬 Live Argument Feed</h3>
            <span className="argument-total-pill">{debateArguments.length} Submissions</span>
          </div>

          <ArgumentsList arguments={debateArguments} userSide={userSide} />

          {(userSide === 'pro' || userSide === 'con') && (
            <ArgumentInput onSubmit={submitArgument} debateActive={debateActive} />
          )}

          {userSide === 'audience' && (
            <div className="audience-notice-box">
              <span className="notice-icon">👀</span>
              <div>
                <strong>You are participating as Audience</strong>
                <p>Use the reaction panel on the right to react to live arguments with emojis!</p>
              </div>
            </div>
          )}
        </div>

        {/* Analytics & Sentiment Sidebar */}
        <div className="arena-sidebar">
          <div className="sidebar-tabs">
            <button 
              className={`tab-btn ${activeTab === 'reactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('reactions')}
            >
              👏 Reactions & Emoji Stats
            </button>
            <button 
              className={`tab-btn ${activeTab === 'sentiment' ? 'active' : ''}`}
              onClick={() => setActiveTab('sentiment')}
            >
              📊 Sentiment Canvas
            </button>
          </div>

          <div className="sidebar-content-box">
            {activeTab === 'reactions' ? (
              <ReactionPanel 
                socket={socket} 
                roomId={roomId} 
                arguments={debateArguments} 
              />
            ) : (
              <SentimentGraph data={sentimentData} />
            )}
          </div>

          <div className="room-info-card">
            <h4>👥 Room Participants</h4>
            <div className="participants-list">
              <div className="participant-chip">
                <span className="dot online"></span>
                <span>You ({username})</span>
                <span className={`chip-role ${userSide}`}>{userSide}</span>
              </div>
              {participants.map((p, i) => (
                <div key={i} className="participant-chip">
                  <span className="dot online"></span>
                  <span>{p.username}</span>
                  <span className={`chip-role ${p.side}`}>{p.side}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebateRoom;
