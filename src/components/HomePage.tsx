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
  room: string;
}

const HomePage: React.FC<HomePageProps> = ({ title, userId, room }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
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
        const { data: completed, error: completedError } = await supabase
          .from('user_challenges')
          .select('challenge_id')
          .eq('user_id', userId);

        if (completedError) throw completedError;

        const completedIds = completed ? completed.map((row) => row.challenge_id) : [];

        // Fetch completed challenge details
        const { data: completedData, error: completedDataError } = await supabase
          .from('challenges')
          .select('*')
          .in('id', completedIds);

        if (completedDataError) throw completedDataError;
        setCompletedChallenges(completedData || []);

        // Fetch uncompleted challenge details
        let query = supabase.from('challenges').select('*');
        if (completedIds.length > 0) {
          query = query.not('id', 'in', `(${completedIds.join(',')})`);
        }

        const { data: uncompleted, error: uncompletedError } = await query;
        if (uncompletedError) throw uncompletedError;

        setChallenges(uncompleted || []);

        // Fetch leaderboard
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
    <div style={{ padding: '1rem', fontFamily: "'Comic Sans MS', sans-serif", background: '#fff7e6' }}>
      <h2 style={{ fontSize: '1.5rem', color: '#5c3c10', marginBottom: '1rem' }}>🍽 your leftovers</h2>

      {loading ? (
        <p>Loading your fun tasks...</p>
      ) : (
        <>
          {/* Uncompleted Challenges Section */}
          {challenges.length === 0 ? (
            <p>🎉 You've completed all available challenges!</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {challenges.map((challenge) => (
                <li
                  key={challenge.id}
                  style={{
                    background: '#fff2cc',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <div>
                    <strong style={{ color: '#5c3c10' }}>{challenge.title}</strong> {challenge.description}
                  </div>
                  <button
                    onClick={() => handleCompleteClick(challenge.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      cursor: 'pointer'
                    }}
                    title="Complete this challenge"
                  >
                    📸
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Completed Challenges Section */}
          <h2 style={{ fontSize: '1.5rem', color: '#5c3c10', marginTop: '2rem' }}>✅ completed challenges</h2>
          {completedChallenges.length === 0 ? (
            <p>You haven't completed any challenges yet.</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {completedChallenges.map((challenge) => (
                <li
                  key={challenge.id}
                  style={{
                    background: '#d9ead3',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <strong style={{ color: '#38761d' }}>{challenge.title}</strong> {challenge.description}
                </li>
              ))}
            </ul>
          )}

          {/* Leaderboard Section */}
          <h2 style={{ fontSize: '1.5rem', color: '#5c3c10', marginTop: '2rem' }}>🏆 leaderboard</h2>
          {leaderboard.length === 0 ? (
            <p>No leaderboard data available for this room.</p>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-end' }}>
                {leaderboard
                  .slice(0, 3)
                  .map((entry, index) => {
                    const ranks = ['🥇', '🥈', '🥉'];
                    const heights = ['120px', '80px', '70px'];
                    const colors = ['#ffd700', '#ccc', '#cd7f32'];

                    return (
                      <div key={entry.user_id} style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            height: heights[index],
                            width: '70px',
                            backgroundColor: colors[index],
                            borderRadius: '10px 10px 0 0',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            paddingBottom: '0.5rem'
                          }}
                        >
                          <div style={{ fontSize: '2rem' }}>🐭</div>
                        </div>
                        <div style={{ marginTop: '0.3rem', fontWeight: 'bold' }}>
                          {ranks[index]} {entry.name}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
