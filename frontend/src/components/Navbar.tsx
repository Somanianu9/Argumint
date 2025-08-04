// components/Navbar.tsx
'use client'

import React from 'react'
import { Wallet } from 'lucide-react'
import { useOpenConnectModal, useWallets } from '@0xsequence/connect'
import { useState, useEffect } from 'react';


const Navbar: React.FC = () => {
  const { setOpenConnectModal } = useOpenConnectModal();
  const {
    wallets,
    disconnectWallet,
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
        // Prompt for username only if not already set and this is a new connection
        let currentUsername = localStorage.getItem('username');

        // Only prompt for username on first connection, not on refresh
        if (!currentUsername && !localStorage.getItem('hasPromptedForUsername')) {
          currentUsername = prompt("Enter a username (e.g., 'AnonUser#1234') - This will be your chat display name:");
          localStorage.setItem('hasPromptedForUsername', 'true');
        }

        if (currentUsername) {
          localStorage.setItem('username', currentUsername);
        }
        localStorage.setItem('walletAddress', active.address);
        setActiveUsername(currentUsername || null); // Update state
      }
    } else {
      // If no wallets are connected, clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('username');
        localStorage.removeItem('hasPromptedForUsername');
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
      localStorage.removeItem('hasPromptedForUsername');
    }
    setActiveWalletAddress(null);
    setActiveUsername(null);
    // router.push('/'); // Go back to home after disconnect
  };

  if (!isClient) {
    return <div className="text-center p-4">Loading wallet connection...</div>;
  }

  return (
    <div className="flex justify-between items-center mb-8">
      {/* Left side - Logo/Brand */}
      <div className="flex items-center gap-4">
        <div className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Argumint
        </div>
      </div>

      {/* Right side - Wallet & Actions */}
      <div className="flex items-center gap-4">
        {activeWalletAddress ? (
          <div className="flex items-center gap-3">
            {/* User display */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-50 group-hover:opacity-80 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-white">
                    <div className="text-sm font-bold">{activeUsername}</div>
                    <div className="text-xs text-gray-300 font-mono">
                      {activeWalletAddress.slice(0, 6)}...{activeWalletAddress.slice(-4)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Disconnect button */}
            <button
              onClick={() => handleDisconnect(activeWalletAddress)}
              className="group relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 border border-white/20 shadow-lg"
            >
              <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
              <div className="relative">Disconnect</div>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setOpenConnectModal(true)}
            className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 border border-white/20 shadow-lg"
          >
            <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            <div className="relative flex items-center gap-2">
              <Wallet className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Connect Wallet
            </div>
          </button>
        )}

        <button className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg transform hover:scale-105 transition-all duration-300 border border-white/20">
          <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
          <div className="relative flex items-center gap-2">
            <Wallet className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            SHOP
          </div>
        </button>
      </div>
    </div>
  )
}

export default Navbar