import React, { useEffect, useState } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import Auth from './Auth';
import SessionListener from './components/SessionListener';
import MainApp from './components/MainApp';
import { supabase } from './supabaseClient';

// ---------- Main App ----------
const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);

  return (
    <Router>
      <SessionListener setSession={setSession} />
      {!session ? (
        <Auth
          onAuth={async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
          }}
        />
      ) : (
        <MainApp session={session} room={room} setRoom={setRoom} joined={joined} setJoined={setJoined} />
      )}
    </Router>
  );
};

export default App;
