import { useState } from 'react';
import { supabase } from './supabaseClient';
import addHome from '/icons/add-to-home-ios.jpeg';

export default function Auth({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const handleSignUp = async () => {
    if (!name || !room) {
      alert('Name and room are required to sign up.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Check your email to confirm your sign-up!');

      if (data.user) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: data.user.id, name, room });

        if (insertError) {
          console.error(insertError.message);
        }

        setShowInstallPrompt(true);
      }

      onAuth();
    }
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else {
      onAuth();
      setShowInstallPrompt(true);
    }
  };

  const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '12px',
    margin: '8px 0',
    borderRadius: '8px',
    border: '1px solid #F9E5B5',
    backgroundColor: '#FFF8E1',
    fontSize: '16px',
    color: '#6D4C41',
    boxSizing: 'border-box' as const,
  };

  const buttonStyle = {
    backgroundColor: '#F9A825',
    color: '#6D4C41',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600' as const,
    fontSize: '16px',
    margin: '8px 8px 8px 0',
    transition: 'background-color 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  return (
    <>
      <div
        style={{
          maxWidth: '400px',
          margin: '2rem auto',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#FFF8E1',
          fontFamily: "'Comic Sans MS', 'Chalkboard SE', sans-serif",
        }}
      >
        <h2
          style={{
            color: '#6D4C41',
            marginBottom: '1.5rem',
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          join the feast
        </h2>

        <div
          style={{
            backgroundColor: '#FFF3CD',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1rem',
          }}
        >
          <input
            style={inputStyle}
            placeholder="name (only for sign up)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="room (only for sign up)"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={inputStyle}
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <button
              onClick={handleSignUp}
              style={buttonStyle}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F57F17')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F9A825')}
            >
              sign up
            </button>
            <button
              onClick={handleSignIn}
              style={buttonStyle}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F57F17')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F9A825')}
            >
              log in
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <span style={{ color: '#6D4C41', fontSize: '14px', opacity: 0.8 }}>
            join the fun and track your food adventures!
          </span>
        </div>
      </div>

      {/* Install Prompt Modal for iPhone */}
      {showInstallPrompt && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFF8E1',
              padding: '2rem',
              borderRadius: '12px',
              maxWidth: '90%',
              textAlign: 'center',
            }}
          >
            <h3 style={{ color: '#6D4C41', fontSize: '20px' }}>Add to Home Screen</h3>
            <p style={{ color: '#6D4C41' }}>
              Tap <strong>“Share”</strong> then <strong>“Add to Home Screen”</strong> to install this app.
            </p>
            <img
              src={addHome}
              alt="iOS Add to Home Screen Instructions"
              style={{ maxWidth: '100%', borderRadius: '8px', margin: '1rem 0' }}
            />
            <button
              onClick={() => setShowInstallPrompt(false)}
              style={{ ...buttonStyle, marginTop: '1rem' }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
