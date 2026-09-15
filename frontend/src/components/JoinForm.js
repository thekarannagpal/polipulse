// components/JoinForm.js
import React, { useState } from 'react';

const JoinForm = ({ onJoin }) => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [side, setSide] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomId && username && side) {
      onJoin(roomId, username, side);
    }
  };

  const createNewRoom = () => {
    const newRoomId = 'room-' + Math.random().toString(36).substr(2, 7);
    setRoomId(newRoomId);
  };

  const handleRoleSelect = (selectedRole) => {
    setSide(selectedRole);
    // Auto-generate room code if Admin is selected and room ID is empty
    if (selectedRole === 'admin' && !roomId) {
      createNewRoom();
    }
  };

  const roles = [
    {
      id: 'admin',
      title: 'Debate Admin',
      icon: '🛠️',
      desc: 'Create new debate session, set resolution, timer & AI topic',
      badgeClass: 'role-admin-card'
    },
    {
      id: 'pro',
      title: 'Pro / Affirmative',
      icon: '🟢',
      desc: 'Join existing room to defend the resolution',
      badgeClass: 'role-pro-card'
    },
    {
      id: 'con',
      title: 'Con / Negative',
      icon: '🔴',
      desc: 'Join existing room to oppose the resolution',
      badgeClass: 'role-con-card'
    },
    {
      id: 'audience',
      title: 'Audience / Judge',
      icon: '👥',
      desc: 'Join existing room to watch, react & score arguments',
      badgeClass: 'role-audience-card'
    }
  ];

  return (
    <div className="landing-container fade-in">
      <div className="hero-section">
        <span className="hero-pill">⚡ Powered by socket.io & AI Natural NLP</span>
        <h2 className="hero-title">Enter the Arena of Structured Debate</h2>
        <p className="hero-subtitle">
          Real-time argument scoring, civility metrics, evidence detection, and live audience sentiment tracking.
        </p>
      </div>

      <div className="join-card-glass">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Role Selection */}
          <div className="form-group">
            <label className="input-label">1. Select Your Role</label>
            <div className="role-grid">
              {roles.map((r) => (
                <div
                  key={r.id}
                  className={`role-option-card ${r.badgeClass} ${side === r.id ? 'active' : ''}`}
                  onClick={() => handleRoleSelect(r.id)}
                >
                  <div className="role-card-header">
                    <span className="role-icon">{r.icon}</span>
                    <span className="role-title">{r.title}</span>
                    {side === r.id && <span className="check-mark">✓</span>}
                  </div>
                  <p className="role-desc">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Display Name */}
          <div className="form-group">
            <label className="input-label">2. Display Name</label>
            <input
              type="text"
              placeholder="e.g. Alex Rivera or Speaker #1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="custom-input"
            />
          </div>

          {/* Step 3: Room Code */}
          <div className="form-group">
            <div className="input-label-row">
              <label className="input-label">3. Session Room Code</label>
              {side === 'admin' ? (
                <span className="role-helper-tag admin-tag">🛠️ Admin Mode: Create or Enter Room</span>
              ) : side ? (
                <span className="role-helper-tag user-tag">🔒 Enter the Room Code given by your Admin</span>
              ) : null}
            </div>

            <div className="room-input-group">
              <input
                type="text"
                placeholder={side === 'admin' ? 'Click "Create Room" or enter ID' : 'Enter Admin Room Code (e.g. room-alpha-92)'}
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                className="custom-input"
              />
              {side === 'admin' ? (
                <button 
                  type="button" 
                  onClick={createNewRoom} 
                  className="create-room-btn"
                  title="Generate new random room code for your debate session"
                >
                  🎲 Generate Room Code
                </button>
              ) : (
                <div className="admin-only-badge" title="Only Debate Admin can create new rooms">
                  👥 Admin Room Required
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="join-submit-btn" 
            disabled={!roomId || !username || !side}
          >
            {side === 'admin' ? 'Initialize Debate Room →' : 'Join Debate Session →'}
          </button>
        </form>
      </div>

      <div className="feature-badges">
        <div className="feature-item">
          <span>🧠</span>
          <div>
            <strong>AI Argument Scoring</strong>
            <p>Scores logic, tone & evidence (0-100)</p>
          </div>
        </div>
        <div className="feature-item">
          <span>🎤</span>
          <div>
            <strong>Voice to Text</strong>
            <p>Speech input with live transcript</p>
          </div>
        </div>
        <div className="feature-item">
          <span>📊</span>
          <div>
            <strong>Live Audience Pulse</strong>
            <p>Real-time emotional sentiment canvas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinForm;
