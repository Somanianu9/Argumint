"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Users, Clock, Trophy, MessageCircle, LogOut, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import contractABI from '../../../../utils/Argumint.json';

const argumintAddress = process.env.NEXT_PUBLIC_ARGUMINT_ADDRESS || "0xbc68bfB752DEB38171262344136B375E161BD24E";

interface Message {
  content: string;
  sender?: string;
  timestamp?: string;
  team?: number;
  userId?: string;
}

interface DebateInfo {
  title: string;
  description?: string;
  duration: number; // Duration in minutes
  isActive: boolean;
  team1Count: number;
  team2Count: number;
  startTime?: string; // When debate actually started (startedAt)
  createdAt?: string; // When debate was created
  endTime?: string;
}

let socket: Socket;

export default function RoomPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [debateInfo, setDebateInfo] = useState<DebateInfo | null>(null);
  const [userTeam, setUserTeam] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [switchLoading, setSwitchLoading] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showPersuadeModal, setShowPersuadeModal] = useState(false);
  const [targetAddress, setTargetAddress] = useState('');
  const [teamScore, setTeamScore] = useState(0);
  const [yourScore, setYourScore] = useState(0);
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.id as string;
  const topic = searchParams.get('topic') || 'Debate Room';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user info from localStorage or set default
    const storedUserName = localStorage.getItem('username') || 'Anonymous';
    const storedTeam = localStorage.getItem(`team_${roomId}`);
    const storedWalletAddress = localStorage.getItem('walletAddress');

    // Check if team is passed as query parameter (from ChatRoom join)
    const teamFromQuery = searchParams.get('team');

    setUserName(storedUserName);
    setWalletAddress(storedWalletAddress);

    // Prioritize team from query parameter (fresh join), then localStorage
    if (teamFromQuery) {
      const teamNumber = parseInt(teamFromQuery);
      console.log('Team from query parameter:', teamNumber);
      setUserTeam(teamNumber);
      // Store in localStorage for future visits
      localStorage.setItem(`team_${roomId}`, teamNumber.toString());
    } else if (storedTeam) {
      console.log('Team from localStorage:', storedTeam);
      setUserTeam(parseInt(storedTeam));
    } else {
      console.log('No team found in query params or localStorage');
    }

    socket = io('http://localhost:3001');

    socket.on("connect", () => {
      console.log("Connected with ID:", socket.id);
      socket.emit("joinRoom", roomId);

      // Request debate info
      socket.emit("getDebateInfo", roomId);
    });

    socket.on("receiveMessage", (messageData) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          content: messageData.content,
          sender: messageData.sender,
          timestamp: new Date(messageData.timestamp).toLocaleTimeString(),
          team: messageData.team,
          userId: messageData.userId,
        },
      ]);
    });

    socket.on("debateInfo", (info: DebateInfo) => {
      setDebateInfo(info);

      // Calculate timer based on debate status and duration
      if (info.isActive && info.startTime) {
        // Debate is active and has started - show remaining time
        const startTime = new Date(info.startTime).getTime();
        const endTime = startTime + (info.duration * 60 * 1000); // duration in minutes * 60 * 1000
        const remaining = Math.max(0, endTime - Date.now());
        setTimeRemaining(Math.floor(remaining / 1000));
      } else if (!info.isActive) {
        // Debate hasn't started yet - show total duration
        setTimeRemaining(info.duration * 60); // Convert minutes to seconds
      } else {
        // Debate is active but no start time - shouldn't happen but handle gracefully
        setTimeRemaining(info.duration * 60);
      }
    });

    socket.on("debateStarted", (startData) => {
      if (debateInfo) {
        // When debate starts, calculate end time from start time + duration
        const startTime = startData?.startTime ? new Date(startData.startTime).getTime() : Date.now();
        const endTime = startTime + (debateInfo.duration * 60 * 1000);
        const remaining = Math.max(0, endTime - Date.now());
        setTimeRemaining(Math.floor(remaining / 1000));

        // Update debate info to reflect it's now active
        setDebateInfo(prev => prev ? { ...prev, isActive: true, startTime: new Date(startTime).toISOString() } : null);
      }
    });

    socket.on("debateEnded", () => {
      setTimeRemaining(0);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, searchParams]);

  // Debug effect to track userTeam changes
  useEffect(() => {
    console.log('userTeam changed:', userTeam);
    console.log('walletAddress:', walletAddress);
  }, [userTeam, walletAddress]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const sendMessage = () => {
    if (!newMessage.trim() || !userTeam) return;

    const messagePayload = {
      content: newMessage,
      roomId,
      sender: userName,
      team: userTeam,
      timestamp: new Date().toISOString(),
    };

    // Optimistically add the message to your own screen
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        content: newMessage,
        sender: "You",
        timestamp: new Date().toLocaleTimeString(),
        team: userTeam,
      },
    ]);

    socket.emit("sendMessage", messagePayload);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const leaveRoom = () => {
    localStorage.removeItem(`team_${roomId}`);
    router.push('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerDisplay = () => {
    if (!debateInfo || timeRemaining === null) return null;

    if (!debateInfo.isActive) {
      // Debate hasn't started - show duration
      return {
        time: formatTime(timeRemaining),
        label: 'Duration',
        color: 'text-blue-400',
        icon: Clock
      };
    } else if (timeRemaining > 0) {
      // Debate is active with time remaining
      return {
        time: formatTime(timeRemaining),
        label: 'Time Left',
        color: timeRemaining > 300 ? 'text-green-400' : timeRemaining > 60 ? 'text-yellow-400' : 'text-red-400', // 5 min = green, 1 min = yellow, less = red
        icon: Clock
      };
    } else {
      // Debate has ended
      return {
        time: '00:00',
        label: 'Ended',
        color: 'text-red-400',
        icon: Clock
      };
    }
  };

  const getTeamColor = (team: number) => {
    return team === 1 ? 'bg-blue-100 border-blue-300' : 'bg-red-100 border-red-300';
  };

  const getTeamTextColor = (team: number) => {
    return team === 1 ? 'text-blue-800' : 'text-red-800';
  };

  const persuadeUser = async (targetUserAddress: string) => {
    if (!userTeam || !targetUserAddress) {
      setSwitchError("Missing team or target address");
      return;
    }

    setSwitchLoading(true);
    setSwitchError(null);

    try {
      // MOCK IMPLEMENTATION - Simulate the persuade user functionality
      console.log("MOCK: Persuading user with address:", targetUserAddress);

      // Simulate some validation
      if (!targetUserAddress.startsWith('0x') || targetUserAddress.length !== 42) {
        throw new Error("Invalid wallet address format");
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate random success/failure for demo purposes
      const shouldSucceed = Math.random() > 0.3; // 70% success rate

      if (!shouldSucceed) {
        // Simulate different types of errors for demo
        const errors = [
          "User not found in this debate",
          "User is on the same team as you",
          "User has already been persuaded",
          "Debate hasn't started yet",
          "Insufficient persuasion power"
        ];
        throw new Error(errors[Math.floor(Math.random() * errors.length)]);
      }

      // Simulate successful persuasion
      console.log("MOCK: Successfully persuaded user to switch teams!");

      // Close modal and show success message
      setShowPersuadeModal(false);
      setTargetAddress('');

      // Show a more detailed success message for demo
      alert(`🎉 Successfully persuaded user ${targetUserAddress.slice(0, 6)}...${targetUserAddress.slice(-4)} to join Team ${userTeam}!`);

      // Increase scores by 3 points for successful persuasion
      setTeamScore(prev => prev + 3);
      setYourScore(prev => prev + 3);

      // Optional: Simulate updating team counts in the UI
      if (debateInfo) {
        setDebateInfo(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            team1Count: userTeam === 1 ? prev.team1Count + 1 : Math.max(0, prev.team1Count - 1),
            team2Count: userTeam === 2 ? prev.team2Count + 1 : Math.max(0, prev.team2Count - 1)
          };
        });
      }

    } catch (error: any) {
      console.error("MOCK: Error persuading user:", error);

      // Mock error handling
      if (error.message?.includes("Invalid wallet address")) {
        setSwitchError("Invalid wallet address format");
      } else if (error.message?.includes("same team")) {
        setSwitchError("Target user is on the same team as you");
      } else if (error.message?.includes("already been persuaded")) {
        setSwitchError("This user has already been persuaded");
      } else if (error.message?.includes("not found")) {
        setSwitchError("User not found in this debate");
      } else if (error.message?.includes("hasn't started")) {
        setSwitchError("Debate hasn't started yet");
      } else {
        setSwitchError(error.message || "Failed to persuade user");
      }
    } finally {
      setSwitchLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Animated Background - matching ChatRoom theme */}
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
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/15 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-purple-400/15 rounded-full blur-xl animate-float-reverse"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-cyan-400/15 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-pink-400/10 rounded-full blur-2xl animate-drift"></div>
        {/* Racing Stripes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-1/4 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-stripe-move"></div>
          <div className="absolute top-3/4 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-stripe-move-reverse"></div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col h-screen" style={{ fontFamily: 'Inter, Montserrat, Poppins, system-ui' }}>
        {/* Header - matching ChatRoom glassmorphism style */}
        <div className="relative group mb-6 mt-6 mx-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl blur opacity-50 group-hover:opacity-80 transition-opacity animate-pulse-glow"></div>
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-8 w-8 text-indigo-400" />
                  <h1 className="text-3xl font-bold text-white tracking-wide" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>
                    {debateInfo?.title || topic}
                  </h1>
                </div>
                {userTeam && (
                  <div className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${userTeam === 1
                    ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400/50 text-green-300'
                    : 'bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-400/50 text-red-300'
                    }`}>
                    Team {userTeam} {userTeam === 1 ? 'Pro' : 'Con'}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-6">
                {/* Debug info - remove this after testing */}


                {/* Test buttons - remove after testing */}
                {!userTeam && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setUserTeam(1);
                        localStorage.setItem(`team_${roomId}`, '1');
                      }}
                      className="px-2 py-1 bg-green-600/20 text-green-300 text-xs rounded border border-green-400/30"
                    >
                      Test Team 1
                    </button>
                    <button
                      onClick={() => {
                        setUserTeam(2);
                        localStorage.setItem(`team_${roomId}`, '2');
                      }}
                      className="px-2 py-1 bg-red-600/20 text-red-300 text-xs rounded border border-red-400/30"
                    >
                      Test Team 2
                    </button>
                  </div>
                )}
                {debateInfo && (
                  <div className="flex items-center space-x-6 text-sm text-white/70">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-400" />
                      <span className="font-medium">Pro: {debateInfo.team1Count}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-red-400" />
                      <span className="font-medium">Anti: {debateInfo.team2Count}</span>
                    </div>

                    {/* Enhanced Timer Display */}
                    {(() => {
                      const timerInfo = getTimerDisplay();
                      return timerInfo && (
                        <div className={`flex items-center space-x-2 font-bold ${timerInfo.color}`}>
                          <timerInfo.icon className="h-5 w-5" />
                          <div className="flex flex-col items-center">
                            <span className="text-lg leading-tight">{timerInfo.time}</span>
                            <span className="text-xs opacity-75 leading-tight">{timerInfo.label}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Score Display */}
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-blue-400" />
                        <span className="font-medium text-blue-300">Team Score: {teamScore}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-purple-400" />
                        <span className="font-medium text-purple-300">Your Score: {yourScore}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Persuade User Button */}
                {userTeam && (
                  <button
                    onClick={() => setShowPersuadeModal(true)}
                    disabled={switchLoading}
                    className="group relative overflow-hidden flex items-center space-x-2 px-4 py-2 text-sm font-bold bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 hover:text-white hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg transition-all duration-300 border border-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Persuade another user to switch to your team"
                  >
                    <div className="absolute inset-0 bg-purple-400/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                    <div className="relative flex items-center space-x-2">
                      {switchLoading ? (
                        <div className="animate-spin h-4 w-4 border-b-2 border-purple-400 rounded-full"></div>
                      ) : (
                        <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                      )}
                      <span className="font-medium">
                        {switchLoading ? 'Persuading...' : 'Persuade User'}
                      </span>
                    </div>
                  </button>
                )}

                {/* Display switch team error if exists */}
                {switchError && (
                  <div className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded border border-red-400/30">
                    {switchError}
                  </div>
                )}

                <button
                  onClick={leaveRoom}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 border border-white/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Leave</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages - glassmorphism container */}
        <div className="flex-1 mx-6 mb-6">
          <div className="relative group h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl h-full flex flex-col">

              {/* Messages Display Area */}
              <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide pr-2">
                {messages.length === 0 ? (
                  <div className="text-center text-white/50 py-12">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">Be the first to start the debate!</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-xl backdrop-blur-sm border ${message.sender === 'You'
                          ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-400/30 text-white'
                          : message.team === 1
                            ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400/30 text-green-100'
                            : 'bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-400/30 text-red-100'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm">
                            {message.sender}
                            {message.team && message.sender !== 'You' && (
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${message.team === 1 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                }`}>
                                Team {message.team}
                              </span>
                            )}
                          </span>
                          <span className="text-xs opacity-75">{message.timestamp}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input - inside the chat container */}
              <div className="mt-6 pt-6 border-t border-white/10">
                {/* Show connection status */}
                {!userTeam && (
                  <div className="mb-4 p-3 bg-orange-500/20 border border-orange-400/30 rounded-lg text-orange-200 text-sm">
                    You need to join a team first to send messages. Go back to the main page to join a team.
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder={userTeam ? "Type your argument..." : "Join a team to send messages..."}
                    className="flex-1 bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-white/20 px-6 py-4 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 backdrop-blur-sm font-medium"
                    value={newMessage}
                    onChange={(e) => {
                      console.log('Input change:', e.target.value);
                      setNewMessage(e.target.value);
                    }}
                    onKeyPress={(e) => {
                      console.log('Key pressed:', e.key);
                      handleKeyPress(e);
                    }}
                    disabled={!userTeam}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <button
                    onClick={() => {
                      console.log('Send button clicked, message:', newMessage, 'userTeam:', userTeam);
                      sendMessage();
                    }}
                    disabled={!userTeam || !newMessage.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed font-bold shadow-lg border border-white/20 transform hover:scale-105"
                    style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persuade User Modal */}
      {showPersuadeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Persuade User to Switch Teams</h3>
            <p className="text-white/70 text-sm mb-6">
              Enter the wallet address of the persuader
              <br />
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Persuader Address
                </label>
                <input
                  type="text"
                  placeholder="0x1234567890123456789012345678901234567890"
                  className="w-full bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-white/20 px-4 py-3 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 backdrop-blur-sm font-mono text-sm"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                />
              </div>

              {/* Quick test addresses for demo */}
              <div className="space-y-2">
                <p className="text-white/60 text-xs">Available addresses:</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
                    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                    '0x2A86dbc85C647CAc12f0b474bd18dA7EEFc7BDDE'
                  ].map((addr, i) => (
                    <button
                      key={addr}
                      onClick={() => setTargetAddress(addr)}
                      className="text-left px-3 py-2 bg-gray-700/30 hover:bg-gray-600/40 rounded-lg text-xs font-mono text-white/70 hover:text-white transition-colors"
                    >
                      {addr}
                    </button>
                  ))}
                </div>
              </div>

              {switchError && (
                <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 text-sm">
                  {switchError}
                </div>
              )}

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => persuadeUser(targetAddress)}
                  disabled={switchLoading || !targetAddress.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed font-bold shadow-lg border border-white/20"
                >
                  {switchLoading ? 'Persuading...' : 'Persuade User'}
                </button>
                <button
                  onClick={() => {
                    setShowPersuadeModal(false);
                    setTargetAddress('');
                    setSwitchError(null);
                  }}
                  disabled={switchLoading}
                  className="px-6 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}      {/* Add the same CSS animations as ChatRoom */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Montserrat:wght@700;900&display=swap');

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes checkerRace {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(60px) translateY(60px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-5deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }

        @keyframes drift {
          0% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(10px) translateY(-10px); }
          50% { transform: translateX(-5px) translateY(5px); }
          75% { transform: translateX(-10px) translateY(-5px); }
          100% { transform: translateX(0px) translateY(0px); }
        }

        @keyframes stripe-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }

        @keyframes stripe-move-reverse {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        .animate-gradient-shift { animation: gradient-shift 8s ease infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-drift { animation: drift 10s ease-in-out infinite; }
        .animate-stripe-move { animation: stripe-move 3s linear infinite; }
        .animate-stripe-move-reverse { animation: stripe-move-reverse 4s linear infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
