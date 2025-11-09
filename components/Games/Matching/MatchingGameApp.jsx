import React, { useState } from 'react';
import TopicSelectionScreen from './TopicSelectionScreen';
import MatchingGame from './MatchingGame';
import { updateStudentTopicStats } from './matchingGameService';

const MatchingGameApp = ({ studentId, navigateTo }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setIsPlaying(true);
  };

  const handleBackToHome = () => {
    if (navigateTo) {
      navigateTo('dashboard');
    }
  };

  const handleGameComplete = async (results) => {
    // Update student topic statistics (non-blocking)
    try {
      await updateStudentTopicStats(studentId, selectedTopic.id, {
        correct_matches: results.correctMatches,
        total_pairs: results.correctMatches + results.incorrectAttempts,
        accuracy_percentage: results.accuracy
      });
    } catch (error) {
      console.error('Error updating stats:', error);
      // Continue anyway - don't block game completion
    }

    // Reset to topic selection
    setIsPlaying(false);
    setSelectedTopic(null);
  };

  const handleBackToTopics = () => {
    setIsPlaying(false);
    setSelectedTopic(null);
  };

  if (isPlaying && selectedTopic) {
    return (
      <MatchingGame
        topic={selectedTopic}
        studentId={studentId}
        onComplete={handleGameComplete}
        onBack={handleBackToTopics}
      />
    );
  }

  return (
    <TopicSelectionScreen
      onTopicSelect={handleTopicSelect}
      studentId={studentId}
      onBackToHome={handleBackToHome}
    />
  );
};

export default MatchingGameApp;