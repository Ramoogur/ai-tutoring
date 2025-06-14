const Register = ({ navigateTo }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [grade, setGrade] = React.useState('1');
  const [accountType, setAccountType] = React.useState('student');
  const [fullName, setFullName] = React.useState('');
  const [parentEmail, setParentEmail] = React.useState('');
  const [error, setError] = React.useState('');
  

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (accountType === 'student' && (!fullName || !parentEmail)) {
      setError('Please provide Full Name and Parent Email for student accounts');
      return;
    }

    const userData = {
      username,
      accountType,
      password,
      linkedAccounts: [],
      ...(accountType === 'student' && {
        grade: parseInt(grade),
        fullName,
        parentEmail
      })
    };

    localStorage.setItem('mathWhizRegistered_' + username, JSON.stringify(userData));

    alert('Registration successful! Please login with your new account.');
    navigateTo('login');
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

        {accountType === 'student' && (
          <div>
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
          </div>
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
