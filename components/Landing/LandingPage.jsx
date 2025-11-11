import React from 'react';

const LandingPage = ({ navigateTo }) => {
  const [currentProblemIndex, setCurrentProblemIndex] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const sampleProblems = [
    {
      grade: "Grade 1",
      question: "What is 3 + 5?",
      visual: "🍎 🍎 🍎 + 🍎 🍎 🍎 🍎 🍎",
      answer: "= 8",
      icon: "🎯"
    },
    {
      grade: "Grade 1",
      question: "How many apples are there?",
      visual: "🍎 🍎 🍎 🍎 🍎 🍎",
      answer: "= 6",
      icon: "🍏"
    }
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProblemIndex((prev) => (prev + 1) % sampleProblems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background">
          <div className="gradient-blob blob-1"></div>
          <div className="gradient-blob blob-2"></div>
          <div className="gradient-blob blob-3"></div>
        </div>
        <div className="container">
          <div className="hero-grid">
            <div className={`hero-content ${isVisible ? 'visible' : ''}`}>
              <div className="hero-badge">
                <span className="badge-icon">✨</span>
                <span>Learn &amp; Count · Grade 1 Math</span>
              </div>
              <h1 className="hero-title">
                Math Made <span className="gradient-text">Magical</span> for Grade 1 Kids
              </h1>
              <p className="hero-subtitle">
                Learn &amp; Count is the playful math tutor built just for first graders—personalized lessons, adorable visuals, and instant feedback that make counting fun.
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-value">10K+</span>
                  <span className="stat-label">Happy Grade 1 Learners</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">95%</span>
                  <span className="stat-label">Mastery Boost</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">5★</span>
                  <span className="stat-label">Parent Rated</span>
                </div>
              </div>
              <div className="hero-cta">
                <button className="btn-primary" onClick={() => navigateTo('register')}>
                  <span>Start Free Trial</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="btn-secondary" onClick={() => navigateTo('login')}>
                  <span>Sign In</span>
                </button>
              </div>
            </div>
            <div className={`hero-visual ${isVisible ? 'visible' : ''}`}>
              <div className="floating-card card-1">
                <div className="card-icon">🎯</div>
                <div className="card-content">
                  <div className="card-title">Personalized</div>
                  <div className="card-subtitle">AI adapts to your pace</div>
                </div>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">🏆</div>
                <div className="card-content">
                  <div className="card-title">Gamified</div>
                  <div className="card-subtitle">Fun & engaging</div>
                </div>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">📊</div>
                <div className="card-content">
                  <div className="card-title">Track Progress</div>
                  <div className="card-subtitle">Real-time parent insights</div>
                </div>
              </div>
              <div className="hero-illustration">
                <div className="math-circle circle-1">
                  <span>+</span>
                </div>
                <div className="math-circle circle-2">
                  <span>-</span>
                </div>
                <div className="math-circle circle-3">
                  <span>×</span>
                </div>
                <div className="math-circle circle-4">
                  <span>÷</span>
                </div>
                <div className="center-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="demo-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">See Math Come Alive</h2>
            <p className="section-subtitle">Interactive grade 1 problems that adapt to your child's learning style</p>
          </div>
          <div className="demo-showcase">
            <div className="demo-problem">
              <div className="problem-badge">{sampleProblems[currentProblemIndex].grade}</div>
              <div className="problem-icon">{sampleProblems[currentProblemIndex].icon}</div>
              <div className="problem-question">{sampleProblems[currentProblemIndex].question}</div>
              <div className="problem-visual">{sampleProblems[currentProblemIndex].visual}</div>
              <div className="problem-answer">{sampleProblems[currentProblemIndex].answer}</div>
              <div className="problem-progress">
                {sampleProblems.map((_, index) => (
                  <div 
                    key={index} 
                    className={`progress-dot ${index === currentProblemIndex ? 'active' : ''}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Grade 1 Families Love Learn &amp; Count</h2>
            <p className="section-subtitle">Everything your first grader needs for a joyful math journey</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🧠</div>
              </div>
              <h3 className="feature-title">AI-Powered Tutoring</h3>
              <p className="feature-description">
                Our intelligent AI adapts to your first grader's learning pace, celebrating wins and spotting tricky spots instantly.
              </p>
              <div className="feature-tags">
                <span className="tag">Adaptive</span>
                <span className="tag">Smart</span>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">📊</div>
              </div>
              <h3 className="feature-title">Progress Tracking</h3>
              <p className="feature-description">
                Follow every milestone with friendly dashboards that highlight counting, addition, and number sense growth.
              </p>
              <div className="feature-tags">
                <span className="tag">Analytics</span>
                <span className="tag">Insights</span>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🎮</div>
              </div>
              <h3 className="feature-title">Gamified Learning</h3>
              <p className="feature-description">
                Turn math practice into an adventure with rewards, achievements, and fun grade 1 challenges that keep kids smiling.
              </p>
              <div className="feature-tags">
                <span className="tag">Fun</span>
                <span className="tag">Engaging</span>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">👨‍👩‍👧</div>
              </div>
              <h3 className="feature-title">Parent Dashboard</h3>
              <p className="feature-description">
                Stay in the loop with clear, easy-to-read reports built especially for first grade progress.
              </p>
              <div className="feature-tags">
                <span className="tag">Connected</span>
                <span className="tag">Informed</span>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🌟</div>
              </div>
              <h3 className="feature-title">Curriculum Aligned</h3>
              <p className="feature-description">
                Content that matches grade 1 standards, ensuring your child masters counting, shapes, time, and more.
              </p>
              <div className="feature-tags">
                <span className="tag">Standards</span>
                <span className="tag">Quality</span>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🔒</div>
              </div>
              <h3 className="feature-title">Safe & Secure</h3>
              <p className="feature-description">
                Child-safe environment with no ads, robust privacy protection, and age-appropriate content only.
              </p>
              <div className="feature-tags">
                <span className="tag">Private</span>
                <span className="tag">Protected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Parents Are Saying</h2>
            <p className="section-subtitle">Join thousands of satisfied grade 1 families</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <span>⭐⭐⭐⭐⭐</span>
              </div>
              <p className="testimonial-text">
                "My daughter's confidence in math has skyrocketed! She used to struggle with basic addition, now she's asking for more apples to count."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👩</div>
                <div className="author-info">
                  <div className="author-name">Sarah M.</div>
                  <div className="author-role">Parent of 1st grader</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <span>⭐⭐⭐⭐⭐</span>
              </div>
              <p className="testimonial-text">
                "The AI tutor is incredible! It knows exactly when my son needs a hint or more practice. His counting skills have improved dramatically."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👨</div>
                <div className="author-info">
                  <div className="author-name">Michael R.</div>
                  <div className="author-role">Parent of 1st grader</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">
                <span>⭐⭐⭐⭐⭐</span>
              </div>
              <p className="testimonial-text">
                "Finally, a math app my daughter actually enjoys! The gamification keeps her motivated, and I love the detailed progress reports made for grade 1."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👩</div>
                <div className="author-info">
                  <div className="author-name">Jennifer L.</div>
                  <div className="author-role">Parent of 1st grader</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="cta-icon">🚀</div>
            <h2 className="cta-title">Ready to Transform Your Grade 1 Math Journey?</h2>
            <p className="cta-subtitle">Join 10,000+ families who've discovered the joy of learning math with Learn &amp; Count</p>
            <div className="cta-buttons">
              <button className="btn-primary large" onClick={() => navigateTo('register')}>
                <span>Start Your Free Trial</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p className="cta-note">✓ No credit card required  ✓ 14-day free trial  ✓ Cancel anytime</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">Learn<span>&amp; Count</span></div>
              <p className="footer-tagline">Making math magical for grade 1 learners</p>
            </div>
            <div className="footer-bottom">
              <p className="footer-copyright">© 2025 Learn &amp; Count · AI Math Tutor for Grade 1</p>
              <p className="footer-love">Made with <span>❤️</span> for curious minds</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;