'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Trophy, Settings, Users, Calendar, Star, MessageSquare, Lock, Play, Plus, UserPlus, Zap, Sword, Target, MessageCircle, Mic, Brain, Award } from 'lucide-react'
import Navbar from '@/components/Navbar'
import RotatingText from '@/components/RotatingText'
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

const GameDashboard: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'create' | 'join' | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
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
                  <h3 className="text-white font-extrabold text-2xl tracking-wide bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>FluxRace</h3>
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

            {/* Friends & News - Enhanced */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl blur opacity-50 group-hover:opacity-80 transition-opacity animate-pulse-glow"></div>
              <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl transform hover:scale-102 transition-all duration-300">
                <div className="flex gap-6 mb-5">
                  <div className="flex items-center gap-3 text-white group/friends cursor-pointer">
                    <Users className="w-6 h-6 text-indigo-400 group-hover/friends:scale-110 transition-transform animate-pulse" />
                    <span className="font-semibold tracking-wide">Friends</span>
                    <div className="bg-gradient-to-r from-orange-300 to-red-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-extrabold shadow-lg animate-bounce">1</div>
                  </div>
                  <div className="flex items-center gap-3 text-white group/news cursor-pointer">
                    <Calendar className="w-6 h-6 text-pink-400 group-hover/news:scale-110 transition-transform animate-pulse" />
                    <span className="font-semibold tracking-wide">News</span>
                    <div className="bg-gradient-to-r from-purple-300 to-pink-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-extrabold shadow-lg animate-bounce">4</div>
                  </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide">
                  {newsItems.map((item, index) => (
                    <div key={item.id} className={`flex items-center gap-4 p-3 hover:bg-white/10 rounded-xl transition-all duration-300 cursor-pointer group/item transform hover:scale-105 animate-slideIn border border-white/5 hover:border-white/10`} style={{animationDelay: `${index * 100}ms`}}>
                      <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover/item:rotate-12 transition-transform animate-pulse`}>
                        {item.icon}
                      </div>
                      <span className="text-white text-base font-medium flex-1 group-hover/item:text-indigo-300 transition-colors" style={{ fontFamily: 'Inter, Montserrat, sans-serif' }}>{item.title}</span>
                    </div>
                  ))}

                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center gap-4 p-3 hover:bg-white/10 rounded-xl transition-all duration-300 cursor-pointer group/friend transform hover:scale-105 border border-white/5 hover:border-white/10">
                      <div className="relative">
                        {friend.avatar}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800 animate-pulse"></div>
                      </div>
                      <span className="text-white text-base font-medium flex-1 group-hover/friend:text-indigo-300 transition-colors" style={{ fontFamily: 'Inter, Montserrat, sans-serif' }}>{friend.name}</span>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Ultra Dynamic */}
          <div className="flex-1 flex flex-col items-center justify-space-around" style={{ fontFamily: 'Inter, Montserrat, Poppins, sans-serif' }}>
            {/* Game Title - Epic Font Styling */}
            <div className="mb-12 text-center group">
              {/* <h1 className="text-7xl font-extrabold mb-4 tracking-tight transform hover:scale-105 transition-all duration-500 animate-title-glow" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}> */}
                {/* <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent animate-gradient-flow drop-shadow-2xl">
                  ARGUMINT
                </span> */}
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


              {/* </h1> */}
              {/* <div className="relative">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-orange-400 via-pink-400 to-red-500 bg-clip-text text-transparent animate-gradient-flow drop-shadow-2xl tracking-tight italic transform hover:skew-x-6 transition-transform duration-300" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>
                  DEBATE
                </span>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full animate-pulse-fast"></div>
              </div> */}
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


            {/* Epic Play Button */}
            {/* <div className="flex items-center gap-8 mb-8">
              <button className="group relative overflow-hidden bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 hover:from-indigo-600 hover:via-blue-600 hover:to-purple-600 text-white px-16 py-6 rounded-3xl text-3xl font-extrabold tracking-tight shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-white/20 animate-button-glow" style={{ fontFamily: 'Montserrat, Inter, sans-serif' }}>
                <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 animate-pulse-fast"></div>
                <div className="relative flex items-center gap-4">
                  <Play className="w-10 h-10 fill-current animate-pulse-fast" />
                  PLAY
                  <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                </div>
              </button>
              <button className="group bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white p-6 rounded-3xl transition-all duration-300 shadow-2xl transform hover:scale-110 hover:rotate-12 border border-white/20">
                <Lock className="w-10 h-10 group-hover:animate-bounce" />
              </button>
            </div> */}

            {/* Ultra Dynamic Game Mode Buttons */}
            <div className="flex gap-8">
              <button 
                onClick={() => setSelectedMode('create')}
                className={`group relative overflow-hidden px-12 py-5 rounded-3xl font-extrabold text-xl tracking-tight transition-all duration-500 transform hover:scale-110 shadow-2xl border-2 ${
                  selectedMode === 'create' 
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
                onClick={() => setSelectedMode('join')}
                className={`group relative overflow-hidden px-12 py-5 rounded-3xl font-extrabold text-xl tracking-tight transition-all duration-500 transform hover:scale-110 shadow-2xl border-2 ${
                  selectedMode === 'join' 
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


        {/* <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 text-white/70 text-sm font-medium tracking-wide animate-fade-glow" style={{ fontFamily: 'Inter, Montserrat, sans-serif' }}>
          3.4.0 | Brilliant Gaming Ltd. | Privacy | T&Cs | Partners | Unblocked Sites
        </div> */}

        {/* Bottom Right Controls - Enhanced */}
        {/* <div className="fixed bottom-8 right-8 flex gap-4">
          {[Users, Settings, Trophy, Zap].map((Icon, index) => (
            <button key={index} className="group w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-2xl flex items-center justify-center text-white transition-all duration-300 shadow-2xl transform hover:scale-110 hover:rotate-12 border border-white/20 animate-control-glow">
              <Icon className="w-8 h-8 group-hover:scale-125 transition-transform animate-pulse" />
            </button>
          ))}
        </div> */}
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

export default GameDashboard