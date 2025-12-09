# Simple Planning Poker App README

## Overview
This is a simple multiplayer Planning Poker application built with React (frontend) and Node.js + Socket.IO (backend). It uses Fibonacci sequence cards for voting on tasks (e.g., story points in Agile). All users who access the same URL join a single global session—no multiple rooms.

Key features:
- Fibonacci cards: 1, 2, 3, 5, 8, 13, 21, 40, 100, ?
- Voting starts with a "Start Voting" button.
- Votes reveal automatically after everyone votes or after a 1-minute timer.
- Real-time updates for all players.
- Pie chart displays vote distribution on reveal.
- Admin role: Only the first player to join can start voting or reset for a new round.

## Prerequisites
- Node.js (v18+ recommended)
- npm (comes with Node.js)
- For public sharing: ngrok (free account/download from https://ngrok.com)

## Installation
1. Clone or download the project files (including `server.js`, `src/App.jsx`, `src/App.css`, `vite.config.js`, and `package.json`).
2. In the project directory, run:
   ```
   npm install
   ```
   This installs all dependencies (React, Socket.IO, Express, Chart.js, etc.).

## How to Start Locally (Development Mode)
1. Run both the frontend (Vite on port 5173) and backend (Node.js on port 3000) simultaneously:
   ```
   npm start
   ```
   - This uses `concurrently` to launch both.
   - Terminal logs: "Planning Poker running on http://localhost:3000" (backend) and Vite dev server info.
2. Open http://localhost:5173 in multiple browser tabs/windows.
3. Enter a name to join. The first player is automatically the admin (marked as "(Admin)" in the player list).
4. As admin, click "Start Voting" to begin a round. Others can vote, but only admin controls start/reset.

**Notes**:
- In dev mode, the frontend connects to `http://localhost:3000` for Socket.IO.
- Test multiplayer by opening multiple tabs.
- Admin: The very first user to set their name becomes admin. If they disconnect, no new admin is assigned—restart the server to reset.

## How to Start in Production Mode (for Ngrok/Public Sharing)
For sharing publicly (e.g., via ngrok), build the frontend and let the backend serve it statically. This ensures everything runs on one port (3000) with no CORS issues.

1. Build the React app:
   ```
   npm run build
   ```
   - Creates a `dist/` folder with optimized static files.
2. Start the backend server (which serves the frontend):
   ```
   npm run server
   ```
   - Access locally at http://localhost:3000.
3. Join as before: First player is admin.

- Admin privileges:
  - Only the admin sees and can click the "Start Voting" button.
  - Only the admin can click "New Round" after a reveal to reset.
- Identification: Admin's name shows with "(Admin)" in the player list.
- If the admin disconnects, no one else becomes admin. To reassign, restart the server and have someone join first.
- All other players can only vote once a round starts.

## How to Publish/Publicly Share via Ngrok
Ngrok tunnels your local app to a public URL for remote access (e.g., sharing with team members over the internet).

1. Ensure the app is running in production mode (see above: `npm run build` then `npm run server`).
2. Download and install ngrok (https://ngrok.com/download). Sign up for a free account if prompted.
3. In a new terminal, start ngrok to tunnel port 3000:
   ```
   ngrok http 3000
   ```
   - Ngrok output shows a public URL, e.g., https://random-subdomain.ngrok-free.app.
   - Copy the HTTPS forwarding URL.
4. Share the ngrok URL with others. They access it in their browsers to join the same session.
5. You (or others) join via the ngrok URL: Enter name, first joiner is admin.

**Ngrok Tips**:
- Free tier URLs change on restart. For static domains, upgrade to paid or use `--domain=your-custom.ngrok-free.app` (if available).
- Close ngrok (Ctrl+C) when done to stop public exposure.
- Browser access: Use the HTTPS URL to avoid mixed-content issues.
- Multiplayer: Works across devices/internet—everyone joins the global session.
- If ngrok asks for auth, follow setup instructions in your ngrok dashboard.

## Troubleshooting
- **Connection errors**: Ensure backend is running (port 3000). Check console/terminal logs.
- **CORS issues**: Only occur in dev mode with mismatched origins—use production mode for ngrok.
- **Port conflicts**: Change `PORT` in `server.js` if 3000 is busy.
- **Dependencies missing**: Rerun `npm install`.
- **Admin not working**: Restart server and join first.

For questions or issues, refer to the code or debug with console logs.