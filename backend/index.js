const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

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
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST"]
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(express.json());

// Middleware for authenticating socket connections
io.use((socket, next) => {
  const authHeader = socket.handshake.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new Error('Authentication error: No token provided'));
  }
  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new Error('Authentication error Token is not valid'));
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = user;
    next();
  });
});

// Placeholder for NLP verification
async function verifyFlip(message) {
  // In a real application, this would involve a call to an NLP service
  console.log(`Verifying flip message: "${message}"`);
  return new Promise(resolve => setTimeout(() => resolve(true), 1000));
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.user.walletAddress);

  socket.on('joinRoom', async ({ roomId }) => {
    try {
      socket.join(roomId);
      await prisma.user.update({
        where: { walletAddress: socket.user.walletAddress },
        data: { roomId: roomId, team: null },
      });
      console.log(`User ${socket.user.walletAddress} joined room ${roomId}`);
      socket.to(roomId).emit('userJoined', { userId: socket.user.id });
    } catch (error) {
      console.error('Error in joinRoom:', error);
      socket.emit('error', { message: 'Failed to join room.' });
    }
  });

  socket.on('newMessage', async ({ roomId, message }) => {
  try {
    if (!message || !roomId) {
      console.warn(`Invalid message or roomId:`, { roomId, message });
      return socket.emit('error', { message: 'Invalid input' });
    }

    const newMessage = await prisma.message.create({
      data: {
        content: message,
        authorId: socket.user.id,
        roomId,
      },
    });

    const serializableMessage = {
      id: newMessage.id,
      content: newMessage.content,
      createdAt: newMessage.createdAt.toISOString(),
      updatedAt: newMessage.updatedAt.toISOString(),
      authorId: newMessage.authorId,
      roomId: newMessage.roomId,
    };

    io.to(roomId).emit('messageBroadcast', serializableMessage);
  } catch (error) {
    console.error('Error in newMessage:', error);
    socket.emit('error', { message: 'Failed to send message.' });
  }
});


  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${reason}`);
  });
});

// REST Endpoints
app.post('/rooms', async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }
  const room = await prisma.room.create({
    data: {
      topic,
    },
  });
  res.json(room);
});

app.get('/rooms', async (req, res) => {
  const rooms = await prisma.room.findMany({
    include: {
      users: true,
    },
  });
  res.json(rooms);
});

app.post('/rooms/:id/join', async (req, res) => {
    const { walletAddress, team } = req.body;
    const roomId = req.params.id;

    let user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
        user = await prisma.user.create({ data: { walletAddress } });
    }

    const token = jwt.sign({ id: user.id, walletAddress }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
});


app.post('/rooms/:id/flip', async (req, res) => {
  const { userId, persuaderId } = req.body;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const oldTeam = user.team;
  const newTeam = oldTeam === 'A' ? 'B' : 'A';

  await prisma.user.update({
    where: { id: userId },
    data: { team: newTeam },
  });

  await prisma.teamSwitch.create({
    data: {
      userId,
      fromTeam: oldTeam,
      toTeam: newTeam,
      persuaderId,
    },
  });

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
