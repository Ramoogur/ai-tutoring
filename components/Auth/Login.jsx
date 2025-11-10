import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient'; 
import bcrypt from 'bcryptjs';

const Login = ({ onLogin, navigateTo }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation states
  const [touched, setTouched] = useState({
    username: false,
    password: false
  });

  const [validationErrors, setValidationErrors] = useState({
    username: '',
    password: ''
  });

  // Validation functions
  const validateUsername = (user) => {
    if (!user || user.trim().length === 0) {
      return 'Username is required';
    }
    if (user.length < 3) {
      return 'Username must be at least 3 characters';
    }
    return '';
  };

  const validatePassword = (pwd) => {
    if (!pwd || pwd.length === 0) {
      return 'Password is required';
    }
    if (pwd.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  // Check if field is valid
  const isFieldValid = (field) => {
    if (!touched[field]) return null;
    return validationErrors[field] === '';
  };

  // Real-time validation
  const handleUsernameChange = (value) => {
    setUsername(value);
    if (touched.username) {
      setValidationErrors(prev => ({
        ...prev,
        username: validateUsername(value)
      }));
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (touched.password) {
      setValidationErrors(prev => ({
        ...prev,
        password: validatePassword(value)
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'username') {
      setValidationErrors(prev => ({ ...prev, username: validateUsername(username) }));
    } else if (field === 'password') {
      setValidationErrors(prev => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Mark all fields as touched
    setTouched({
      username: true,
      password: true
    });

    // Validate all fields
    const errors = {
      username: validateUsername(username),
      password: validatePassword(password)
    };

    setValidationErrors(errors);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    
    if (hasErrors) {
      setError('Please fix all errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      // Query Supabase Student table
      const { data, error: dbError } = await supabase
        .from('Student')
        .select('*')
        .eq('username', username)
        .single();

      if (dbError || !data) {
        setError('Username not found. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Compare password hash
      const passwordMatch = await bcrypt.compare(password, data.password);

      if (!passwordMatch) {
        setError('Incorrect password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Create user object for dashboard
      const userData = {
        id: data.id,
        username: data.username,
        fullName: data.full_name,
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
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  
  return (
    <div className="auth-container modern-auth compact-auth">
      <button 
        className="home-button" 
        onClick={() => navigateTo('landing')}
        title="Back to Home"
      >
        🏠 Home
      </button>
      
      <div className="auth-header compact-header">
        <div className="auth-icon">🎓</div>
        <h2 className="form-title">Welcome Back!</h2>
        <p className="auth-subtitle">Login to continue your learning journey</p>
      </div>
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="modern-form single-column-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="username">
              <span className="label-icon">👤</span>
              Username
            </label>
            <div className={`input-wrapper ${isFieldValid('username') === true ? 'valid' : isFieldValid('username') === false ? 'invalid' : ''}`}>
              <input 
                type="text" 
                id="username" 
                value={username} 
                onChange={(e) => handleUsernameChange(e.target.value)}
                onBlur={() => handleBlur('username')}
                placeholder="Enter your username"
                className="modern-input"
                disabled={isLoading}
              />
              {isFieldValid('username') === true && <span className="validation-icon success">✓</span>}
              {isFieldValid('username') === false && <span className="validation-icon error">✗</span>}
            </div>
            {touched.username && validationErrors.username && (
              <small className="validation-error">{validationErrors.username}</small>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Password
            </label>
            <div className={`input-wrapper password-wrapper ${isFieldValid('password') === true ? 'valid' : isFieldValid('password') === false ? 'invalid' : ''}`}>
              <input 
                type={showPassword ? "text" : "password"}
                id="password" 
                value={password} 
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Enter your password"
                className="modern-input"
                disabled={isLoading}
              />
              {isFieldValid('password') === true && <span className="validation-icon success">✓</span>}
              {isFieldValid('password') === false && <span className="validation-icon error">✗</span>}
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {touched.password && validationErrors.password && (
              <small className="validation-error">{validationErrors.password}</small>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          className="btn modern-btn full-width-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Logging in...
            </>
          ) : (
            <>
              Login
              <span className="btn-arrow">→</span>
            </>
          )}
        </button>
      </form>

      <div className="auth-footer-wrapper">
        <div className="auth-footer centered-footer">
          <span className="footer-text">New to Learn&Count?</span>
          <a href="#" className="auth-link inline-link" onClick={(e) => {
            e.preventDefault();
            navigateTo('register');
          }}>
            <span className="link-icon">✨</span>
            Create your account
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;