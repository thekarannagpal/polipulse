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

  useEffect(() => {
    socket.on('debate-started', (data) => {
      setDebateState({
        statement: data.statement,
        isActive: true,
        startTime: data.startTime,
        timeLimit: data.timeLimit
      });
    });

    socket.on('debate-ended', (data) => {
      setDebateState(prev => ({
        ...prev,
        isActive: false
      }));
      alert(`Debate ended! Winner: ${data.summary.winner}`);
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
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🗳️ PoliPulse</h1>
        <p>Real-Time AI-Powered Debate Platform</p>
        {currentRoom && (
          <button onClick={leaveRoom} className="leave-btn">
            ← Leave Room
          </button>
        )}
      </header>
      
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
            <div className="debate-statement">
              <h2>📜 Debate Statement</h2>
              <p>"{debateState.statement}"</p>
              <div className="debate-status">
                {debateState.isActive ? (
                  <span className="active">🔴 LIVE DEBATE</span>
                ) : (
                  <span className="inactive">⏸️ DEBATE NOT STARTED</span>
                )}
              </div>
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
