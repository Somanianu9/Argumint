const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cron = require("node-cron");
const { runLogProcessor } = require("./transform.js");

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});


// DB Connection Check
(async () => {
  try {
    await prisma.$connect();
    console.log("Database connection successful.");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
})();

// CRON Job
cron.schedule("*/10 * * * * *", () => {
  console.log("Running scheduled log processing job...");
  runLogProcessor();
});

// WebSocket Events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

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

// Create or update user
app.post("/createUser", async (req, res) => {
  const { walletAddress, username } = req.body;
  if (!walletAddress || !username) {
    return res
      .status(400)
      .json({ error: "Wallet address and username are required" });
  }

  try {
    let user = await prisma.User.findUnique({ where: { walletAddress } });
    if (!user) {
      user = await prisma.User.create({ data: { walletAddress, username } });
    } else {
      user = await prisma.User.update({
        where: { walletAddress },
        data: { username },
      });
    }
    res.json(user);
  } catch (error) {
    console.error("Error creating/updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all rooms with debates
app.get("/rooms", async (req, res) => {
  try {
    const rooms = await prisma.Debate.findMany({
      where: { isActive: true },
    });
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new room (and associated debate)


// Join a room (assigns user to a team and links to debate)
app.post("/rooms/:roomId/join", async (req, res) => {
  const { walletAddress } = req.body;
  const { roomId } = req.params;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try {
    const user = await prisma.User.findUnique({ where: { walletAddress } });
    const room = await prisma.Room.findUnique({
      where: { id: roomId },
      include: { debate: true },
    });

    if (!user || !room || !room.debate) {
      return res.status(404).json({ error: "User or room not found" });
    }

    const currentUsers = await prisma.User.findMany({
      where: { debateId: room.debate.debateId },
    });

    if (currentUsers.find((u) => u.id === user.id)) {
      return res.status(200).json({ message: "User already joined" });
    }

    if (currentUsers.length >= 10) {
      return res.status(400).json({ error: "Room is full" });
    }

    const team =
      currentUsers.filter((u) => u.team === 1).length <=
      currentUsers.filter((u) => u.team === 2).length
        ? 1
        : 2;

    const updatedUser = await prisma.User.update({
      where: { id: user.id },
      data: {
        debateId: room.debate.debateId,
        team,
        joinedAt: new Date(),
      },
    });

    res.json({ message: "Joined room", user: updatedUser, team });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
