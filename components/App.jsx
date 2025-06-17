import React, { useState, useEffect } from 'react';
import LandingPage from './Landing/LandingPage';
import Login from './Auth/Login';
import Register from './Auth/Register';
import Dashboard from './Dashboard/Dashboard';
import ParentDashboard from './Parent/ParentDashboard';
import Quiz from './Quiz/Quiz';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [quizTopic, setQuizTopic] = useState(null);
  const [quizDifficulty, setQuizDifficulty] = useState(null);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('mathWhizUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('mathWhizUser', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('mathWhizUser');
    setCurrentPage('login');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const startQuiz = (topic, difficulty) => {
    setQuizTopic(topic);
    setQuizDifficulty(difficulty);
    setCurrentPage('quiz');
  };

  const renderNavigation = () => {
    if (!isLoggedIn) return null;
    
    return (
      <nav>
        <div className="container nav-container">
          <a href="#" className="logo" onClick={() => navigateTo('dashboard')}>Math<span>Whiz</span></a>
          <div className="nav-links">
            <a href="#" onClick={() => navigateTo('dashboard')}>Dashboard</a>
            <a href="#" onClick={handleLogout}>Logout</a>
          </div>
        </div>
      </nav>
    );
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage navigateTo={navigateTo} />;
      case 'login':
        return <Login onLogin={handleLogin} navigateTo={navigateTo} />;
      case 'register':
        return <Register navigateTo={navigateTo} />;
      case 'dashboard':
        return user.accountType === 'parent' 
          ? <ParentDashboard user={user} navigateTo={navigateTo} />
          : <Dashboard user={user} startQuiz={startQuiz} />;
      case 'quiz':
        return <Quiz topic={quizTopic} difficulty={quizDifficulty} user={user} navigateTo={navigateTo} />;
      default:
        return <LandingPage navigateTo={navigateTo} />;
    }
  };

  return (
    <>
      {renderNavigation()}
      <div className="container">
        {renderContent()}
      </div>
    </>
  );
};

export default App;