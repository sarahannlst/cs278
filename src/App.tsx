import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import ChatRoom from './ChatRoom';
import Auth from './Auth';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [room, setRoom] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch room from profile after login
  useEffect(() => {
    const fetchRoom = async () => {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('room')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile room:', error.message);
        return;
      }

      if (data?.room) {
        setRoom(data.room);
        setJoined(true);
      }
    };

    fetchRoom();
  }, [session]);

  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email ||
    'Anonymous';

  if (!session) {
    return <Auth onAuth={() => supabase.auth.getSession().then(({ data }) => setSession(data.session))} />;
  }

  return (
    <Router>
      <main style={{ paddingBottom: '60px' }}>
        <Routes>
          <Route path="/" element={<Page title="Home" />} />
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
    </Router>
  );
};

export default App;

// ProfilePage with Logout Button
const ProfilePage: React.FC<{ session: any }> = ({ session }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Profile</h1>
      <p>Welcome, {session.user?.user_metadata?.full_name || session.user?.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

// Basic Page Component (unchanged)
const Page: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '1rem' }}>
    <h1>{title}</h1>
  </div>
);

// Bottom navigation (unchanged)
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
    <NavLink to="/" label="Home" />
    <NavLink to="/chat" label="Chat" />
    <NavLink to="/profile" label="Profile" />
  </nav>
);

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
