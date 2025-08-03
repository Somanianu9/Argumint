// components/Navbar.tsx
'use client'

import React from 'react'
import { Trophy, Gem, Zap, ShoppingBag, Gift, Wallet } from 'lucide-react'
import { useOpenConnectModal ,useWallets} from '@0xsequence/connect'
import { useState, useEffect } from 'react';


const Navbar: React.FC = () => {
  const {setOpenConnectModal} = useOpenConnectModal();
   const { 
    wallets, 
    linkedWallets, 
    setActiveWallet, 
    disconnectWallet,
    refetchLinkedWallets
  } = useWallets();

   const [activeWalletAddress, setActiveWalletAddress] = useState<string | null>(null);
  const [activeUsername, setActiveUsername] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // For localStorage access
    useEffect(() => {
    setIsClient(true);
    // On client-side, try to load from localStorage
    if (typeof window !== 'undefined') {
      setActiveWalletAddress(localStorage.getItem('walletAddress'));
      setActiveUsername(localStorage.getItem('username'));
    }
  }, []);

  useEffect(() => {
    if (wallets.length > 0) {
      // Find the active wallet from the wallets array
      const active = wallets.find(wallet => wallet.isActive);
      if (active && active.address !== activeWalletAddress) {
        setActiveWalletAddress(active.address);
        // Prompt for username if not already set or ask for update
        let currentUsername = localStorage.getItem('username');

        // This prompt will run every time the active wallet changes or on initial connect
        if (!currentUsername) {
            currentUsername = prompt("Enter a username (e.g., 'AnonUser#1234') - This will be your chat display name:");
        } else {
            // Optional: Ask to update username on subsequent connections
            // const update = confirm(`Your current username is "${currentUsername}". Do you want to update it?`);
            // if (update) {
            //   currentUsername = prompt("Enter new username:");
            // }
        }
        localStorage.setItem('walletAddress', active.address);
        setActiveUsername(currentUsername || null); // Update state
        // router.push('/chatrooms'); // Redirect to chatrooms after wallet is active
      }
    } else {
      // If no wallets are connected, clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('username');
      }
      setActiveWalletAddress(null);
      setActiveUsername(null);
    }
  }, [wallets, activeWalletAddress]); // Dependency on wallets array to detect changes

    const handleDisconnect = async (address: string) => {
    await disconnectWallet(address);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('username');
    }
    setActiveWalletAddress(null);
    setActiveUsername(null);
    // router.push('/'); // Go back to home after disconnect
  };

  if (!isClient) {
    return <div className="text-center p-4">Loading wallet connection...</div>;
  }

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
        {/* <button onClick={() => setOpenConnectModal(true)}
        className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-7 py-3 rounded-xl font-black text-sm tracking-widest shadow-2xl transform hover:scale-110 transition-all duration-300 border border-white/20">
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="relative flex items-center gap-2">
            <Wallet className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Connect Wallet
          </div>
        </button> */}
         {activeWalletAddress ? (
          <div>
            {/* <p className="text-gray-700 text-lg mb-2">
              Connected as: <span className="font-mono text-base bg-gray-200 px-2 py-1 rounded-md">{activeUsername || activeWalletAddress.slice(0, 6) + '...' + activeWalletAddress.slice(-4)}</span>
            </p> */}
            <div className="space-y-2">
              {wallets.map(wallet => (
                <div key={wallet.address} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                  <span className="text-gray-700">
                    {wallet.name}: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    {wallet.isActive ? ' (Active)' : ''}
                    {wallet.isEmbedded ? ' (Embedded)' : ''}
                  </span>
                  <div className="space-x-2">
                    {!wallet.isActive && (
                      <button 
                        onClick={() => setActiveWallet(wallet.address)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                      >
                        Set Active
                      </button>
                    )}
                    <button 
                      onClick={() => handleDisconnect(wallet.address)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setOpenConnectModal(true)}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
          >
            Connect Wallet
          </button>
        )}
        <button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-7 py-3 rounded-xl font-black text-sm tracking-widest shadow-2xl transform hover:scale-110 transition-all duration-300 border border-white/20">
          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
           <div className="relative flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            SHOP
          </div>
        </button>
      </div>
    </div>
  )
}

export default Navbar