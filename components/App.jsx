import React, { useState, useEffect } from 'react';
import LandingPage from './Landing/LandingPage';
import Login from './Auth/Login';
import Register from './Auth/Register';
import DashboardRouter from './Dashboard/DashboardRouter';
import ParentDashboard from './Parent/ParentDashboard';
import Quiz from './Quiz/Quiz';
import { MathJourney } from './Dashboard/Progress';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [quizTopic, setQuizTopic] = useState(null);
  const [progressData, setProgressData] = useState({});

  // Handler to show Math Journey page with real data
  const handleNavigateToProgress = async () => {
    try {
      // Import the progress service
      const { getStudentProgressData } = await import('./Dashboard/Progress/progressService');
      
      // Get student ID from user object (assuming it has an id field)
      const studentId = user.id;
      
      // Fetch real progress data from database
      const realProgressData = await getStudentProgressData(studentId);
      
      setProgressData(realProgressData);
      setCurrentPage('math-journey');
    } catch (error) {
      console.error('Error loading progress data:', error);
      // Fallback to mock data if there's an error
      setProgressData({
        'Numbers & Counting': { completed: 0, total: 15, percent: 0 },
        'Addition (within 10)': { completed: 0, total: 15, percent: 0 },
        'Patterns': { completed: 0, total: 15, percent: 0 },
        'Shapes & Colours': { completed: 0, total: 15, percent: 0 },
        'Measurement & Comparison': { completed: 0, total: 15, percent: 0 },
        'Time': { completed: 0, total: 15, percent: 0 },
        'Money': { completed: 0, total: 15, percent: 0 },
        'Ordinal Numbers': { completed: 0, total: 15, percent: 0 },
      });
      setCurrentPage('math-journey');
    }
  };

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('learnCountUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('learnCountUser', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('learnCountUser');
    setCurrentPage('login');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  const startQuiz = (topic) => {
    setQuizTopic(topic);
    setCurrentPage('quiz');
  };

  const renderNavigation = () => {
    // Hide navbar for quiz/game pages (they have their own navigation)
    if (!isLoggedIn || currentPage === 'quiz') return null;
    
    return (
      <nav>
        <div className="container nav-container">
          <a href="#" className="logo" onClick={() => navigateTo('dashboard')}>Learn<span>&Count</span></a>
          <div className="nav-links">
            <a href="#" onClick={() => navigateTo('dashboard')}>Home</a>
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
          : <DashboardRouter user={user} startQuiz={startQuiz} navigateToProgress={handleNavigateToProgress} />;
      case 'quiz':
        return <Quiz topic={quizTopic} user={user} navigateTo={navigateTo} />;
      case 'math-journey':
        return <MathJourney progressData={progressData} onBack={() => setCurrentPage('dashboard')} studentId={user.id} />;
      default:
        return <LandingPage navigateTo={navigateTo} />;
    }
  };
  return (
    <>
      {renderNavigation()}
      {currentPage === 'quiz' ? (
        // Quiz/Games render without container for full viewport
        renderContent()
      ) : (
        <div className="container">
          {renderContent()}
        </div>
      )}
    </>
  );
};

export default App;