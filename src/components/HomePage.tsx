import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
}

interface LeaderboardEntry {
  user_id: string;
  name: string;
  room: string;
  total_points: number;
  challenges_completed: number;
}

interface HomePageProps {
  title: string;
  userId: string | null | undefined;
  room: string; // New prop for leaderboard context
}

const HomePage: React.FC<HomePageProps> = ({ title, userId, room }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      console.warn('No userId provided. Skipping fetch.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch completed challenge IDs
        const { data: completed, error: completedError } = await supabase
          .from('user_challenges')
          .select('challenge_id')
          .eq('user_id', userId);

        if (completedError) throw completedError;

        const completedIds = completed ? completed.map((row) => row.challenge_id) : [];

        // Fetch uncompleted challenges
        let query = supabase.from('challenges').select('*');
        if (completedIds.length > 0) {
          query = query.not('id', 'in', `(${completedIds.join(',')})`);
        }

        const { data: uncompleted, error: uncompletedError } = await query;
        if (uncompletedError) throw uncompletedError;

        setChallenges(uncompleted || []);

        // Fetch leaderboard for the room
        const { data: leaderboardData, error: leaderboardError } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('room', room)
          .order('total_points', { ascending: false });

        if (leaderboardError) throw leaderboardError;

        setLeaderboard(leaderboardData || []);
      } catch (err: any) {
        console.error('Error fetching data:', err.message);
      }

      setLoading(false);
    };

    fetchData();
  }, [userId, room]);

  const handleCompleteClick = (challengeId: number) => {
    navigate(`/complete/${challengeId}`);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>{title}</h1>

      {loading ? (
        <p>Loading challenges and leaderboard...</p>
      ) : (
        <>
          {/* Challenges Section */}
          {challenges.length === 0 ? (
            <p>🎉 You've completed all available challenges!</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {challenges.map((challenge) => (
                <li key={challenge.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>{challenge.title}</strong> – {challenge.description} ({challenge.points} pts)
                  </div>
                  <button onClick={() => handleCompleteClick(challenge.id)}>Complete</button>
                </li>
              ))}
            </ul>
          )}

          {/* Leaderboard Section */}
          <h2 style={{ marginTop: '2rem' }}>🏆 Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <p>No leaderboard data available for this room.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Name</th>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'right' }}>Points</th>
                  <th style={{ borderBottom: '1px solid #ccc', textAlign: 'right' }}>Challenges Completed</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.user_id}>
                    <td>{entry.name}</td>
                    <td style={{ textAlign: 'right' }}>{entry.total_points}</td>
                    <td style={{ textAlign: 'right' }}>{entry.challenges_completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
