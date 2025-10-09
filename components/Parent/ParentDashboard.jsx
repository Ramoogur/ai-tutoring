import React, { useState, useEffect } from 'react';

const ParentDashboard = ({ user, navigateTo }) => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [studentUsername, setStudentUsername] = useState('');
  const [error, setError] = useState('');

  // Load linked students when component mounts
  useEffect(() => {
    loadLinkedStudents();
  }, []);

  const loadLinkedStudents = () => {
    const linkedStudents = [];
    
    // If user has linked accounts, load their data
    if (user.linkedAccounts && user.linkedAccounts.length > 0) {
      user.linkedAccounts.forEach(username => {
        const studentData = localStorage.getItem('learnCountRegistered_' + username);
        if (studentData) {
          const student = JSON.parse(studentData);
          linkedStudents.push({
            username: student.username,
            grade: student.grade,
            progress: student.progress || {
              completedQuizzes: 0,
              correctAnswers: 0,
              totalQuestions: 0,
              topicProgress: {},
              quizHistory: []
            }
          });
        }
      });
    }
    
    setStudents(linkedStudents);
    if (linkedStudents.length > 0) {
      setSelectedStudent(linkedStudents[0]);
    }
  };

  const handleLinkStudent = () => {
    setError('');
    
    // Check if student exists
    const studentData = localStorage.getItem('learnCountRegistered_' + studentUsername);
    if (!studentData) {
      setError('Student account not found');
      return;
    }
    
    const student = JSON.parse(studentData);
    
    // Check if it's a student account
    if (student.accountType !== 'student') {
      setError('The account is not a student account');
      return;
    }
    
    // Check if already linked
    if (user.linkedAccounts.includes(studentUsername)) {
      setError('This student is already linked to your account');
      return;
    }
    
    // Link the student
    const updatedUser = { ...user };
    updatedUser.linkedAccounts.push(studentUsername);
    
    // Update localStorage
    localStorage.setItem('learnCountUser', JSON.stringify(updatedUser));
    localStorage.setItem('learnCountRegistered_' + user.username, JSON.stringify({
      ...JSON.parse(localStorage.getItem('learnCountRegistered_' + user.username)),
      linkedAccounts: updatedUser.linkedAccounts
    }));
    
    // Reload the students
    loadLinkedStudents();
    setShowLinkForm(false);
    setStudentUsername('');
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'var(--success-color)';
    if (percentage >= 50) return 'var(--secondary-color)';
    return 'var(--primary-color)';
  };

  const renderStudentSelector = () => {
    return (
      <div className="student-selector">
        <h3>Your Students</h3>
        <div className="student-list">
          {students.map(student => (
            <div 
              key={student.username}
              className={`student-item ${selectedStudent && selectedStudent.username === student.username ? 'active' : ''}`}
              onClick={() => setSelectedStudent(student)}
            >
              <div className="student-avatar">👨‍🎓</div>
              <div className="student-info">
                <div className="student-name">{student.username}</div>
                <div className="student-grade">Grade {student.grade}</div>
              </div>
            </div>
          ))}
          
          <button 
            className="add-student-btn" 
            onClick={() => setShowLinkForm(true)}
          >
            + Add Student
          </button>
        </div>
      </div>
    );
  };

  const renderLinkForm = () => {
    return (
      <div className="link-student-form">
        <h3>Link Student Account</h3>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="studentUsername">Student Username</label>
          <input
            type="text"
            id="studentUsername"
            value={studentUsername}
            onChange={(e) => setStudentUsername(e.target.value)}
            placeholder="Enter student username"
          />
        </div>
        <div className="link-actions">
          <button className="btn secondary" onClick={() => setShowLinkForm(false)}>
            Cancel
          </button>
          <button className="btn" onClick={handleLinkStudent}>
            Link Student
          </button>
        </div>
      </div>
    );
  };

  const renderPerformanceOverview = () => {
    if (!selectedStudent) return null;
    
    const { progress } = selectedStudent;
    const completionRate = progress.totalQuestions > 0
      ? Math.round((progress.completedQuizzes / 6) * 100) // 6 is the number of topics
      : 0;
    
    const accuracy = progress.totalQuestions > 0
      ? Math.round((progress.correctAnswers / progress.totalQuestions) * 100)
      : 0;

    return (
      <div className="performance-overview">
        <h3>Performance Overview</h3>
        <div className="performance-stats">
          <div className="performance-stat">
            <div className="stat-label">Completion Rate</div>
            <div className="stat-progress">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${completionRate}%`, 
                  backgroundColor: getProgressColor(completionRate) 
                }}
              ></div>
            </div>
            <div className="stat-value">{completionRate}%</div>
          </div>
          
          <div className="performance-stat">
            <div className="stat-label">Accuracy</div>
            <div className="stat-progress">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${accuracy}%`, 
                  backgroundColor: getProgressColor(accuracy) 
                }}
              ></div>
            </div>
            <div className="stat-value">{accuracy}%</div>
          </div>
        </div>
      </div>
    );
  };

  const renderTopicBreakdown = () => {
    if (!selectedStudent) return null;
    
    // Sample topics (should match the ones in Dashboard.js)
    const topics = [
      { id: 1, name: 'Addition', icon: '➕' },
      { id: 2, name: 'Subtraction', icon: '➖' },
      { id: 3, name: 'Counting', icon: '🔢' },
      { id: 4, name: 'Shapes', icon: '📐' },
      { id: 5, name: 'Time', icon: '🕒' },
      { id: 6, name: 'Measurement', icon: '📏' },
    ];
    
    return (
      <div className="topic-breakdown">
        <h3>Topic Breakdown</h3>
        <div className="topics-grid">
          {topics.map(topic => {
            const topicProgress = selectedStudent.progress.topicProgress[topic.name] || {
              completed: false,
              correctAnswers: 0,
              totalQuestions: 0
            };
            
            const topicAccuracy = topicProgress.totalQuestions > 0
              ? Math.round((topicProgress.correctAnswers / topicProgress.totalQuestions) * 100)
              : 0;
            
            return (
              <div key={topic.id} className="topic-progress-card">
                <div className="topic-icon">{topic.icon}</div>
                <div className="topic-name">{topic.name}</div>
                <div className="topic-status">
                  {topicProgress.completed ? (
                    <span className="completed">Completed</span>
                  ) : (
                    <span className="not-started">Not Started</span>
                  )}
                </div>
                {topicProgress.totalQuestions > 0 && (
                  <div className="topic-accuracy">
                    <div className="accuracy-label">Accuracy:</div>
                    <div className="accuracy-value">{topicAccuracy}%</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRecentActivity = () => {
    if (!selectedStudent || !selectedStudent.progress.quizHistory || selectedStudent.progress.quizHistory.length === 0) {
      return (
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="no-activity">No activity recorded yet</div>
        </div>
      );
    }
    
    return (
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {selectedStudent.progress.quizHistory.slice(0, 5).map((quiz, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-details">
                <div className="activity-title">{quiz.topic} Quiz (Level {quiz.difficulty})</div>
                <div className="activity-result">
                  Score: {quiz.score}/{quiz.totalQuestions} ({Math.round((quiz.score / quiz.totalQuestions) * 100)}%)
                </div>
                <div className="activity-date">{quiz.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="parent-dashboard">
      <div className="welcome-banner parent-banner">
        <h1>Parent Dashboard</h1>
        <p>Monitor your child's progress and performance</p>
      </div>
      
      {showLinkForm ? (
        renderLinkForm()
      ) : (
        <div className="dashboard-content">
          {students.length === 0 ? (
            <div className="no-students">
              <h2>No students linked yet</h2>
              <p>Link your child's account to monitor their progress</p>
              <button className="btn" onClick={() => setShowLinkForm(true)}>
                Link Student Account
              </button>
            </div>
          ) : (
            <div className="student-monitoring">
              {renderStudentSelector()}
              
              <div className="student-details">
                {selectedStudent && (
                  <div>
                    <div className="student-header">
                      <h2>{selectedStudent.username}'s Progress</h2>
                      <div className="student-grade-badge">Grade {selectedStudent.grade}</div>
                    </div>
                    
                    <div className="progress-panels">
                      {renderPerformanceOverview()}
                      {renderTopicBreakdown()}
                      {renderRecentActivity()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;