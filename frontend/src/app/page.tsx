// 'use client'
// import { useOpenConnectModal } from '@0xsequence/connect';
// import { useWallets } from '@0xsequence/connect';
// import ChatRoom from '@/components/ChatRoom';

// export default function Home() {
//   const {setOpenConnectModal} = useOpenConnectModal();
//   const { 
//     wallets, 
//     linkedWallets, 
//     setActiveWallet, 
//     disconnectWallet,
//     refetchLinkedWallets
//   } = useWallets()
//   return (
//     <main>
//          <h2>Connected Wallets</h2>
//       <div>
//         {wallets.map(wallet => (
//           <div key={wallet.address}>
//             <span>
//               {wallet.name}: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
//             </span>
//             {wallet.isActive ? ' (Active)' : ''}
//             {wallet.isEmbedded ? ' (Embedded)' : ''}
//             <button onClick={() => setActiveWallet(wallet.address)}>
//               Set Active
//             </button>
//             <button onClick={() => disconnectWallet(wallet.address)}>
//               Disconnect
//             </button>
//           </div>
//         ))}
//       </div>
      
//       {linkedWallets && linkedWallets.length > 0 && (
//         <>
//           <h2>Linked Wallets</h2>
//           <button onClick={refetchLinkedWallets}>Refresh</button>
//           <div>
//             {linkedWallets.map(linkedWallet => (
//               <div key={linkedWallet.walletAddress}>
//                 {linkedWallet.walletAddress.slice(0, 6)}...{linkedWallet.walletAddress.slice(-4)}
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//         <button onClick={() => setOpenConnectModal(true)}>Connect</button>
//       <ChatRoom />
//     </main>
//   );
// }

'use client'
import { useOpenConnectModal } from '@0xsequence/connect';
import { useWallets } from '@0xsequence/connect';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter


export default function Home() {
  const router = useRouter(); // Initialize useRouter
  const { setOpenConnectModal } = useOpenConnectModal();
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
        
        // Send wallet address and username to your backend
        if (active.address && currentUsername) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: active.address, username: currentUsername }),
          }).then(res => {
            if (!res.ok) {
              console.error("Failed to register user on backend.");
            } else {
              return res.json();
            }
          }).then(userData => {
            if (userData && userData.username) {
              setActiveUsername(userData.username);
              localStorage.setItem('username', userData.username);
            }
          }).catch(error => console.error("Error sending user data to backend:", error));
        }

        localStorage.setItem('walletAddress', active.address);
        setActiveUsername(currentUsername || null); // Update state
        router.push('/chatrooms'); // Redirect to chatrooms after wallet is active
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
  }, [wallets, activeWalletAddress, router]); // Dependency on wallets array to detect changes

  const handleDisconnect = async (address: string) => {
    await disconnectWallet(address);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('username');
    }
    setActiveWalletAddress(null);
    setActiveUsername(null);
    router.push('/'); // Go back to home after disconnect
  };

  if (!isClient) {
    return <div className="text-center p-4">Loading wallet connection...</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Argumint Chat</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Wallet Status</h2>
        {activeWalletAddress ? (
          <div>
            <p className="text-gray-700 text-lg mb-2">
              Connected as: <span className="font-mono text-base bg-gray-200 px-2 py-1 rounded-md">{activeUsername || activeWalletAddress.slice(0, 6) + '...' + activeWalletAddress.slice(-4)}</span>
            </p>
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
      </div>

      {activeWalletAddress && (
        <p className="text-lg text-gray-600 mt-4">
          You are now logged in. Go to <button onClick={() => router.push('/chatrooms')} className="text-blue-600 underline hover:text-blue-800">Chat Rooms</button> to start chatting!
        </p>
      )}

      {/* Linked Wallets Display (Optional - from your original code) */}
      {linkedWallets && linkedWallets.length > 0 && (
        <div className="mt-8 bg-white shadow-md rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Linked Wallets</h2>
          <button 
            onClick={refetchLinkedWallets}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mb-4 hover:bg-gray-300 transition-colors"
          >
            Refresh Linked Wallets
          </button>
          <div className="space-y-2">
            {linkedWallets.map(linkedWallet => (
              <div key={linkedWallet.walletAddress} className="bg-gray-50 p-2 rounded-md border border-gray-200 text-gray-700">
                {linkedWallet.walletAddress.slice(0, 6)}...{linkedWallet.walletAddress.slice(-4)}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}