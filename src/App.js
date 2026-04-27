import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

import ProtectedRoute from "./routes/ProtectedRoute";

import StudentDashboard from "./pages/Student/StudentDashboard";
import MyQuizzes from "./pages/Student/MyQuizzes";
import StudentResults from "./pages/Student/StudentResults";
import StudentProfile from "./pages/Student/Profile/StudentProfile";
import JoinQuizPage from "./pages/Student/JoinQuizPage";
import GlobalLeaderboard from "./pages/GlobalLeaderboard/GlobalLeaderboard";

import LearningHub  from "./pages/Learn/LearningHub";
import TopicDetail  from "./pages/Learn/TopicDetail";
import TopicQuiz    from "./pages/Learn/TopicQuiz";
import QuizAnalysis from "./pages/Learn/QuizAnalysis";

import QuizAttempt from "./pages/QuizAttempt/QuizAttempt";
import QuizResult from "./pages/QuizResult/QuizResult";
import Leaderboard from "./pages/Student/Leaderboard/Leaderboard";

import DashboardLayout from "./layouts/DashboardLayout";
import TeacherLayout from "./layouts/TeacherLayout";

import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import TeacherQuizzes from "./pages/Teacher/TeacherQuizzes";
import CreateQuiz from "./pages/Teacher/CreateQuiz";
import AddQuestions from "./pages/Teacher/AddQuestions";
import PreviewQuiz from "./pages/Teacher/PreviewQuiz";
import EditQuiz from "./pages/Teacher/EditQuiz";
import EditQuestions from "./pages/Teacher/EditQuestions";
import TeacherReports from "./pages/Teacher/TeacherReports";
import TeacherAnalytics from "./pages/Teacher/TeacherAnalytics";
import TeacherProfile from "./pages/Teacher/TeacherProfile";
import TeacherLeaderboard from "./pages/Teacher/TeacherLeaderboard";
import TeacherSettings from "./pages/Teacher/TeacherSettings";
import TeacherCategory from "./pages/Teacher/TeacherCategory";
import ManageLearn from "./pages/Teacher/ManageLearn";
import CreateLearnTopic from "./pages/Teacher/CreateLearnTopic";
import ViewLearnTopic from "./pages/Teacher/ViewLearnTopic";
import EditLearnTopic from "./pages/Teacher/EditLearnTopic";

import ScrollToTop from "./components/ScrollToTop";
import Quizzes from "./pages/Quizzes";
import PublicLeaderboard from "./pages/PublicLeaderboard";
import Contact from "./pages/Contact";
import Home from "./pages/Home/Home";

import { Toaster } from "react-hot-toast";

function App() {

return (

<AuthProvider>

<BrowserRouter>

<ScrollToTop />

{/* ✅ TOASTER (correct place) */}
<Toaster
  position="top-center"
  toastOptions={{
    duration: 2000,
    style: {
      background: "#111827",
      color: "#fff",
      borderRadius: "10px",
      padding: "12px 16px",
      fontSize: "14px"
    },
    success: {
      style: { background: "#16a34a" }
    },
    error: {
      style: { background: "#dc2626" }
    }
  }}
/>

<Navbar />

<Routes>

{/* HOME */}
<Route path="/" element={<Home />} />


{/* PUBLIC NAV PAGES */}
<Route path="/quizzes" element={<Quizzes />}           /> 
<Route path="/public-leaderboard" element={<PublicLeaderboard />} />  
<Route path="/contact" element={<Contact />}           /> 

{/* AUTH */}
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />

{/* STUDENT DASHBOARD */}
<Route
element={
<ProtectedRoute>
<DashboardLayout />
</ProtectedRoute>
}
>
<Route path="/student/dashboard" element={<StudentDashboard />} />
<Route path="/student/quizzes" element={<MyQuizzes />} />
<Route path="/student/results" element={<StudentResults />} />
<Route path="/profile" element={<StudentProfile />} />
<Route path="/leaderboard" element={<GlobalLeaderboard />} />

<Route path="/student/learn"                    element={<LearningHub />} />
<Route path="/student/learn/:topicId"           element={<TopicDetail />} />
<Route path="/student/learn/:topicId/quiz"      element={<TopicQuiz />} />
<Route path="/student/learn/:topicId/result"    element={<QuizAnalysis />} />
</Route>

{/* TEACHER DASHBOARD */}
<Route
element={
<ProtectedRoute>
<TeacherLayout />
</ProtectedRoute>
}
>
<Route path="/teacher/dashboard" element={<TeacherDashboard />} />
<Route path="/teacher/quizzes" element={<TeacherQuizzes />} />
<Route path="/teacher/create" element={<CreateQuiz />} />
<Route path="/teacher/add-questions/:quizId" element={<AddQuestions />} />
<Route path="/teacher/preview/:quizId" element={<PreviewQuiz />} />
<Route path="/teacher/edit-quiz/:id" element={<EditQuiz />} />
<Route path="/teacher/edit-questions/:quizId" element={<EditQuestions />} />
<Route path="/teacher/reports" element={<TeacherReports />} />
<Route path="/teacher/analytics" element={<TeacherAnalytics/>} />
<Route path="/teacher/profile" element={<TeacherProfile />} />
<Route path="/teacher/leaderboard" element={<TeacherLeaderboard/>}/>
<Route path="/teacher/settings" element={<TeacherSettings/>}/>
<Route path="/teacher/categories" element={<TeacherCategory />} />
<Route path="/teacher/learn" element={<ManageLearn />} />
<Route path="/teacher/learn/create" element={<CreateLearnTopic />} />
<Route path="/teacher/learn/:id" element={<ViewLearnTopic />} />
<Route path="/teacher/learn/:id/edit" element={<EditLearnTopic />} />
</Route>

{/* QUIZ ROUTES */}
<Route path="/quiz/:quizId" element={<QuizAttempt />} />
<Route path="/quiz-result/:quizId" element={<QuizResult />} />
<Route path="/leaderboard/:quizId" element={<Leaderboard />} />
<Route path="/join/:code" element={<JoinQuizPage />} />

</Routes>

<Footer />

</BrowserRouter>

</AuthProvider>

);

}

export default App;


