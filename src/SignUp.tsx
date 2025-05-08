import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      alert(error.message);
    } else {
      const userId = data.user?.id;

      if (userId) {
        // Save name to a `profiles` table (make sure it exists)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ id: userId, name });

        if (profileError) {
          alert('Sign-up succeeded, but error saving name: ' + profileError.message);
        } else {
          alert('Account created!');
        }
      }
    }
  };

  return (
    <div>
      <h2>Create Account</h2>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        type="email"
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
    </div>
  );
}

export default SignUp;
