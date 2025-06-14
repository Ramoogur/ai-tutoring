const Login = ({ onLogin, navigateTo }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [accountType, setAccountType] = React.useState('student');
  const [error, setError] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // Check if user exists in localStorage
    const storedUser = localStorage.getItem('mathWhizRegistered_' + username);
    
    if (!storedUser) {
      setError('Username not found. Please register first.');
      return;
    }
    
    const registeredUser = JSON.parse(storedUser);
    
    // Simple password verification
    if (registeredUser.password !== password) {
      setError('Incorrect password');
      return;
    }
    
    // Create user data from registered information
    const userData = {
      id: Math.floor(Math.random() * 1000),
      username,
      accountType: registeredUser.accountType,
      ...(registeredUser.accountType === 'student' && { grade: registeredUser.grade }),
      progress: registeredUser.progress || {
        completedQuizzes: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        topicProgress: {},
        quizHistory: []
      },
      linkedAccounts: registeredUser.linkedAccounts || []
    };
    
    // Call the login function from parent
    onLogin(userData);
  };

  return (
    <div className="auth-container">
      <h2 className="form-title">Login to MathWhiz</h2>
      {error && <div className="error-message">{error}</div>}
      
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
      
      <form onSubmit={handleSubmit}>
        {accountType === 'student' && (
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