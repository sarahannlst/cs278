import React, { useEffect, useState } from 'react';
import ChatRoom from './ChatRoom';
import { supabase } from './supabaseClient';
import Auth from './Auth';

function App() {
  const [session, setSession] = useState<any>(null);
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single();
  
        if (data?.name) {
          setName(data.name);
        }
      }
    };
    fetchProfile();
  }, [session]);
  

  if (!session) {
    return <Auth onAuth={() => supabase.auth.getSession().then(({ data }) => setSession(data.session))} />;
  }

  if (joined) {
    return <ChatRoom userName={name} room={room || 'default'} />;
  }

  return (
    <div>
      <h1>Join Chat</h1>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Room (optional)"
        value={room}
        onChange={e => setRoom(e.target.value)}
      />
      <button onClick={() => setJoined(true)}>Join</button>
      <button onClick={() => supabase.auth.signOut()}>Log Out</button>
    </div>
  );
}

export default App;
