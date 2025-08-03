// "use client";

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { io, Socket } from 'socket.io-client';

// interface Message {
//   id: string;
//   content: string;
//   authorId: string;
//   createdAt: string;
// }

// export default function ChatRoom() {
//   const router = useRouter();
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [rooms, setRooms] = useState<{ id: string; topic: string }[]>([]);
//   const [isConnected, setIsConnected] = useState(false);

//   const createRoom = async (topic: string) => {
//     if (!topic.trim()) return;
//     try {
//       await fetch(`http://localhost:3001/rooms`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ topic })
//       });
//       getRooms(); // Refresh the room list
//     } catch (error) {
//       console.error("Error creating room:", error);
//     }
//   };

//   const getRooms = async () => {
//     try {
//       const res = await fetch(`http://localhost:3001/rooms`);
//       const data = await res.json();
//       setRooms(data);
//     } catch (error) {
//       console.error("Error fetching rooms:", error);
//     }
//   };

//   useEffect(() => {
//     getRooms();
//   }, []);

//   const joinRoom = (room: { id: string; topic: string }) => {
//     router.push(`/rooms/${room.id}?topic=${encodeURIComponent(room.topic)}`);
//     if (socket) {
//       socket.emit('joinRoom', room.id);
//       setIsConnected(true);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
//       <div className="w-full max-w-4xl">
//         <div className="bg-white rounded-xl shadow-md p-6 mb-6">
//           <h1 className="text-3xl font-bold text-gray-800 mb-4"> Argumint Debate Rooms</h1>
//           <div className="flex justify-end">
//             <button
//               onClick={() => createRoom(prompt("Enter room topic:") || "")}
//               className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
//             >
//               ➕ Create New Room
//             </button>
//           </div>
//         </div>

//         <div className="grid gap-4 sm:grid-cols-2">
//           {rooms.length > 0 ? (
//             rooms.map((room) => (
//               <div
//                 key={room.id}
//                 className="bg-white rounded-lg shadow p-5 flex flex-col justify-between hover:shadow-lg transition-shadow"
//               >
//                 <h2 className="text-xl font-semibold text-gray-800 mb-2">{room.topic}</h2>
//                 <button
//                   onClick={() => joinRoom(room)}
//                   className="mt-auto self-start px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
//                 >
//                   Join Room →
//                 </button>
//               </div>
//             ))
//           ) : (
//             <p className="text-gray-600 text-center col-span-full">No rooms available. Create one!</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Trophy, Settings, Users, Calendar, Star, MessageSquare, Lock, Play, Plus, UserPlus, Zap, Sword, Target, MessageCircle, Mic, Brain, Award } from 'lucide-react'
import Navbar from './Navbar'
import RotatingText from './RotatingText'
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

interface Room {
  debateId: number;
  title: string;
  description: string | null;
  isActive: boolean;
  duration: number;
  createdAt: string;
}

interface NewsItem {
  id: string
  title: string
  icon: React.ReactNode
  color: string
}

interface Friend {
  id: string
  name: string
  avatar: React.ReactNode
  status: 'online' | 'offline'
}

const ChatRoom: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'create' | 'join' | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const createRoom = async (topic: string) => {
    if (!topic.trim()) return;
    try {
      const response = await fetch(`http://localhost:3001/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      if (response.ok) {
        getRooms(); // Refresh the room list
      } else {
        console.error("Failed to create room:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const getRooms = async () => {
    try {
      const res = await fetch(`http://localhost:3001/rooms`);
      if (res.ok) {
        const data: Room[] = await res.json();
        setRooms(data);
      } else {
        console.error("Failed to fetch rooms:", res.statusText);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };
  const joinRoom = (room: Room) => {
    setShowJoinModal(false);
    router.push(`/rooms/${room.debateId}?topic=${encodeURIComponent(room.title)}`);
    if (socket) {
      socket.emit('joinRoom', room.debateId);
      setIsConnected(true);
    }
  };

  useEffect(() => {
    setIsLoaded(true)
    getRooms();
  }, [])

  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Epic Debate Championship Finals',
      icon: <Award className="w-4 h-4" />,
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500'
    },
    {
      id: '2',
      title: 'Season 14: Logic Arena Update',
      icon: <Brain className="w-4 h-4" />,
      color: 'bg-gradient-to-r from-green-400 to-emerald-500'
    },
    {
      id: '3',
      title: 'Rhetoric Masters Tournament',
      icon: <Mic className="w-4 h-4" />,
      color: 'bg-gradient-to-r from-pink-400 to-purple-500'
    },
    {
      id: '4',
      title: 'Argument Legends Championship',
      icon: <Sword className="w-4 h-4" />,
      color: 'bg-gradient-to-r from-blue-400 to-cyan-500'
    }
  ]

  const friends: Friend[] = [
    {
      id: '1',
      name: 'LogicMaster_UK',
      avatar: <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">L</div>,
      status: 'online'
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden ">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Modern background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-blue-950 animate-gradient-shift"></div>
        {/* Subtle checkerboard */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #6366f1 25%, transparent 25%),
              linear-gradient(-45deg, #6366f1 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #6366f1 75%),
              linear-gradient(-45deg, transparent 75%, #6366f1 75%)
            `,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px',
            animation: 'checkerRace 15s linear infinite'
          }}
        />
        {/* Floating Orbs - softer colors */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/15 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-purple-400/15 rounded-full blur-xl animate-float-reverse"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-cyan-400/15 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-pink-400/10 rounded-full blur-2xl animate-drift"></div>
        {/* Racing Stripes - more subtle */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-1/4 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-stripe-move"></div>
          <div className="absolute top-3/4 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-stripe-move-reverse"></div>
        </div>
      </div>

      <div className={`relative z-10 p-5 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ fontFamily: 'Inter, Montserrat, Poppins, system-ui' }}>
        {/* Navbar Component */}
        <Navbar />

        <div className="flex gap-8">
          {/* Left Sidebar - More Dynamic */}
          <div className="w-80 space-y-7">
            {/* Game Mode Selector */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-50 group-hover:opacity-80 transition-opacity animate-pulse-glow"></div>
              <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl transform hover:scale-102 transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-extrabold text-2xl tracking-wide bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>FluxRace</h3>
                  <div className="w-7 h-7 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                    <span className="text-sm font-extrabold text-white">?</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-5 group/customize hover:bg-white/10 rounded-xl p-3 transition-all cursor-pointer transform hover:scale-105">
                  <div className="flex items-center gap-3 text-white">
                    <Settings className="w-6 h-6 text-indigo-400 group-hover/customize:rotate-180 transition-transform duration-500 animate-pulse" />
                    <span className="font-semibold tracking-wide">Customize</span>
                  </div>
                  <div className="w-7 h-7 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                    <span className="text-sm font-extrabold text-white">?</span>
                  </div>
                </div>

                <button className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl border border-white/20">
                  <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse"></div>
                  <div className="relative text-center">
                    <div className="font-extrabold text-lg tracking-wide" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>Sign In/Up</div>
                    <div className="text-sm opacity-90 font-medium">Get epic rewards!</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl blur opacity-50 group-hover:opacity-80 transition-opacity animate-pulse-glow"></div>
              <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl transform hover:scale-102 transition-all duration-300">
                <div className="flex gap-6 mb-5">
                  <div className="flex items-center gap-3 text-white group/friends cursor-pointer">
                    <Users className="w-6 h-6 text-indigo-400 group-hover/friends:scale-110 transition-transform animate-pulse" />
                    <span className="font-semibold tracking-wide">Rooms</span>
                    <div className="bg-gradient-to-r from-orange-300 to-red-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-extrabold shadow-lg animate-bounce">1</div>
                  </div>
                  <div className="flex items-center gap-3 text-white group/news cursor-pointer">
                    <Calendar className="w-6 h-6 text-pink-400 group-hover/news:scale-110 transition-transform animate-pulse" />
                    <span className="font-semibold tracking-wide">News</span>
                    <div className="bg-gradient-to-r from-purple-300 to-pink-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-extrabold shadow-lg animate-bounce">4</div>
                  </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide">
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <div
                        key={room.debateId}
                        className="bg-white rounded-lg shadow p-5 flex flex-col justify-between hover:shadow-lg transition-shadow"
                      >
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">{room.title}</h2>
                        <div className="text-sm text-gray-600 mb-2">
                          Duration: {Math.floor(room.duration / 60)} minutes
                        </div>
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
          </div>

          {/* Main Content - Ultra Dynamic */}
          <div className="flex-1 flex flex-col items-center justify-space-around" style={{ fontFamily: 'Inter, Montserrat, Poppins, sans-serif' }}>
            {/* Game Title - Epic Font Styling */}
            <div className="mb-12 text-center group">

              <div
                className="flex flex-row items-center gap-2 mb-4 text-7xl font-extrabold tracking-tight transform hover:scale-105 transition-all duration-500 animate-title-glow"
                style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}
              >
                <div>Argu</div>
                <div className="overflow-hidden">
                  <RotatingText
                    texts={['ment', 'mint']}
                    mainClassName="text-inherit"
                    staggerFrom="last"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '-120%' }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden"
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                  />
                </div>
              </div>

            </div>


            <div className='flex flex-row'>
              <div>
                <Image
                  src="/argu.gif"
                  alt="Argumint Logo"
                  width={300}
                  height={300}
                  className="rounded-full shadow-lg animate-logo-bounce"
                />
              </div>
              <div>
                <Image
                  src="/red.gif"
                  alt="Argumint Logo"
                  width={300}
                  height={300}
                  className="rounded-full shadow-lg animate-logo-bounce"
                />
              </div>
            </div>
            <div className="flex gap-8">
              <button
                onClick={() => {
                  setSelectedMode('create')
                  createRoom(prompt("Enter room topic:") || "")
                }}
                className={`group relative overflow-hidden px-12 py-5 rounded-3xl font-extrabold text-xl tracking-tight transition-all duration-500 transform hover:scale-110 shadow-2xl border-2 ${selectedMode === 'create'
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 border-blue-300 text-white shadow-indigo-500/50 animate-selected-glow'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 border-white/20 text-white'
                  }`}
                style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}
              >
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 animate-pulse"></div>
                <div className="relative flex items-center gap-3">
                  <Plus className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500 animate-pulse" />
                  CREATE
                </div>
              </button>
              <button
                onClick={() => { setSelectedMode('join'); setShowJoinModal(true); }}
                className={`group relative overflow-hidden px-12 py-5 rounded-3xl font-extrabold text-xl tracking-tight transition-all duration-500 transform hover:scale-110 shadow-2xl border-2 ${selectedMode === 'join'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-pink-300 text-white shadow-pink-500/50 animate-selected-glow'
                    : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 border-white/20 text-white'
                  }`}
                style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}
              >
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 animate-pulse"></div>
                <div className="relative flex items-center gap-3">
                  <UserPlus className="w-6 h-6 group-hover:scale-125 transition-transform duration-300 animate-pulse" />
                  JOIN
                </div>
              </button>
              {/* Join Room Modal - Enhanced UI */}
              {showJoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowJoinModal(false)}>
                  <div className="relative w-full max-w-3xl p-0" onClick={e => e.stopPropagation()}>
                    {/* Modal Gradient Background & Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-950 rounded-3xl blur opacity-80 animate-pulse-glow"></div>
                    <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl">
                      <button className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl font-extrabold transition-all duration-200" onClick={() => setShowJoinModal(false)}>&times;</button>
                      <h2 className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent animate-gradient-flow drop-shadow-2xl" style={{ fontFamily: 'Press Start 2P, Montserrat, Inter, sans-serif' }}>Join a Debate Room</h2>
                      <div className="grid gap-6 sm:grid-cols-2">
                        {rooms.length > 0 ? (
                          rooms.map((room) => (
                            <div
                              key={room.debateId}
                              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl p-6 border border-white/10 shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-white/10 group animate-slideIn"
                              style={{ animationDelay: '100ms' }}
                            >
                              <h2 className="text-xl font-extrabold text-white mb-3 group-hover:text-indigo-300 transition-colors" style={{ fontFamily: 'Press Start 2P, Montserrat, Inter, sans-serif' }}>{room.title}</h2>
                              <div className="text-sm text-white/70 mb-3">
                                Duration: {Math.floor(room.duration / 60)} minutes
                              </div>
                              <button
                                onClick={() => joinRoom(room)}
                                className="mt-auto px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-base font-extrabold rounded-xl shadow-lg hover:from-green-400 hover:to-emerald-500 transition-all duration-300 border border-white/20 animate-pulse"
                                style={{ fontFamily: 'Press Start 2P, Montserrat, Inter, sans-serif' }}
                              >
                                Join Room →
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-white/80 text-center col-span-full font-bold">No rooms available. Create one!</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
          {/* Right Sidebar - Controls in Column */}
          <div className="w-32 flex flex-col items-center justify-center gap-8">
            <div className="flex flex-col gap-6 mt-8">
              {[Users, Settings, Trophy, Zap].map((Icon, index) => (
                <button key={index} className="group w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-2xl flex items-center justify-center text-white transition-all duration-300 shadow-2xl transform hover:scale-110 hover:rotate-12 border border-white/20 animate-control-glow">
                  <Icon className="w-8 h-8 group-hover:scale-125 transition-transform animate-pulse" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>




      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Montserrat:wght@700;900&display=swap');
        @keyframes checkerMove {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(40px) translateY(40px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.6s ease-out forwards; }
        .animation-delay-1000 { animation-delay: 1s; }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}


export default ChatRoom