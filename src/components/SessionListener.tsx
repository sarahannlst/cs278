import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

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

export default SessionListener;