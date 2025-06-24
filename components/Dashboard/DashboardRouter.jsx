import React from 'react';
import Dashboard from './Dashboard';
import DashboardGrade2 from './DashboardGrade2';
import DashboardGrade3 from './DashboardGrade3';

// Chooses the correct dashboard based on user.grade
const DashboardRouter = ({ user, startQuiz }) => {
  switch (user.grade) {
    case 2:
      return <DashboardGrade2 user={user} startQuiz={startQuiz} />;
    case 3:
      return <DashboardGrade3 user={user} startQuiz={startQuiz} />;
    default:
      return <Dashboard user={user} startQuiz={startQuiz} />; // Grade 1 fallback
  }
};

export default DashboardRouter;
