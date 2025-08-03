"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export default function ChatRoom() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<{ id: string; topic: string }[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const createRoom = async (topic: string) => {
    if (!topic.trim()) return;
    try {
      await fetch(`http://localhost:3001/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      getRooms(); // Refresh the room list
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const getRooms = async () => {
    try {
      const res = await fetch(`http://localhost:3001/rooms`);
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  useEffect(() => {
    getRooms();
  }, []);

  const joinRoom = (room: { id: string; topic: string }) => {
    router.push(`/rooms/${room.id}?topic=${encodeURIComponent(room.topic)}`);
    if (socket) {
      socket.emit('joinRoom', room.id);
      setIsConnected(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4"> Argumint Debate Rooms</h1>
          <div className="flex justify-end">
            <button
              onClick={() => createRoom(prompt("Enter room topic:") || "")}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
            >
              ➕ Create New Room
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-lg shadow p-5 flex flex-col justify-between hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{room.topic}</h2>
                <button
                  onClick={() => joinRoom(room)}
                  className="mt-auto self-start px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                >
                  Join Room →
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center col-span-full">No rooms available. Create one!</p>
          )}
        </div>
      </div>
    </div>
  );
}
