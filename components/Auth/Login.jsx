import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient'; 
import bcrypt from 'bcryptjs';

const Login = ({ onLogin, navigateTo }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Query Supabase Student table
    const { data, error: dbError } = await supabase
      .from('Student')
      .select('*')
      .eq('username', username)
      .single();

    if (dbError || !data) {
      setError('Username not found');
      return;
    }

    // Compare password hash
    const passwordMatch = await bcrypt.compare(password, data.password);

    if (!passwordMatch) {
      setError('Incorrect password');
      return;
    }

    // Create user object for dashboard
    const userData = {
      id: data.id,
      username: data.username,
      grade: data.grade_level,
      accountType: 'student',
      progress: {
        completedQuizzes: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        topicProgress: {},
        quizHistory: []
      },
      linkedAccounts: []
    };

    onLogin(userData);
  };

  
  return (
    <div className="auth-container">
      <h2 className="form-title">Login to Learn&Count</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            type="text" 
            id="username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Enter your username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="btn">Login</button>
      </form>
      <a href="#" className="auth-link" onClick={() => navigateTo('register')}>
        Don't have an account? Register here
      </a>
    </div>
  );
};

export default Login;