const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 8080 });

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
  });
});

console.log('WebSocket server is running on wss://omogle.onrender.com');