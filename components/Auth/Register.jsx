import React, { useState } from 'react';
import { supabase } from '../Utils/supabaseClient'; 
import bcrypt from 'bcryptjs';

const Register = ({ navigateTo }) => {
  const [email, setEmail] = useState(''); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState('1');
  const [accountType, setAccountType] = useState('student');
  const [fullName, setFullName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

   // Basic Validation
   if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  if (accountType === 'student') {
    if (!username || !fullName || !parentEmail || !password) {
      setError('Please fill in all student fields');
      return;
    }
  }

  if (accountType === 'parent') {
    if (!email || !password) {
      setError('Please provide Email and Password for parent accounts');
      return;
    }
  }


    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      let tableName = '';
      let userData = {};

      if (accountType === 'student') {
        tableName = 'Student';
        userData = {
          username,
          full_name: fullName,
          parent_email: parentEmail,
          grade_level: parseInt(grade),
          password: hashedPassword,
          account_type: accountType,
        };
      } else {
        tableName = 'Parent';
        userData = {
          parent_email: email, 
          password: hashedPassword,
          account_type: accountType,
        };
      }

      const { data, error: insertError } = await supabase
        .from(tableName)
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
      <h2 className="form-title">Create an Account</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="accountType">Account Type</label>
          <div className="account-type-selector">
            <div
              className={`account-type-option ${accountType === 'student' ? 'active' : ''}`}
              onClick={() => setAccountType('student')}
            >
              <span className="account-icon">👨‍🎓</span>
              <span>Student</span>
            </div>
            <div
              className={`account-type-option ${accountType === 'parent' ? 'active' : ''}`}
              onClick={() => setAccountType('parent')}
            >
              <span className="account-icon">👨‍👩‍👧‍👦</span>
              <span>Parent</span>
            </div>
          </div>
        </div>

        {accountType === 'student' && (
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
)}

{accountType === 'parent' && (
  <div className="form-group">
    <label htmlFor="email">Email</label>
    <input
      type="email"
      id="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Enter your email"
    />
  </div>
)}


        {accountType === 'student' && (
          <>
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
              <label htmlFor="parentEmail">Parent's Email</label>
              <input
                type="email"
                id="parentEmail"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="Enter parent's email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="grade">Grade Level</label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="form-select"
              >
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
              </select>
            </div>
          </>
        )}

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
