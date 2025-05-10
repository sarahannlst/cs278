import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

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

export default ProfilePage;