# Learn&Count Web Application

## Project Overview
Learn&Count is a web application designed to help students practice math with interactive quizzes. The application has support for both student and parent accounts, with a dashboard for tracking progress.

## Project Structure
- `index.html` - Main entry point
- `css/style.css` - Styling for the application
- `js/` - JavaScript files
  - `components/` - React-like component structure
    - `App.js` - Main application component
    - `Auth/` - Authentication components (Login.js, Register.js)
    - `Dashboard/` - Dashboard components
    - `Landing/` - Landing page components
    - `Parent/` - Parent-specific components
    - `Quiz/` - Quiz components
  - `data/` - Contains quiz questions and other data
  - `index.js` - JavaScript entry point

## Key Features
- User authentication (login/register) with different account types (student/parent)
- Interactive math quizzes for different grade levels
- Progress tracking for students
- Parent dashboard for monitoring linked student accounts

## Technical Implementation
- The application uses a component-based architecture
- Local storage is used for data persistence (user accounts, quiz progress)
- No backend or external dependencies are required
- Account types include 'student' and 'parent' with different views and functionality

## Special Requirements
- Login and registration forms should maintain consistent UI between components
- Account type selector should be present in both Login and Register components
- Parent accounts have additional email field requirements