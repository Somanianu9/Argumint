"use client";

import { useState, useEffect, useRef, use } from 'react';
import { io, Socket } from 'socket.io-client';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import RoomPage from '@/app/rooms/[id]/page';

interface Message {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}
export default function ChatRoom() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [rooms, setRooms] = useState<{ id: string; topic: string }[]>([]); // Default room for now
  const [isConnected, setIsConnected] = useState(false);


  // Workflow
  // 1. Create a room - POST endpoint
  // 2. Join a room - POST endpoint
  // 3. Send a message - POST endpoint
  // 4. Receive message from different browser window

  const createRoom = async (topic: string) => {
    try {
      const res = await fetch(`http://localhost:3001/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({  topic })
      });
  } catch (error) {
        console.error("Error creating room:", error);
        }
    }
    const getRooms = async () => {
        try {
            const res = await fetch(`http://localhost:3001/rooms`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            setRooms(data);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    }

    useEffect(() => {
        getRooms();
    }, []);

    const joinRoom = (room : { id: string, topic: string }) => {

        router.push(`/rooms/${room.id}?topic=${encodeURIComponent(room.topic)}`);
    if (socket) {
      socket.emit('joinRoom', room.id);
      setIsConnected(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-gray-800">Argumint Chat</h1>
        <div className="mt-4 text-black">

            Select a room
            {rooms.map((room) => (
              <div key={room.id}>
                <ul>
                  <li value={room.id}>
                    {room.topic}
                    <button onClick={() => joinRoom(room)}>Join</button>
                    </li>
                </ul>
             </div>
            ))}

          <button
            onClick={() => createRoom(prompt("Enter room topic:") || "")}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Create Room
          </button>
        </div>
      </div>




    </div>
  );
}
