'use client'

import React, { useState, useEffect } from 'react'
import { Users, Calendar, Star, MessageSquare, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CompactLeaderboard from './leaderboard-compact'
import Navbar from './Navbar'
import { socket } from '../../utils/socket'

interface Room {
  debateId: number;
  title: string;
  description: string | null;
  isActive: boolean;
  duration: number;
  createdAt: string;
}

interface UpcomingDebate {
  id: string;
  topic: string;
  duration: number;
  createdAt: string;
}

const ChatRoom: React.FC = () => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false)
  const [rooms, setRooms] = useState<{ id: string; topic: string }[]>([])
  const [upcomingDebates, setUpcomingDebates] = useState<UpcomingDebate[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<1 | 2 | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [joinLoading, setJoinLoading] = useState(false)
  const [showTeamSelection, setShowTeamSelection] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; topic: string } | null>(null)

  useEffect(() => {
    // Connect socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber: number) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    return () => {
      // Don't disconnect on unmount to maintain connection across pages
      socket.off('connect');
      socket.off('disconnect');
      socket.off('reconnect');
    };
  }, []);

  const getRooms = async () => {
    try {
      const res = await fetch(`http://localhost:3001/rooms`);
      if (res.ok) {
        const data: Room[] = await res.json();
        setRooms(
          data.map((room) => ({
            id: room.debateId.toString(),
            topic: room.title
          }))
        );
      } else {
        console.error("Failed to fetch rooms:", res.statusText);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const joinRoom = (room: { id: string; topic: string }) => {
    setSelectedRoom(room);
    setShowJoinModal(false);
    setShowTeamSelection(true);
    setJoinError(null);
  };

  const joinTeamOnContract = async (team: 1 | 2) => {
    if (!selectedRoom) return;

    setJoinLoading(true);
    setJoinError(null);

    try {
      // Check if window.ethereum is available
      if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
        setJoinError("Web3 wallet not detected. Please install MetaMask or use a web3 browser.");
        return;
      }

      // Mock joining team logic for demo
      console.log('Mock: Joining team', team, 'for room', selectedRoom.id);

      // Simulate a small delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // If successful, proceed to join the room via websocket and navigate
      if (socket && socket.connected) {
        socket.emit('joinRoom', selectedRoom.id);
        setIsConnected(true);
      }

      // Navigate to the debate room
      router.push(`/rooms/${selectedRoom.id}?topic=${encodeURIComponent(selectedRoom.topic)}&team=${team}`);

    } catch (error: unknown) {
      console.error("Error joining team:", error);

      if (error instanceof Error) {
        setJoinError(`Error: ${error.message}`);
      } else {
        setJoinError("An unexpected error occurred while joining the debate.");
      }
    } finally {
      setJoinLoading(false);
    }
  };

  const handleTeamSelection = (team: 1 | 2) => {
    setSelectedTeam(team);
    joinTeamOnContract(team);
  };

  useEffect(() => {
    setIsLoaded(true)
    getRooms();
    getUpcomingDebates();
  }, [])

  const getUpcomingDebates = async () => {
    try {
      const res = await fetch(`http://localhost:3001/upcomingDebates`);
      if (res.ok) {
        const data: Room[] = await res.json();
        setUpcomingDebates(
          data.map((debate) => ({
            id: debate.debateId.toString(),
            topic: debate.title,
            duration: debate.duration,
            createdAt: debate.createdAt
          }))
        );
      } else {
        console.error("Failed to fetch upcoming debates:", res.statusText);
      }
    } catch (error) {
      console.error("Error fetching upcoming debates:", error);
    }
  }



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

      <div className={`relative z-10 p-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ fontFamily: 'Inter, Montserrat, Poppins, system-ui' }}>
        {/* Navbar Component */}
        <Navbar />

        <div className="flex gap-8 min-h-[calc(100vh-150px)]">
          {/* Left Sidebar - Upcoming Debates */}
          <div className="w-80 space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl blur opacity-50 group-hover:opacity-80 transition-opacity animate-pulse-glow"></div>
              <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl transform hover:scale-102 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-indigo-400" />
                  <h3 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>
                    Upcoming Debates
                  </h3>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                  {upcomingDebates.length > 0 ? (
                    upcomingDebates.map((debate) => (
                      <div
                        key={debate.id}
                        className="bg-gradient-to-br from-gray-700/90 to-gray-800/90 rounded-xl p-4 hover:bg-white/5 transition-all duration-300 border border-white/10 shadow-lg group cursor-pointer"
                        onClick={() => joinRoom(debate)}
                      >
                        <h4 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>
                          {debate.topic}
                        </h4>
                        <div className="text-sm text-white/70 space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            <span>Duration: {Math.floor(debate.duration / 60)} mins</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span>Created: {new Date(debate.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            joinRoom(debate);
                          }}
                          className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-lg hover:from-green-400 hover:to-emerald-500 transition-all duration-300 shadow-lg border border-white/20"
                          style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}
                        >
                          Join Debate →
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-white/70 font-medium" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>
                        No upcoming debates
                      </p>
                      <p className="text-white/50 text-sm mt-1">Create one to get started!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Center */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Game Title - Epic Font Styling */}
            <div className="mb-12 text-center group">
              <div
                className="text-7xl font-extrabold tracking-tight transform hover:scale-105 transition-all duration-500 animate-title-glow bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent"
                style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}
              >
                ARGUMINT
              </div>
              <div className="text-xl text-white/80 mt-4 font-medium" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>
                The Ultimate Debate Arena
              </div>
            </div>

            {/* Tagline */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>
                Ready to Prove Your Point?
              </h1>
              <p className="text-white/70 text-lg font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                Join debates, earn tokens, and climb the leaderboard
              </p>
            </div>
            {/* Action Section */}
            <div className="flex justify-center">
              <button
                onClick={() => { setShowJoinModal(true); }}
                className="group relative overflow-hidden px-16 py-6 rounded-3xl font-bold text-2xl tracking-wide transition-all duration-500 transform hover:scale-110 shadow-2xl border-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 border-white/20 text-white"
                style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}
              >
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 animate-pulse"></div>
                <div className="relative flex items-center gap-3">
                  <UserPlus className="w-7 h-7 group-hover:scale-125 transition-transform duration-300" />
                  JOIN DEBATE
                </div>
              </button>

              {/* Connection Status */}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                {/* <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div> */}
                <span className={`font-medium ${isConnected ? 'text-green-300' : 'text-red-300'}`}>

                </span>
              </div>
            </div>

            {/* Modals container */}
            <div>
              {/* Join Room Modal - Enhanced UI */}
              {showJoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowJoinModal(false)}>
                  <div className="relative w-full max-w-3xl p-0" onClick={e => e.stopPropagation()}>
                    {/* Modal Gradient Background & Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-950 rounded-3xl blur opacity-80 animate-pulse-glow"></div>
                    <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl">
                      <button className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl font-extrabold transition-all duration-200" onClick={() => setShowJoinModal(false)}>&times;</button>
                      <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-2xl" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>Join a Debate Room</h2>
                      <div className="grid gap-6 sm:grid-cols-2">
                        {rooms.length > 0 ? (
                          rooms.map((room) => (
                            <div
                              key={room.id}
                              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl p-6 border border-white/10 shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-white/10 group animate-slideIn"
                              style={{ animationDelay: '100ms' }}
                            >
                              <h2 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>{room.topic}</h2>
                              <div className="text-sm text-white/70 mb-3">
                                {/* Duration: {Math.floor(room.duration / 60)} minutes */}
                              </div>
                              <button
                                onClick={() => joinRoom(room)}
                                className="mt-auto px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-base font-bold rounded-xl shadow-lg hover:from-green-400 hover:to-emerald-500 transition-all duration-300 border border-white/20"
                                style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}
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

              {/* Team Selection Modal */}
              {showTeamSelection && selectedRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => !joinLoading && setShowTeamSelection(false)}>
                  <div className="relative w-full max-w-2xl p-0" onClick={e => e.stopPropagation()}>
                    {/* Modal Gradient Background & Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-950 rounded-3xl blur opacity-80 animate-pulse-glow"></div>
                    <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl">
                      <button
                        className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl font-extrabold transition-all duration-200"
                        onClick={() => !joinLoading && setShowTeamSelection(false)}
                        disabled={joinLoading}
                      >
                        &times;
                      </button>

                      <h2 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>
                        Choose Your Side
                      </h2>

                      <p className="text-white/80 text-center mb-8 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Debate: <span className="font-bold text-white">&ldquo;{selectedRoom.topic}&rdquo;</span>
                      </p>

                      {joinError && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                          <p className="text-red-300 text-center font-semibold">{joinError}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-6">
                        <button
                          onClick={() => handleTeamSelection(1)}
                          disabled={joinLoading}
                          className="group relative overflow-hidden p-8 rounded-2xl border-2 border-green-400/50 bg-gradient-to-br from-green-600/20 to-emerald-600/20 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="absolute inset-0 bg-green-400/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          <div className="relative text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <span className="text-white font-bold text-2xl">1</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>Team Pro</h3>
                            <p className="text-green-300 font-medium">Support the motion</p>
                            {joinLoading && selectedTeam === 1 && (
                              <div className="mt-4 flex items-center justify-center">
                                <span className="animate-spin h-5 w-5 border-b-2 border-green-400 rounded-full mr-2"></span>
                                <span className="text-green-300">Joining...</span>
                              </div>
                            )}
                          </div>
                        </button>

                        <button
                          onClick={() => handleTeamSelection(2)}
                          disabled={joinLoading}
                          className="group relative overflow-hidden p-8 rounded-2xl border-2 border-red-400/50 bg-gradient-to-br from-red-600/20 to-pink-600/20 hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="absolute inset-0 bg-red-400/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          <div className="relative text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                              <span className="text-white font-bold text-2xl">2</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>Team Con</h3>
                            <p className="text-red-300 font-medium">Oppose the motion</p>
                            {joinLoading && selectedTeam === 2 && (
                              <div className="mt-4 flex items-center justify-center">
                                <span className="animate-spin h-5 w-5 border-b-2 border-red-400 rounded-full mr-2"></span>
                                <span className="text-red-300">Joining...</span>
                              </div>
                            )}
                          </div>
                        </button>
                      </div>

                      <div className="mt-8 text-center">
                        <p className="text-white/60 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                          A small fee is required to join the debate. This will be used for rewards.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
          {/* Right Sidebar - Compact Leaderboard */}
          <div className="w-80">
            <CompactLeaderboard />
          </div>
        </div>
      </div>




      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Montserrat:wght@700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'); /* Added for modal title */

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

        /* Custom animations from your original code */
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shift { animation: gradient-shift 15s ease infinite; background-size: 200% 200%; }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(100, 100, 255, 0.4), 0 0 15px rgba(100, 100, 255, 0.2); }
          50% { box-shadow: 0 0 15px rgba(100, 100, 255, 0.8), 0 0 30px rgba(100, 100, 255, 0.5); }
        }
        .animate-pulse-glow { animation: pulse-glow 3s infinite alternate; }

        @keyframes float {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(15px) translateX(5px) rotate(2deg); }
          50% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          75% { transform: translateY(-10px) translateX(-5px) rotate(-2deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
        }
        .animate-float { animation: float 15s ease-in-out infinite; }
        .animate-float-reverse { animation: float 18s ease-in-out infinite reverse; }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.1); opacity: 0.25; }
        }
        .animate-pulse-slow { animation: pulse-slow 10s ease-in-out infinite; }

        @keyframes drift {
          0% { transform: translate(0, 0); }
          25% { transform: translate(10px, -15px); }
          50% { transform: translate(0, 0); }
          75% { transform: translate(-10px, 5px); }
          100% { transform: translate(0, 0); }
        }
        .animate-drift { animation: drift 20s ease-in-out infinite; }


        @keyframes stripe-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-stripe-move { animation: stripe-move 8s linear infinite; }
        .animate-stripe-move-reverse { animation: stripe-move 8s linear infinite reverse; }

        @keyframes title-glow {
          0%, 100% { text-shadow: 0 0 5px rgba(255,255,255,0.4), 0 0 10px rgba(100,100,255,0.3); }
          50% { text-shadow: 0 0 10px rgba(255,255,255,0.7), 0 0 20px rgba(100,100,255,0.6); }
        }
        .animate-title-glow { animation: title-glow 3s infinite alternate; }

        @keyframes logo-bounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-5px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(5px); }
        }
        .animate-logo-bounce { animation: logo-bounce 4s ease-in-out infinite; }

        @keyframes selected-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(129, 140, 248, 0.7); }
          50% { box-shadow: 0 0 25px rgba(99, 102, 241, 1); }
        }
        .animate-selected-glow { animation: selected-glow 2s infinite alternate; }

        @keyframes control-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(168, 85, 247, 0.6); }
          50% { box-shadow: 0 0 20px rgba(168, 85, 247, 1); }
        }
        .animate-control-glow { animation: control-glow 2.5s infinite alternate; }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }

        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-gradient-flow { animation: gradient-flow 3s ease infinite alternate; background-size: 200% 200%; }

      `}</style>
    </div>
  )
}

export default ChatRoom