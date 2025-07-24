'use client'
import { useOpenConnectModal } from '@0xsequence/connect';
import ChatRoom from '@/components/ChatRoom';

export default function Home() {
  const {setOpenConnectModal} = useOpenConnectModal();
  return (
    <main>
        <button onClick={() => setOpenConnectModal(true)}>Connect</button>
      <ChatRoom />
    </main>
  );
}
