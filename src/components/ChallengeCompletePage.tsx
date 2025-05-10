import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface ChallengeCompletePageProps {
  userId: string;
}

const ChallengeCompletePage: React.FC<ChallengeCompletePageProps> = ({ userId }) => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const markComplete = async () => {
      if (!userId || !challengeId) return;

      const { error } = await supabase.from('user_challenges').insert([
        {
          user_id: userId,
          challenge_id: parseInt(challengeId),
        },
      ]);

      if (error) {
        console.error('Error marking challenge complete:', error.message);
        return;
      }

      navigate('/cs278/home');
    };

    markComplete();
  }, [userId, challengeId, navigate]);

  return <p>Marking challenge as complete...</p>;
};

export default ChallengeCompletePage;
