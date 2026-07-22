📘 RecallTrainer — Interactive React‑Based Quiz Simulator
May 2026 – June 2026
RecallTrainer is a React‑based quiz simulator designed to help students practice active recall and instructors create dynamic, customizable quizzes. It features a unique hint‑based scoring system that encourages students to attempt answers before revealing hints, reinforcing stronger memory retention.
This project strengthened my skills in React fundamentals, component architecture, state management, and AI‑assisted development workflows.
🚀 Features
Dynamic Quiz Taking
Students can:
Select a quiz
Answer questions
Reveal hints if needed
See real‑time scoring updates
Hint‑Based Scoring System (Exclusive Feature)
RecallTrainer uses a two‑attempt scoring model:
Scenario
Score
Correct before hint
Full credit
Wrong before hint → correct after hint
0.5 penalty
Wrong both times
0 points

This system encourages active recall, one of the most effective learning techniques.
Instructor Quiz Creation
Instructors can:
Add questions
Define correct answers
Provide optional hints
Build quizzes dynamically through the UI
Real‑Time Feedback
Students receive:
Per‑question scoring
Final score breakdown
Clean, Responsive UI
Built with React components, hooks, and modular architecture.
🧩 Tech Stack
Frontend
React 18
JavaScript / JSX
Hooks‑based state management
CSS for styling
AI‑Assisted Development
Replit Agent used for initial scaffolding
Microsoft Copilot used for debugging and  UI refinement
Backend Note
There is a minor backend leak that does not affect functionality. The entire site renders correctly, and the leak does not interfere with quiz creation or scoring. If you scroll to the bottom of the deployed site, the entire application is visible and functional.
🎥 Demo- Video
During the demo, there is a  walk through:
Taking a Quiz
Select a quiz
Answer questions
Reveal hints
Watch scoring update live
Creating a Quiz
Add questions
Add hints
Save and test the quiz
📁 Code Structure
QuizEngine.jsx
Handles quiz logic, scoring, hint penalties, and state transitions.
CreateQuiz.jsx
Instructor interface for building quizzes dynamically.
QuestionCard.jsx
Displays questions, hint button, answer inputs, and scoring feedback.
ScoreSummary.jsx
Shows final results, hint usage, and per‑question breakdown.
App.jsx
Main router and layout.
🎯 Why I Built RecallTrainer
Most quiz apps only test correctness — not how students arrive at the answer. RecallTrainer introduces a scoring system that rewards early recall and gently penalizes hint‑based answers.
This makes it ideal for:
Students practicing for exams
Instructors building interactive learning tools
Anyone wanting a more meaningful quiz experience
🏗 Development Notes & Credibility
RecallTrainer was initially scaffolded using Replit Agent, demonstrating prompt engineering and AI‑assisted development. This project strengthened my skills in:
React component architecture
Hooks‑based state management
Modular UI design
AI‑assisted development workflows
Debugging and iterative refinement
📎 Source Code
Full source code and documentation are available in the GitHub repository.

