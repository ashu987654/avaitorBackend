const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const expressServer = http.createServer(app);
const io = socketIO(expressServer);
const walletRoute=require('./routes/walletRoutes')

// Import the generateAndBroadcastNumber and sendMoney functions
const { generateAndBroadcastNumber, sendMoney } = require('./controllers/generateController');

// Serve HTML file for testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const MONGODB_USERNAME = encodeURIComponent(process.env.MONGODB_USERNAME);
const MONGODB_PASSWORD = encodeURIComponent(process.env.MONGODB_PASSWORD);
const MONGODB_DBNAME = process.env.MONGODB_DBNAME;

// Check if the MongoDB URI is defined
if (!MONGODB_USERNAME || !MONGODB_PASSWORD || !MONGODB_DBNAME) {
  console.error('MongoDB connection details are incomplete. Please check your environment variables.');
  process.exit(1); // Exit the application if MongoDB URI is not defined
}

const MONGODB_URI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@cluster0.zwwed4z.mongodb.net/${MONGODB_DBNAME}?retryWrites=true&w=majority`;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
});

// Import the generate route and use it under the '/api' path
const generateRoutes = require('./routes/generateRoutes');
app.use('/api', generateRoutes(io));

const userRoutes = require('./routes/userRoute');
app.use('/user', userRoutes);
app.use('/wallet',walletRoute)
// Start the Express server on port 3000
const EXPRESS_PORT = 3000;
expressServer.listen(EXPRESS_PORT, () => {
});

// Start Socket.IO on port 4000
const SOCKET_IO_PORT = 4000;
io.listen(SOCKET_IO_PORT);

// Initial call to generateAndBroadcastNumber (commented out)
// generateAndBroadcastNumber();

// Example: Send Money functionality
app.post('/api/sendMoney', express.json(), async (req, res) => {
  const { senderId, receiverId, amount } = req.body;

  try {
    await sendMoney(io, senderId, receiverId, amount);
    res.status(200).json({ message: 'Money sent successfully' });
  } catch (error) {
    console.error('Error sending money:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
