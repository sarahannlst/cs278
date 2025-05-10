import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatRoom from './ChatRoom';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';
import BottomNav from './BottomNav';
import ChallengeCompletePage from './ChallengeCompletePage';
import { supabase } from '../supabaseClient';

const MainApp: React.FC<{
  session: any;
  room: string;
  setRoom: (room: string) => void;
  joined: boolean;
  setJoined: (j: boolean) => void;
}> = ({ session, room, setRoom, joined, setJoined }) => {
  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email ||
    'Anonymous';

  useEffect(() => {
    const fetchRoom = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('room')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching room:', error.message);
        return;
      }

      if (data?.room) {
        setRoom(data.room);
        setJoined(true);
      }
    };

    fetchRoom();
  }, [session, setRoom, setJoined]);

  return (
    <>
      <main style={{ paddingBottom: '60px' }}>
        <Routes>
          <Route path="/cs278" element={<Navigate to="/cs278/home" />} />
          <Route
            path="/cs278/home"
            element={<HomePage title="Home" userId={session?.user?.id} />}
            />
            <Route path="/complete/:challengeId" element={<ChallengeCompletePage userId={session?.user?.id} />} />
          <Route
            path="/cs278/chat"
            element={
              joined ? (
                <ChatRoom userName={userName} room={room || 'default'} />
              ) : (
                <div style={{ padding: '1rem' }}>Loading room info...</div>
              )
            }
          />
          <Route path="/cs278/profile" element={<ProfilePage session={session} />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  );
};

export default MainApp;