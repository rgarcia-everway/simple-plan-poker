// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const FIBONACCI = [1, 2, 3, 5, 8, 13, 21, 40, 100, "?"];

let players = new Map(); // socket.id -> { name, vote, isAdmin }
let votingInProgress = false;
let revealTime = null;
let timer = null;

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Send current state
  socket.emit('state', {
    players: Object.fromEntries(players),
    votingInProgress,
    revealTime
  });

  socket.on('setName', (name) => {
    const playerName = name.trim() || `Player ${players.size + 1}`;
    const isAdmin = players.size === 0;
    players.set(socket.id, { name: playerName, vote: null, isAdmin });
    io.emit('playersUpdate', Object.fromEntries(players));
  });

  socket.on('startVoting', () => {
    const player = players.get(socket.id);
    if (!player?.isAdmin || votingInProgress) return;
    votingInProgress = true;
    revealTime = Date.now() + 60_000; // 1 minute from now
    players.forEach((p, id) => players.set(id, { ...p, vote: null }));
    io.emit('votingStarted', revealTime);

    // Auto reveal after 60 seconds
    timer = setTimeout(() => {
      votingInProgress = false;
      revealTime = null;
      io.emit('reveal');
    }, 60_000);
  });

  socket.on('vote', (value) => {
    if (!votingInProgress || !FIBONACCI.includes(value)) return;
    players.set(socket.id, { ...players.get(socket.id), vote: value });
    io.emit('playersUpdate', Object.fromEntries(players));

    // Check if everyone voted
    const allVoted = [...players.values()].every(p => p.vote !== null);
    if (allVoted && votingInProgress) {
      clearTimeout(timer);
      votingInProgress = false;
      revealTime = null;
      io.emit('reveal');
    }
  });

  socket.on('reset', () => {
    const player = players.get(socket.id);
    if (!player?.isAdmin) return;
    clearTimeout(timer);
    votingInProgress = false;
    revealTime = null;
    players.forEach((p, id) => players.set(id, { ...p, vote: null }));
    io.emit('votingReset');
  });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    io.emit('playersUpdate', Object.fromEntries(players));
    console.log('Player disconnected:', socket.id);
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Planning Poker running on http://localhost:${PORT}`);
});