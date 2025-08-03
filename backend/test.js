import { io } from 'socket.io-client';
import readline from 'readline';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


// Step 1: fetch token
async function joinRoomAndConnect(walletAddress, roomId) {
  const res = await fetch(`http://localhost:3001/rooms/${roomId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ walletAddress })
  });

  if (!res.ok) {
    throw new Error('Failed to join room');
  }

  const { token } = await res.json();

  const socket = io('http://localhost:3001', {
    extraHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  socket.on('connect', async () => {
    console.log('Socket connected! Joining room...');
    socket.emit('joinRoom', { roomId });

    console.log('You can now send messages. Type a message and press Enter.');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
let user = await prisma.user.findUnique({ where: { walletAddress } });
    rl.on('line', async  (line) => {
      if (line.trim()) {
          const newMessage = await prisma.message.create({
          data: {
            content: line,
            authorId: user.id,
            roomId,
          },
        });
        socket.emit('newMessage',  {
      authorId : newMessage.authorId,
      message: newMessage.content
    });
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      rl.close();
      process.exit();
    });
  });

  socket.on('messageBroadcast', (newMessage) => {
    console.log(`${newMessage.authorId}:`, newMessage.content);

  });

  return socket;
}

joinRoomAndConnect('0xabcd', 'cmd9zjtw30001zjdf17adqdds');

