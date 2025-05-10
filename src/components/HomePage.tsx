import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
}

interface HomePageProps {
  title: string;
  userId: string | null | undefined;
}

const HomePage: React.FC<HomePageProps> = ({ title, userId }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      console.warn('No userId provided. Skipping fetch.');
      setLoading(false);
      return;
    }

    const fetchUncompletedChallenges = async () => {
      setLoading(true);

      const { data: completed, error: completedError } = await supabase
        .from('user_challenges')
        .select('challenge_id')
        .eq('user_id', userId);

      if (completedError) {
        console.error('Error fetching completed challenges:', completedError.message);
        setLoading(false);
        return;
      }
      const completedIds = completed ? completed.map((row) => row.challenge_id) : [];
      console.log('Completed challenge IDs:', completedIds);
      let query = supabase.from('challenges').select('*');
      if (completedIds.length > 0) {
        query = query.not('id', 'in', `(${completedIds.join(',')})`);
      }

      const { data: uncompleted, error: uncompletedError } = await query;

      if (uncompletedError) {
        console.error('Error fetching uncompleted challenges:', uncompletedError.message);
      } else {
        setChallenges(uncompleted);
      }

      setLoading(false);
    };

    fetchUncompletedChallenges();
  }, [userId]);

  const handleCompleteClick = (challengeId: number) => {
    navigate(`/complete/${challengeId}`);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>{title}</h1>
      {loading ? (
        <p>Loading challenges...</p>
      ) : challenges.length === 0 ? (
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
    </div>
  );
};

export default HomePage;
