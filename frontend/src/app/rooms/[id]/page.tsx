"use client";

import { useState, useEffect, useRef, use } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {socket } from '../../../../utils/socket';


interface Message {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export default function RoomPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.id as string;
  const topic = searchParams.get('topic') || 'Chat Room';


  const connectSocket = async () => {
    await socket.connect();
    if (!roomId) {
      alert("Room ID is missing!");
      return;
    }
    if(!socket){
      alert("socket not connected");
      console.log(socket);
    }
    socket.on('connect', () => {
      setIsConnected(true);
      alert(  "socket connected to room: " );
    });
  }

  useEffect(() => {
    connectSocket();
    if (socket) {
      console.log(`Joining room: ${roomId}`);
    }

    // Listen for incoming messages
    socket.on('message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      // Cleanup on unmount
      socket.off('message');
      socket.disconnect();
    };
  }, []);


  useEffect(()=>{

  },[])

  const sendMessage = () => {
    console.log(newMessage)
    if (socket && newMessage.trim()) {
      socket.emit('newMessage', {
        roomId,
        message: newMessage.trim()
      });
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-gray-800">Chat Room: <span className="font-mono text-lg bg-gray-200 px-2 py-1 rounded">{topic}</span></h1>

      </div>
 <div>
  <input
      type="text"
      placeholder="Enter your message..."
      className="text-black"
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
    />
    <button
      onClick={sendMessage}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
    >
      Send
    </button>
 </div>

    </div>
  );
}
