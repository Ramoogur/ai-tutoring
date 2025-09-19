import React from 'react';
import Dashboard from './Dashboard';

// Always uses Grade 1 Dashboard for all users
const DashboardRouter = ({ user, startQuiz, navigateToProgress }) => {
  return <Dashboard user={user} startQuiz={startQuiz} navigateToProgress={navigateToProgress} />;
};

export default DashboardRouter;
