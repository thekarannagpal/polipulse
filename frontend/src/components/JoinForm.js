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
    const newRoomId = 'room-' + Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
  };

  return (
    <div className="join-form">
      <h2>Join a Debate</h2>
      <form onSubmit={handleSubmit}>
        <div className="room-input">
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          />
          <button type="button" onClick={createNewRoom} className="create-room-btn">
            🎲 Create New Room
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Your Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <select
          value={side}
          onChange={(e) => setSide(e.target.value)}
          required
        >
          <option value="">Choose Your Role</option>
          <option value="admin">🛠️ Admin (Control Debate)</option>
          <option value="pro">✅ Pro (Support)</option>
          <option value="con">❌ Con (Oppose)</option>
          <option value="audience">👥 Audience (Watch & React)</option>
        </select>
        
        <button type="submit" className="join-btn">
          Join Debate
        </button>
      </form>
    </div>
  );
};

export default JoinForm;
