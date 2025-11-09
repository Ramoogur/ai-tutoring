import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient'; 
import bcrypt from 'bcryptjs';

const Register = ({ navigateTo }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

   // Basic Validation
   if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  if (!username || !fullName || !password) {
    setError('Please fill in all fields');
    return;
  }


    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        username,
        full_name: fullName,
        grade_level: 1,
        password: hashedPassword,
        account_type: 'student',
      };

      const { data, error: insertError } = await supabase
        .from('Student')
        .insert([userData]);

      if (insertError) {
        console.error('Supabase error:', insertError);
        setError('Registration failed: ' + insertError.message);
      } else {
        alert('Registration successful! Please login with your new account.');
        navigateTo('login');
      }
    } catch (err) {
      setError('An unexpected error occurred: ' + err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2 className="form-title">Create an Account ✏️</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
          />
        </div>
        <button type="submit" className="btn">Register</button>
      </form>
      <a href="#" className="auth-link" onClick={() => navigateTo('login')}>
        Already have an account? Login here
      </a>
    </div>
  );
};

export default Register;
