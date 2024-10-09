const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

// Set up Express app
const app = express();
const server = http.createServer(app);

// WebSocket setup
const wss = new WebSocket.Server({ server });

// Store rooms and user pairs
let rooms = {};

// Handle WebSocket connections
wss.on('connection', (ws) => {
  const userId = uuidv4();
  console.log(`User connected: ${userId}`);
  ws.userId = userId;

  ws.on('message', (message) => {
    // If the message is an object, stringify it for better readability
    console.log(`Received from ${userId}:`, typeof message === 'string' ? message : JSON.stringify(message));

    // Broadcast the message to all connected clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ userId, message }));
      }
    });
  });

  ws.on('close', () => {
    console.log(`User disconnected: ${userId}`);
    // Remove the user from the room when they disconnect (if necessary)
    for (let roomId in rooms) {
      if (rooms[roomId].includes(userId)) {
        rooms[roomId] = rooms[roomId].filter(id => id !== userId);
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];  // Remove empty room
        }
        break;
      }
    }
  });
});

// REST API endpoint to handle room assignments
app.get('/chat/:id', (req, res) => {
  const userId = req.params.id;
  let roomId;

  // Look for a room with less than 2 users
  for (let room in rooms) {
    if (rooms[room].length < 2) {
      rooms[room].push(userId);
      roomId = room;
      break;
    }
  }

  // If no room is found, create a new room
  if (!roomId) {
    roomId = `room-${Date.now()}`;
    rooms[roomId] = [userId];
  }

  res.json({ roomId });
});

// Start the HTTP server
server.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});