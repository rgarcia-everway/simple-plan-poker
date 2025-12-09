import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const FIBONACCI = [1, 2, 3, 5, 8, 13, 21, 40, 100, '?'];
const SOCKET_SERVER = import.meta.env.DEV ? 'http://localhost:3000' : '/';

function App() {
  const [socket, setSocket] = useState(null);
  const [name, setName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState({});
  const [myVote, setMyVote] = useState(null);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [revealTime, setRevealTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);

  const hasVoted = myVote !== null;
  const isAdmin = players[socket?.id]?.isAdmin;

  useEffect(() => {
    const socket = io(SOCKET_SERVER);
    setSocket(socket);

    socket.on('state', (state) => {
      setPlayers(state.players);
      setVotingInProgress(state.votingInProgress);
      setRevealed(false);
      setRevealTime(state.revealTime);
      setMyVote(state.players[socket.id]?.vote || null);
    });

    socket.on('playersUpdate', setPlayers);
    socket.on('votingStarted', (time) => {
      setVotingInProgress(true);
      setRevealed(false);
      setMyVote(null);
      setRevealTime(time);
      setTimeLeft(60);
    });
    socket.on('reveal', () => {
      setRevealed(true);
      setVotingInProgress(false);
    });
    socket.on('votingReset', () => {
      setVotingInProgress(false);
      setRevealed(false);
      setMyVote(null);
      setRevealTime(null);
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (!revealTime || !votingInProgress) return;
    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((revealTime - Date.now()) / 1000));
      setTimeLeft(left);
      if (left === 0) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [revealTime, votingInProgress]);

  function handleSetName() {
    if (name.trim() && socket) {
      setPlayerName(name.trim());
      socket.emit('setName', name.trim());
    }
  }

  function startVoting() {
    socket?.emit('startVoting');
  }

  function vote(value) {
    if (!votingInProgress || hasVoted) return;
    setMyVote(value);
    socket?.emit('vote', value);
  }

  function reset() {
    socket?.emit('reset');
  }

  function getPieData() {
    const voteCounts = {};
    Object.values(players).forEach(p => {
      const v = p.vote;
      if (v !== null) {
        voteCounts[v] = (voteCounts[v] || 0) + 1;
      }
    });
    const labels = Object.keys(voteCounts);
    const data = Object.values(voteCounts);
    const backgroundColor = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#E7E9ED', '#C9CBCF', '#A8E6CE', '#DCEDC2'
    ].slice(0, labels.length);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor,
        hoverBackgroundColor: backgroundColor
      }]
    };
  }

  if (!playerName) {
    return (
      <div className="center">
        <h1>Planning Poker</h1>
        <input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSetName()}
        />
        <button onClick={handleSetName}>Join</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Planning Poker</h1>
        <div className="controls">
          {!votingInProgress && !revealed && isAdmin && (
            <button onClick={startVoting} className="start">Start Voting</button>
          )}
          {revealed && isAdmin && <button onClick={reset} className="start">New Round</button>}
          {votingInProgress && <div className="timer">Time left: {timeLeft}s</div>}
        </div>
      </header>

      <div className="players">
        {Object.entries(players).map(([id, p]) => (
          <div key={id} className={`player ${p.vote !== null ? 'voted' : ''} ${revealed ? 'revealed' : ''}`}>
            <div className="name">{p.name} {p.isAdmin ? '(Admin)' : ''}</div>
            <div className="card">
              {revealed || (socket?.id === id && hasVoted) ? p.vote : (p.vote !== null ? '✓' : '?')}
            </div>
          </div>
        ))}
      </div>

      {revealed && (
        <div className="pie-chart">
          <Pie data={getPieData()} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
      )}

      {!revealed && votingInProgress && (
        <div className="cards">
          {FIBONACCI.map(val => (
            <button
              key={val}
              className={`card-btn ${myVote === val ? 'selected' : ''}`}
              onClick={() => vote(val)}
              disabled={hasVoted}
            >
              {val}
            </button>
          ))}
        </div>
      )}

      {hasVoted && votingInProgress && !revealed && (
        <p className="waiting">Waiting for others... ({Object.values(players).filter(p => p.vote !== null).length}/{Object.keys(players).length})</p>
      )}
    </div>
  );
}

export default App;