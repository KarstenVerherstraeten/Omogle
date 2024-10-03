const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws, req) => {
  // Log when a new connection is made
  console.log(`New connection from ${req.socket.remoteAddress}`);

  // When a message is received from the client
  ws.on('message', (message) => {
    console.log(`Received message from ${req.socket.remoteAddress}: ${message}`);

    // Broadcast the message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Log when the client disconnects
  ws.on('close', () => {
    console.log(`Connection from ${req.socket.remoteAddress} closed`);
  });

  // Log any errors
  ws.on('error', (error) => {
    console.error(`Error with connection from ${req.socket.remoteAddress}:`, error);
  });
});

console.log('WebSocket server is running on ws://localhost:8080');