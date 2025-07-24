"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Room {
  id: string;
  topic: string;
}

export default function ChatRoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isClient, setIsClient] = useState(false); // To ensure localStorage is accessed client-side

  useEffect(() => {
    setIsClient(true);
  }, []);

  const walletAddress = isClient ? localStorage.getItem('walletAddress') : null;
  const username = isClient ? localStorage.getItem('username') : null; // Get username

  useEffect(() => {
    if (isClient && !walletAddress) {
      // If no wallet connected, redirect to home/login
      router.push('/');
      return;
    }
    if (isClient) {
      getRooms();
    }
  }, [walletAddress, isClient, router]); // Added username to dependency array

  const createRoom = async (topic: string) => {
    if (!topic.trim()) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create room");
      }

      const newRoom: Room = await res.json();
      setRooms((prev) => [...prev, newRoom].sort((a, b) => a.topic.localeCompare(b.topic))); // Sort by topic
    } catch (error: any) {
      console.error("Error creating room:", error);
      alert(`Error creating room: ${error.message}`);
    }
  };

  const getRooms = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`);
      if (!res.ok) {
        throw new Error("Failed to fetch rooms");
      }
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      alert("Error fetching rooms. Please try again.");
    }
  };

  const joinRoom = (room: Room) => {
    // Pass username as well, though the chat page fetches it too
    router.push(`/rooms/${room.id}?topic=${encodeURIComponent(room.topic)}`);
  };

  if (!isClient || !walletAddress) {
    return <div className="p-4 text-center text-gray-600">Please connect your wallet...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow-md p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Available Chat Rooms</h1>

        <div className="mt-4 text-black">
          <h2 className="text-lg font-semibold mb-2">Join a Room:</h2>
          {rooms.length === 0 ? (
            <p className="text-gray-600">No rooms yet. Be the first to create one!</p>
          ) : (
            <ul className="space-y-3 mt-2 max-h-96 overflow-y-auto pr-2">
              {rooms.map((room) => (
                <li key={room.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm">
                  <span className="text-gray-800 font-medium text-lg">{room.topic}</span>
                  <button
                    onClick={() => joinRoom(room)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Join
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={() => {
              const topic = prompt("Enter a topic for your new chat room:");
              if (topic) createRoom(topic);
            }}
            className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Create New Room
          </button>
        </div>
      </div>
    </div>
  );
}