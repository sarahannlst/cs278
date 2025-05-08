import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

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
      }

      onAuth();
    }
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else onAuth();
  };

  return (
    <div>
      <h2>Sign Up / Log In</h2>
      <input
        placeholder="Name (only for sign up)"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        placeholder="Room (only for sign up)"
        value={room}
        onChange={e => setRoom(e.target.value)}
      />
      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleSignIn}>Log In</button>
    </div>
  );
}
