"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { socket } from '../../../../utils/socket';

interface Message {
  id: string;
  content: string;
  authorId: string; // This will be the wallet address
  authorUsername: string; // This will be the display username
  createdAt: string;
}

export default function RoomPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isClient, setIsClient] = useState(false); // To ensure localStorage is accessed client-side
  const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = params.id as string;
  const topic = searchParams.get('topic') || 'Chat Room';

  const walletAddress = isClient ? localStorage.getItem('walletAddress') : null;
  const username = isClient ? localStorage.getItem('username') : null; // Get username from localStorage

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Redirect if no wallet is connected or room ID is missing
    if (isClient && (!walletAddress || !roomId)) {
      router.push('/');
      return;
    }

    if (isClient && walletAddress && roomId) {
      // Fetch initial messages
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${roomId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => setMessages(data))
        .catch((error) => console.error("Error fetching initial messages:", error));

      // Connect to socket and join room
      socket.connect();
      socket.emit('joinRoom', roomId);

      // Listen for new messages
      socket.on('message', (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });

      // Cleanup on component unmount
      return () => {
        socket.off('message');
        socket.emit('leaveRoom', roomId); // Optional: Emit a leave room event
        socket.disconnect();
      };
    }
  }, [roomId, walletAddress, isClient, router]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !walletAddress) return;

    socket.emit('sendMessage', {
      content: newMessage.trim(),
      walletAddress,
      roomId,
    });
    setNewMessage('');
  };

  if (!isClient || !walletAddress || !roomId) {
    return <div className="p-4 text-center text-gray-600">Loading chat room...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="p-4 bg-white shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">
          Room: <span className="font-mono text-lg bg-gray-200 px-2 py-1 rounded">{topic}</span>
        </h1>
        <button
          onClick={() => router.push('/chatrooms')}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Back to Rooms
        </button>
      </header>

      <main className="flex-1 p-4 overflow-y-scroll space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.authorId === walletAddress ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                msg.authorId === walletAddress
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className={`text-xs font-semibold ${msg.authorId === walletAddress ? 'text-blue-200' : 'text-gray-600'}`}>
                {msg.authorUsername} {/* Display authorUsername */}
              </p>
              <p className="text-sm break-words">{msg.content}</p>
              <p className={`text-right text-xs mt-1 ${msg.authorId === walletAddress ? 'text-blue-300' : 'text-gray-400'}`}>
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </main>

      <footer className="p-4 bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
          placeholder="Type your message here..."
          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Send
        </button>
      </footer>
    </div>
  );
}