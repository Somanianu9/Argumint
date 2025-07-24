const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'http://localhost:3000', // Allow your Next.js app
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Test DB connection on startup
async function testDbConnection() {
  try {
    await prisma.$connect();
    console.log('Database connection successful.');
  } catch (error) {
    console.error('Failed to connect to DB:', error);
    process.exit(1); // Exit if DB connection fails
  }
}
testDbConnection();

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('sendMessage', async ({ content, walletAddress, roomId }) => {
    if (!content || !walletAddress || !roomId) {
      console.error('Missing data for sendMessage:', { content, walletAddress, roomId });
      return;
    }

    try {
      // Upsert user based on walletAddress
      // This will ensure the user exists. We don't update username here,
      // as username updates happen via the /api/users endpoint.
      const user = await prisma.user.upsert({
        where: { walletAddress },
        update: {},
        create: { walletAddress },
      });

      // Check if room exists
      const roomExists = await prisma.room.findUnique({ where: { id: roomId } });
      if (!roomExists) {
        console.error(`Room with ID ${roomId} not found.`);
        return;
      }

      // Create message linked to user and room
      const message = await prisma.message.create({
        data: {
          content,
          roomId,
          authorId: user.id,
        },
        include: { author: true }, // Include author to get walletAddress/username
      });

      // Emit message to all clients in the room
      io.to(roomId).emit('message', {
        id: message.id,
        content: message.content,
        authorId: message.author.walletAddress,
        authorUsername: message.author.username || message.author.walletAddress.substring(0, 6) + '...', // Fallback to truncated wallet
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error('Error in sendMessage:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// HTTP API Endpoints

// Create or update a user with wallet address and optional username
app.post('/api/users', async (req, res) => {
  const { walletAddress, username } = req.body;
  if (!walletAddress) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: { username: username || undefined }, // Only update username if provided
      create: { walletAddress, username },
      select: { id: true, walletAddress: true, username: true }, // Only return necessary fields
    });
    res.json(user);
  } catch (error) {
    console.error('Failed to create/update user:', error);
    res.status(500).json({ error: 'Failed to create/update user' });
  }
});

// Create a new chat room with a topic
app.post('/api/rooms', async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  try {
    const room = await prisma.room.create({ data: { topic } });
    res.json(room);
  } catch (error) {
    console.error('Failed to create room:', error);
    // Check for unique constraint violation (topic already exists)
    if (error.code === 'P2002' && error.meta?.target?.includes('topic')) {
      return res.status(409).json({ error: 'Room with this topic already exists.' });
    }
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get all rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { topic: 'asc' }, // Order rooms alphabetically
    });
    res.json(rooms);
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get all messages in a room
app.get('/api/messages/:roomId', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { roomId: req.params.roomId },
      orderBy: { createdAt: 'asc' },
      include: { author: true }, // Include author to get walletAddress/username
    });

    const formatted = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      authorId: msg.author.walletAddress, // Still sending walletAddress as authorId
      authorUsername: msg.author.username || msg.author.walletAddress.substring(0, 6) + '...', // Send username for display
      createdAt: msg.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server shut down.');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server shut down.');
    process.exit(0);
  });
});