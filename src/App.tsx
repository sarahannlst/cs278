import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import ChatRoom from './ChatRoom';
import Auth from './Auth';
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

// ---------- SessionListener ----------
const SessionListener: React.FC<{ setSession: (session: any) => void }> = ({ setSession }) => {
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        if (!hasRedirected) {
          navigate('/cs278/home', { replace: true });
          setHasRedirected(true);
        }
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        if (!hasRedirected) {
          navigate('/home', { replace: true });
          setHasRedirected(true);
        }
      } else {
        setSession(null);
        setHasRedirected(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate, setSession, hasRedirected]);

  return null;
};

// ---------- MainApp ----------
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
          <Route path="/cs278/home" element={<Page title="Home" />} />
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

// ---------- Page ----------
const Page: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '1rem' }}>
    <h1>{title}</h1>
  </div>
);

// ---------- ProfilePage ----------
const ProfilePage: React.FC<{ session: any }> = ({ session }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/cs278');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Profile</h1>
      <p>Welcome, {session.user?.user_metadata?.full_name || session.user?.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

// ---------- BottomNav ----------
const BottomNav: React.FC = () => (
  <nav
    style={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'space-around',
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #ccc',
      padding: '10px 0',
    }}
  >
    <NavLink to="/cs278/home" label="Home" />
    <NavLink to="/cs278/chat" label="Chat" />
    <NavLink to="/cs278/profile" label="Profile" />
  </nav>
);

// ---------- NavLink ----------
const NavLink: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <Link
    to={to}
    style={{
      textDecoration: 'none',
      color: '#333',
      fontWeight: 'bold',
    }}
  >
    {label}
  </Link>
);
