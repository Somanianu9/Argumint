// components/Navbar.tsx
'use client'

import React from 'react'
import { Trophy, Gem, Zap, ShoppingBag, Gift } from 'lucide-react'

const Navbar: React.FC = () => {
  return (
    <div className="flex justify-between items-center mb-1">
      <div className="flex items-center gap-4">
        {/* Level Badge */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl px-5 py-3 flex items-center gap-3 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20">
            <div className="relative">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-black text-sm shadow-lg animate-bounce">1</div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <div className="text-sm">
              <div className="bg-white/20 rounded-full h-2 w-20 mb-1 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full w-0 animate-pulse"></div>
              </div>
              <span className="text-xs font-bold tracking-wider">0/100 XP</span>
            </div>
            <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
          </div>
        </div>

        {/* Currency */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-60 group-hover:opacity-90 transition-opacity animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-3 flex flex-col gap-2 shadow-2xl border border-white/10 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-2 text-yellow-400 group-hover:scale-110 transition-transform">
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg animate-spin-slow"></div>
              <span className="text-white font-bold">0</span>
              <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-emerald-400 group-hover:scale-110 transition-transform">
              <Gem className="w-6 h-6 text-emerald-400 animate-pulse" />
              <span className="text-white font-bold">0</span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Buttons */}
      <div className="flex gap-3">
        <button className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-7 py-3 rounded-xl font-black text-sm tracking-widest shadow-2xl transform hover:scale-110 transition-all duration-300 border border-white/20">
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="relative flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            SHOP
          </div>
        </button>
        <button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-7 py-3 rounded-xl font-black text-sm tracking-widest shadow-2xl transform hover:scale-110 transition-all duration-300 border border-white/20">
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="relative flex items-center gap-2">
            <Gift className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            FREE
          </div>
        </button>
      </div>
    </div>
  )
}

export default Navbar
