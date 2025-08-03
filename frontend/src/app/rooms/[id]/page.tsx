"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

interface Message {
  content: string;
  sender?: string;
  timestamp?: string;
}

let socket: Socket;

export default function RoomPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.id as string;
  const topic = searchParams.get('topic') || 'Chat Room';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket = io('http://localhost:3001');

    socket.on("connect", () => {
      console.log("Connected with ID:", socket.id);
      socket.emit("joinRoom", roomId);
    });

    socket.on("receiveMessage", (content) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const messagePayload = {
      content: newMessage,
      roomId,
    };

    // Optimistically add the message to your own screen
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        content: newMessage,
        sender: "You",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    socket.emit("sendMessage", messagePayload);
    setNewMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Chat Room: <span className="font-mono text-lg bg-gray-200 px-2 py-1 rounded">{topic}</span>
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="bg-white p-3 rounded shadow w-fit max-w-md">
            <div className="text-sm text-gray-600">
              {msg.sender || "Stranger"} • {msg.timestamp}
            </div>
            <div className="text-gray-900">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter your message..."
          className="text-black flex-1 border border-gray-300 px-3 py-2 rounded"
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
