require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const ArgumentAnalyzer = require('./services/argumentAnalyzer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize AI analyzer
const argumentAnalyzer = new ArgumentAnalyzer();

// Debate room management
const debateRooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-debate', (data) => {
    const { roomId, username, side } = data;
    socket.join(roomId);
    
    if (!debateRooms.has(roomId)) {
      debateRooms.set(roomId, {
        participants: [],
        debateArguments: [],
        sentimentData: [],
        debateStatement: '',
        isActive: false,
        startTime: null,
        timeLimit: 1800, // 30 minutes default
        apiKey: null
      });
    }
    
    const room = debateRooms.get(roomId);
    room.participants.push({ 
      socketId: socket.id, 
      username, 
      side,
      joinTime: new Date()
    });
    
    socket.to(roomId).emit('user-joined', { username, side });
    
    // Send current debate state to new user
    socket.emit('debate-state', {
      statement: room.debateStatement,
      isActive: room.isActive,
      arguments: room.debateArguments,
      aiEngine: (room.apiKey || process.env.GEMINI_API_KEY) ? 'Gemini 2.5 AI Engine' : 'Local Natural NLP Engine'
    });
  });

  socket.on('set-gemini-key', ({ roomId, apiKey }) => {
    const room = debateRooms.get(roomId);
    if (room) {
      room.apiKey = apiKey;
      io.to(roomId).emit('ai-engine-updated', { 
        engine: apiKey ? 'Gemini 2.5 AI Engine' : 'Local Natural NLP Engine' 
      });
    }
  });

  socket.on('start-debate', (debateData) => {
    const { roomId, statement, timeLimit, startTime } = debateData;
    const room = debateRooms.get(roomId);
    
    if (room) {
      room.debateStatement = statement;
      room.isActive = true;
      room.startTime = startTime;
      room.timeLimit = timeLimit;
      
      io.to(roomId).emit('debate-started', {
        statement,
        timeLimit,
        startTime
      });
    }
  });

  socket.on('end-debate', (data) => {
    const { roomId } = data;
    const room = debateRooms.get(roomId);
    
    if (room) {
      room.isActive = false;
      io.to(roomId).emit('debate-ended', {
        summary: generateDebateSummary(room)
      });
    }
  });

  socket.on('new-argument', async (data) => {
    const { roomId, argument, side } = data;
    const room = debateRooms.get(roomId);
    
    if (room && room.isActive) {
      try {
        // AI Analysis of the argument with debate statement context & Gemini Key if present
        const analysis = await argumentAnalyzer.analyzeArgument(
          argument, 
          room.debateStatement, 
          side, 
          room.apiKey
        );
        
        const argumentData = {
          id: Date.now(),
          text: argument,
          side: side,
          timestamp: new Date(),
          score: analysis.score,
          analysis: {
            strength: analysis.strength,
            evidence: analysis.evidence,
            tone: analysis.tone,
            clarity: analysis.clarity,
            relevance: analysis.relevance,
            motionAlignment: analysis.motionAlignment,
            sideMatch: analysis.sideMatch,
            strengthLevel: analysis.strengthLevel,
            evidenceDetected: analysis.evidenceDetected,
            toneLabel: analysis.toneLabel,
            feedback: analysis.feedback,
            aiEngine: analysis.aiEngine
          }
        };
        
        room.debateArguments.push(argumentData);
        io.to(roomId).emit('argument-posted', argumentData);
        
        // Emit AI feedback
        io.to(roomId).emit('ai-feedback', {
          argumentId: argumentData.id,
          analysis: argumentData.analysis
        });
        
      } catch (error) {
        console.error('Error analyzing argument:', error);
        socket.emit('error', 'Failed to analyze argument');
      }
    }
  });

  socket.on('audience-reaction', (data) => {
    const { roomId, emoji, argumentId } = data;
    io.to(roomId).emit('reaction-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from all rooms
    for (const [roomId, room] of debateRooms) {
      room.participants = room.participants.filter(p => p.socketId !== socket.id);
      if (room.participants.length === 0) {
        debateRooms.delete(roomId);
      }
    }
  });
});

function generateDebateSummary(room) {
  const proArguments = room.debateArguments.filter(arg => arg.side === 'pro');
  const conArguments = room.debateArguments.filter(arg => arg.side === 'con');
  
  const proAvgScore = proArguments.reduce((sum, arg) => sum + arg.score, 0) / proArguments.length || 0;
  const conAvgScore = conArguments.reduce((sum, arg) => sum + arg.score, 0) / conArguments.length || 0;
  
  return {
    statement: room.debateStatement,
    totalArguments: room.debateArguments.length,
    proArguments: proArguments.length,
    conArguments: conArguments.length,
    proAvgScore: Math.round(proAvgScore),
    conAvgScore: Math.round(conAvgScore),
    winner: proAvgScore > conAvgScore ? 'Pro' : 'Con',
    topArguments: room.debateArguments
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  };
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
