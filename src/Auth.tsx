import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (error) {
      alert(error.message);
    } else {
      alert('Check your email to confirm your sign-up!');
  
      if (data.user) {
        // Optional: Save name to profiles after user confirms email and logs in
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: data.user.id, name });
  
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
      <input placeholder="Name (only for sign up)" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleSignIn}>Log In</button>
    </div>
  );
}
