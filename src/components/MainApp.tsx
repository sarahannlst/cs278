import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import {  Navigate } from 'react-router-dom';
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
  const [userName, setUserName] = useState<string>('Anonymous');
  useEffect(() => {
    const fetchUserName = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user name:', error.message);
        return;
      }

      if (data?.name) {
        setUserName(data.name);
      }
    };

    fetchUserName();
  }, [session]);
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
      <main style={{ paddingBottom: '60px', backgroundColor: '#fff8e1', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route
              path="/home"
              element={
                <HomePage
                  title="Home"
                  userId={session?.user?.id}
                  room={room}
                />
              }
            />
            <Route path="/complete/:challengeId" element={<ChallengeCompletePage userId={session?.user?.id} />} />
            <Route
              path="/chat"
              element={
                joined ? (
                  <ChatRoom userName={userName} room={room || 'default'} />
                ) : (
                  <div style={{ padding: '1rem' }}>Loading room info...</div>
                )
              }
            />
            <Route path="/profile" element={<ProfilePage session={session} />} />
          </Routes>
      </main>
      <BottomNav />
    </>
  );
};

export default MainApp;