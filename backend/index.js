const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken')
const cors = require('cors');
const prisma = new PrismaClient();
const cron = require('node-cron');
const { runLogProcessor } = require("./transform.js");






// Test DB connection
async function testDbConnection() {
  try {
    await prisma.$connect();
    console.log('Database connection successful.');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1); // Exit if we can't connect to the DB
  }
}
testDbConnection();

const app = express();
const server = http.createServer(app);
app.use(cors());
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow all origins for testing
    methods: ["GET", "POST"]
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(express.json());

// Middleware for authenticating socket connections
// io.use((socket, next) => {
//   const authHeader = socket.handshake.headers.authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return next(new Error('Authentication error: No token provided'));
//   }
//   const token = authHeader.split(' ')[1];

//   if (!token) {
//     return next(new Error('Authentication error Token is not valid'));
//   }
//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) {
//       return next(new Error('Authentication error: Invalid token'));
//     }
//     socket.user = user;  // What user?
//     next();
//   });
// });

cron.schedule('*/10 * * * * *', () => {
  console.log('Running scheduled log processing job...');
  runLogProcessor();
});




// Placeholder for NLP verification
async function verifyFlip(message) {
  // In a real application, this would involve a call to an NLP service
  console.log(`Verifying flip message: "${message}"`);
  return new Promise(resolve => setTimeout(() => resolve(true), 1000));
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on("sendMessage", (data) => {
    const { content, roomId } = data;
    console.log(`Message received: ${content} for room ${roomId}`);
    socket.to(roomId).emit("receiveMessage", content);
  });

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });
});


// REST Endpoints

app.post('/createUser', async (req, res) => {
  const { walletAddress, username } = req.body;
  if (!walletAddress || !username) {
    return res.status(400).json({ error: 'Wallet address and username are required' });
  }
  try {
    let user = await prisma.User.findUnique({ where: { walletAddress } });
    if (!user) {
      user = await prisma.User.create({
        data: {
          walletAddress,
          username,
        },
      });
    } else {
      user = await prisma.User.update({
        where: { walletAddress },
        data: {
          username,
        },
      });
    }
    res.json(user);
  } catch (error) {
    console.error('Error creating or updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/rooms', async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }
  const room = await prisma.Room.create({
    data: {
      topic,
    },
  });
  res.json(room);
});

app.get('/rooms', async (req, res) => {
  const rooms = await prisma.Debate.findMany({
   
  });
  res.json(rooms);
});




const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
