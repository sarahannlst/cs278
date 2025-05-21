import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProfilePage: React.FC<{ session: any }> = ({ session }) => {
  const navigate = useNavigate();
  const userId = session.user?.id;

  const [name, setName] = useState<string | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const [challengesCompleted, setChallengesCompleted] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileAndPoints = async () => {
      setLoading(true);

      // Fetch profile data: name and room
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, room')
        .eq('id', userId)
        .single();

      if (profileError || !profileData?.name || !profileData?.room) {
        console.error('Failed to fetch user profile:', profileError?.message);
        setLoading(false);
        return;
      }

      setName(profileData.name);
      setRoom(profileData.room);

      // Fetch leaderboard data: total_points and challenges_completed for this user in their room
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('leaderboard')
        .select('total_points, challenges_completed')
        .eq('room', profileData.room)
        .eq('user_id', userId) // adjust or remove if user_id not present
        .single();

      if (leaderboardError) {
        console.error('Failed to fetch leaderboard data:', leaderboardError.message);
        setLoading(false);
        return;
      }

      setTotalPoints(leaderboardData?.total_points ?? 0);
      setChallengesCompleted(leaderboardData?.challenges_completed ?? 0);
      setLoading(false);
    };

    if (userId) {
      fetchProfileAndPoints();
    }
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/cs278');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  }

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: 'auto',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#FFF8E1',
        textAlign: 'center',
        fontFamily: "'Comic Sans MS', 'Chalkboard SE', sans-serif",
      }}
    >
      <h1 style={{ marginBottom: '1rem', color: '#6D4C41' }}>your profile</h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#6D4C41' }}>
        <strong>Name:</strong> {name || 'N/A'}
      </p>
      <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#6D4C41' }}>
        <strong>Room:</strong> {room || 'N/A'}
      </p>
      <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#6D4C41' }}>
        <strong>Total Points:</strong> {totalPoints !== null ? totalPoints : 'N/A'}
      </p>
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#6D4C41' }}>
        <strong>Challenges Completed:</strong> {challengesCompleted !== null ? challengesCompleted : 'N/A'}
      </p>

      <button
        onClick={handleLogout}
        style={{
          backgroundColor: '#F9A825',
          color: '#6D4C41',
          border: 'none',
          padding: '0.75rem 2rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '1rem',
          transition: 'background-color 0.3s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F57F17')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#F9A825')}
      >
        logout
      </button>
    </div>
  );
};

export default ProfilePage;
