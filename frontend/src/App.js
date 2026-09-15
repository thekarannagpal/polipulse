// App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import DebateRoom from './components/DebateRoom';
import JoinForm from './components/JoinForm';
import AdminPanel from './components/AdminPanel';
import './App.css';

const socket = io('http://localhost:3001');

function App() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [username, setUsername] = useState('');
  const [userSide, setUserSide] = useState('');
  const [debateState, setDebateState] = useState({
    statement: '',
    isActive: false,
    startTime: null,
    timeLimit: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [debateEndedSummary, setDebateEndedSummary] = useState(null);

  useEffect(() => {
    socket.on('debate-started', (data) => {
      setDebateState({
        statement: data.statement,
        isActive: true,
        startTime: data.startTime,
        timeLimit: data.timeLimit
      });
      setDebateEndedSummary(null);
    });

    socket.on('debate-ended', (data) => {
      setDebateState(prev => ({
        ...prev,
        isActive: false
      }));
      setDebateEndedSummary(data.summary);
    });

    socket.on('debate-state', (state) => {
      setDebateState({
        statement: state.statement,
        isActive: state.isActive,
        startTime: state.startTime,
        timeLimit: state.timeLimit
      });
    });

    return () => {
      socket.off('debate-started');
      socket.off('debate-ended');
      socket.off('debate-state');
    };
  }, []);

  const joinDebate = (roomId, user, side) => {
    setCurrentRoom(roomId);
    setUsername(user);
    setUserSide(side);
    setIsAdmin(side === 'admin');
    socket.emit('join-debate', { roomId, username: user, side });
  };

  const startDebate = (debateData) => {
    setDebateState({
      statement: debateData.statement,
      isActive: true,
      startTime: debateData.startTime,
      timeLimit: debateData.timeLimit
    });
    setDebateEndedSummary(null);
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setUsername('');
    setUserSide('');
    setIsAdmin(false);
    setDebateState({
      statement: '',
      isActive: false,
      startTime: null,
      timeLimit: 0
    });
    setDebateEndedSummary(null);
  };

  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getSideBadge = (side) => {
    switch(side) {
      case 'admin': return <span className="role-pill badge-admin">🛠️ Admin</span>;
      case 'pro': return <span className="role-pill badge-pro">🟢 Pro</span>;
      case 'con': return <span className="role-pill badge-con">🔴 Con</span>;
      default: return <span className="role-pill badge-audience">👥 Audience</span>;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo">
            <span className="logo-icon">🗳️</span>
          </div>
          <div className="brand-text">
            <h1>PoliPulse <span className="brand-tag">AI 2.0</span></h1>
            <p>Real-Time Intelligence & Civic Discourse Platform</p>
          </div>
        </div>

        {currentRoom && (
          <div className="header-meta">
            <div className="room-badge" onClick={copyRoomId} title="Click to copy Room ID">
              <span className="room-label">ROOM</span>
              <span className="room-id">{currentRoom}</span>
              <span className="copy-icon">{copySuccess ? '✓ Copied' : '📋'}</span>
            </div>

            <div className="user-profile-badge">
              <span className="username">{username}</span>
              {getSideBadge(userSide)}
            </div>

            <button onClick={leaveRoom} className="leave-btn">
              <span>← Leave</span>
            </button>
          </div>
        )}
      </header>

      {debateEndedSummary && (
        <div className="winner-banner fade-in">
          <div className="winner-banner-content">
            <span className="trophy">🏆</span>
            <div>
              <h3>Debate Concluded!</h3>
              <p>Winner: <strong>{debateEndedSummary.winner} Side</strong> with average argument score of {debateEndedSummary.winner === 'Pro' ? debateEndedSummary.proAvgScore : debateEndedSummary.conAvgScore}/100.</p>
            </div>
            <button onClick={() => setDebateEndedSummary(null)} className="close-banner">✕</button>
          </div>
        </div>
      )}
      
      {!currentRoom ? (
        <JoinForm onJoin={joinDebate} />
      ) : (
        <div className="main-content">
          {isAdmin && (
            <AdminPanel 
              socket={socket}
              roomId={currentRoom}
              onStartDebate={startDebate}
            />
          )}
          
          {debateState.statement && (
            <div className="debate-statement-hero">
              <div className="statement-header">
                <div className="statement-tag">
                  <span className="sparkles">✨</span> ACTIVE DEBATE RESOLUTION
                </div>
                <div className="debate-status-indicator">
                  {debateState.isActive ? (
                    <span className="live-pill">
                      <span className="pulse-dot"></span> LIVE DEBATE
                    </span>
                  ) : (
                    <span className="waiting-pill">⏸️ DEBATE PAUSED</span>
                  )}
                </div>
              </div>
              <h2 className="statement-text">"{debateState.statement}"</h2>
            </div>
          )}
          
          <DebateRoom 
            socket={socket}
            roomId={currentRoom}
            username={username}
            userSide={userSide}
            debateActive={debateState.isActive}
          />
        </div>
      )}
    </div>
  );
}

export default App;
