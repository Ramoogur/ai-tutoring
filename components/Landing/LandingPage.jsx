import React from 'react';

const LandingPage = ({ navigateTo }) => {
  const [currentProblemIndex, setCurrentProblemIndex] = React.useState(0);
  
  const sampleProblems = [
    {
      grade: "Grade 1",
      question: "What is 3 + 5?",
      visual: "🍎🍎🍎 + 🍎🍎🍎🍎🍎",
      answer: "= 8",
      color: "var(--accent-green)"
    },
    {
      grade: "Grade 2", 
      question: "What is 12 - 7?",
      visual: "1️⃣2️⃣ - 7️⃣",
      answer: "= 5",
      color: "var(--primary-color)"
    },
    {
      grade: "Grade 3",
      question: "What is 5 × 6?", 
      visual: "5️⃣ × 6️⃣",
      answer: "= 30",
      color: "var(--accent-pink)"
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
      <div className="container">
        <div className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to Math<span>Whiz</span></h1>
            <p className="hero-subtitle">🌟 The AI-powered math tutor for grades 1-3 🌟</p>
            <div className="hero-cta">
              <button className="hero-button" onClick={() => navigateTo('login')}>
                🚀 Login
              </button>
              <button className="hero-button secondary" onClick={() => navigateTo('register')}>
                ✨ Register
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="math-symbols">
              <div className="symbol">➕</div>
              <div className="symbol">➖</div>
              <div className="symbol">✖️</div>
              <div className="symbol">➗</div>
              <div className="symbol">🔢</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container">
        <div className="features-section">
          <h2 className="section-title">Why Choose MathWhiz?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>AI-Powered Learning</h3>
              <p>Our AI tutor adapts to your child's learning style and pace.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Track Progress</h3>
              <p>Monitor your child's improvement with detailed performance stats.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <h3>Fun Interactive Quizzes</h3>
              <p>Learning math becomes fun with our engaging quiz format.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Achievement System</h3>
              <p>Keep motivated with rewards for completing challenges.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sample Problems Section */}
      <div className="sample-section">
        <div className="container">
          <h2 className="section-title">Sample Math Problems</h2>
          <div className="sample-grid">
            {sampleProblems.map((problem, index) => (
              <div 
                key={index}
                className={`sample-card ${index === currentProblemIndex ? 'active' : ''}`}
                style={{
                  transform: index === currentProblemIndex ? 'scale(1.05)' : 'scale(1)',
                  opacity: index === currentProblemIndex ? 1 : 0.7
                }}
              >
                <div className="grade-label">{problem.grade}</div>
                <div className="sample-question">{problem.question}</div>
                <div className="sample-visual">
                  {problem.visual.split(' ').map((part, i) => (
                    <span key={i} className="emoji" style={{animationDelay: `${i * 0.1}s`}}>
                      {part}
                    </span>
                  ))}
                  <span className="answer" style={{color: problem.color, fontWeight: 'bold'}}>
                    {problem.answer}
                  </span>
                </div>
                <div className="sample-progress">
                  <div className="progress-dots">
                    {sampleProblems.map((_, i) => (
                      <div 
                        key={i} 
                        className={`dot ${i === currentProblemIndex ? 'active' : ''}`}
                        style={{backgroundColor: i === currentProblemIndex ? problem.color : '#e2e8f0'}}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Testimonials */}
      <div className="container">
        <div className="testimonials-section">
          <h2 className="section-title">What Parents Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">"My child improved their math skills within just a few weeks of using MathWhiz!"</p>
              <div className="testimonial-author">- Parent of a 2nd grader</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">"The interactive approach makes learning math fun. My son actually asks to practice math now!"</p>
              <div className="testimonial-author">- Parent of a 1st grader</div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">"The progress tracking helps me understand exactly where my daughter needs more support."</p>
              <div className="testimonial-author">- Parent of a 3rd grader</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to make math fun? 🎉</h2>
            <p className="cta-subtitle">Join thousands of students who love learning with MathWhiz</p>
            <div className="cta-stats">
              <div className="stat">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Happy Students</span>
              </div>
              <div className="stat">
                <span className="stat-number">95%</span>
                <span className="stat-label">Improvement Rate</span>
              </div>
              <div className="stat">
                <span className="stat-number">5⭐</span>
                <span className="stat-label">Parent Rating</span>
              </div>
            </div>
            <button className="cta-button" onClick={() => navigateTo('register')}>
              🎯 Get Started Now
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <p>© 2023 MathWhiz - AI Math Tutor for Grades 1-3</p>
            <p>Made with <span className="footer-love">❤️</span> for young learners</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;