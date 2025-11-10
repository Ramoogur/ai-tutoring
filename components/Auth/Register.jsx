import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient'; 
import bcrypt from 'bcryptjs';

const Register = ({ navigateTo }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Validation states
  const [touched, setTouched] = useState({
    fullName: false,
    username: false,
    password: false,
    confirmPassword: false
  });

  const [validationErrors, setValidationErrors] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // Validation functions
  const validateFullName = (name) => {
    if (!name || name.trim().length === 0) {
      return 'Full name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Name should only contain letters';
    }
    return '';
  };

  const validateUsername = (user) => {
    if (!user || user.trim().length === 0) {
      return 'Username is required';
    }
    if (user.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (user.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(user)) {
      return 'Username can only contain letters, numbers, and underscores';
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
    if (pwd.length > 50) {
      return 'Password must be less than 50 characters';
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[0-9])/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const validateConfirmPassword = (confirmPwd, pwd) => {
    if (!confirmPwd || confirmPwd.length === 0) {
      return 'Please confirm your password';
    }
    if (confirmPwd !== pwd) {
      return 'Passwords do not match';
    }
    return '';
  };

  // Check if field is valid
  const isFieldValid = (field) => {
    if (!touched[field]) return null;
    return validationErrors[field] === '';
  };

  // Real-time validation
  const handleFullNameChange = (value) => {
    setFullName(value);
    if (touched.fullName) {
      setValidationErrors(prev => ({
        ...prev,
        fullName: validateFullName(value)
      }));
    }
  };

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
    if (touched.confirmPassword && confirmPassword) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: validateConfirmPassword(confirmPassword, value)
      }));
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, password)
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    switch(field) {
      case 'fullName':
        setValidationErrors(prev => ({ ...prev, fullName: validateFullName(fullName) }));
        break;
      case 'username':
        setValidationErrors(prev => ({ ...prev, username: validateUsername(username) }));
        break;
      case 'password':
        setValidationErrors(prev => ({ ...prev, password: validatePassword(password) }));
        break;
      case 'confirmPassword':
        setValidationErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, password) }));
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Mark all fields as touched
    setTouched({
      fullName: true,
      username: true,
      password: true,
      confirmPassword: true
    });

    // Validate all fields
    const errors = {
      fullName: validateFullName(fullName),
      username: validateUsername(username),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password)
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
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('Student')
        .select('username')
        .eq('username', username)
        .single();

      if (existingUser) {
        setError('Username already exists. Please choose a different one.');
        setIsLoading(false);
        return;
      }

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
        setIsLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigateTo('login');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred: ' + err.message);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container modern-auth success-container">
        <div className="success-animation">
          <div className="success-icon">✅</div>
          <h2 className="success-title">Account Created!</h2>
          <p className="success-message">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

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
        <div className="auth-icon">🚀</div>
        <h2 className="form-title">Join Learn&Count ✏️</h2>
        <p className="auth-subtitle">Start your math learning adventure today!</p>
      </div>
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="modern-form two-column-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fullName">
              <span className="label-icon">📝</span>
              Full Name
            </label>
            <div className={`input-wrapper ${isFieldValid('fullName') === true ? 'valid' : isFieldValid('fullName') === false ? 'invalid' : ''}`}>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => handleFullNameChange(e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="Enter your full name"
                className="modern-input"
                disabled={isLoading}
              />
              {isFieldValid('fullName') === true && <span className="validation-icon success">✓</span>}
              {isFieldValid('fullName') === false && <span className="validation-icon error">✗</span>}
            </div>
            {touched.fullName && validationErrors.fullName && (
              <small className="validation-error">{validationErrors.fullName}</small>
            )}
          </div>

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
                placeholder="Choose a unique username"
                className="modern-input"
                disabled={isLoading}
              />
              {isFieldValid('username') === true && <span className="validation-icon success">✓</span>}
              {isFieldValid('username') === false && <span className="validation-icon error">✗</span>}
            </div>
            {touched.username && validationErrors.username ? (
              <small className="validation-error">{validationErrors.username}</small>
            ) : (
              <small className="input-hint">Letters, numbers, and underscores only</small>
            )}
          </div>
        </div>

        <div className="form-row">
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
                placeholder="Create a strong password"
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
            {touched.password && validationErrors.password ? (
              <small className="validation-error">{validationErrors.password}</small>
            ) : (
              <small className="input-hint">Min 6 chars, 1 lowercase, 1 number</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <span className="label-icon">🔐</span>
              Confirm Password
            </label>
            <div className={`input-wrapper password-wrapper ${isFieldValid('confirmPassword') === true ? 'valid' : isFieldValid('confirmPassword') === false ? 'invalid' : ''}`}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Re-enter your password"
                className="modern-input"
                disabled={isLoading}
              />
              {isFieldValid('confirmPassword') === true && <span className="validation-icon success">✓</span>}
              {isFieldValid('confirmPassword') === false && <span className="validation-icon error">✗</span>}
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {touched.confirmPassword && validationErrors.confirmPassword && (
              <small className="validation-error">{validationErrors.confirmPassword}</small>
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
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <span className="btn-arrow">→</span>
            </>
          )}
        </button>
      </form>

      <div className="auth-footer-wrapper">
        <div className="auth-footer centered-footer">
          <span className="footer-text">Already have an account?</span>
          <a href="#" className="auth-link inline-link" onClick={(e) => {
            e.preventDefault();
            navigateTo('login');
          }}>
            <span className="link-icon">🔑</span>
            Login here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
