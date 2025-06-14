const LandingPage = ({ navigateTo }) => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Math<span>Whiz</span></h1>
          <p className="hero-subtitle">The AI-powered math tutor for grades 1-3</p>
          <div className="hero-cta">
            <button className="hero-button" onClick={() => navigateTo('login')}>Login</button>
            <button className="hero-button secondary" onClick={() => navigateTo('register')}>Register</button>
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

      {/* Features Section */}
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

      {/* Sample Problems Section */}
      <div className="sample-section">
        <h2 className="section-title">Sample Math Problems</h2>
        <div className="samples-container">
          <div className="sample-problem">
            <div className="problem-grade">Grade 1</div>
            <div className="problem-content">
              <p>What is 3 + 5?</p>
              <p className="problem-visual">🍎🍎🍎 + 🍎🍎🍎🍎🍎 = ?</p>
            </div>
          </div>
          <div className="sample-problem">
            <div className="problem-grade">Grade 2</div>
            <div className="problem-content">
              <p>What is 12 - 7?</p>
              <p className="problem-visual">1️⃣2️⃣ - 7️⃣ = ?</p>
            </div>
          </div>
          <div className="sample-problem">
            <div className="problem-grade">Grade 3</div>
            <div className="problem-content">
              <p>What is 5 × 6?</p>
              <p className="problem-visual">5️⃣ × 6️⃣ = ?</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="testimonials-section">
        <h2 className="section-title">What Parents Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"My child improved their math skills within just a few weeks of using MathWhiz!"</p>
            <div className="testimonial-author">- Parent of a 2nd grader</div>
          </div>
          <div className="testimonial-card">
            <p>"The interactive approach makes learning math fun. My son actually asks to practice math now!"</p>
            <div className="testimonial-author">- Parent of a 1st grader</div>
          </div>
          <div className="testimonial-card">
            <p>"The progress tracking helps me understand exactly where my daughter needs more support."</p>
            <div className="testimonial-author">- Parent of a 3rd grader</div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="cta-section">
        <h2>Ready to make math fun?</h2>
        <p>Join thousands of students who love learning with MathWhiz</p>
        <button className="cta-button" onClick={() => navigateTo('register')}>Get Started Now</button>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2023 MathWhiz - AI Math Tutor for Grades 1-3</p>
        <p>Made with ❤️ for young learners</p>
      </footer>
    </div>
  );
};