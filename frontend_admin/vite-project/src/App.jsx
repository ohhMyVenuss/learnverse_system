import { Routes, Route, Navigate } from 'react-router-dom';

// 1. Import các component bảo vệ và bố cục
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// 2. Import các trang
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EmailOtpPage from './pages/EmailOtpPage';
import SetPasswordPage from './pages/SetPasswordPage';
import ProfilePage from './pages/ProfilePage'; 
import UnauthorizedPage from './pages/UnauthorizedPage';
import BlogPage from './pages/BlogPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentCoursesPage from './pages/student/StudentCoursesPage.jsx';
import CourseDetailPage from './pages/student/CourseDetailPage.jsx';
import GoLearningPage from './pages/student/GoLearningPage.jsx';
import VideoPlayerPage from './pages/student/VideoPlayerPage.jsx';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import MyCoursesPage from './pages/instructor/MyCoursesPage';
import CreateCoursePage from './pages/instructor/CreateCoursePage';
import EditCoursePage from './pages/instructor/EditCoursePage';
import NotificationsPage from './pages/NotificationsPage';
// Quiz Pages
import GenerateQuizPage from './pages/quiz/GenerateQuizPage';
import MyQuizzesPage from './pages/quiz/MyQuizzesPage';
import QuizDetailPage from './pages/quiz/QuizDetailPage';
import QuizAttemptPage from './pages/quiz/QuizAttemptPage';
import PublicQuizzesPage from './pages/quiz/PublicQuizzesPage';
// 3. Tạo trang Dashboard giả lập (Nơi người dùng đến sau khi Login)
function DashboardPage() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-600 mt-2">Welcome back to your learning space!</p>
    </div>
  );
}


// test giả lập phân quyền admin, giange viên - ohhMyVenuss


function App() {
  return (
    <Routes>
      {/* === 4. CÁC TUYẾN ĐƯỜNG CÔNG KHAI (Public) === */}
      {/* HomePage bây giờ là công khai (Landing Page) */}
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/email-otp" element={<EmailOtpPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      <Route  path="/profile" element={<ProfilePage />}/>
      {/* Redirect /quiz to /quizzes/my-quizzes */}
      <Route path="/quiz" element={<Navigate to="/quizzes/my-quizzes" replace />} />
      <Route element={<ProtectedRoute allowedRoles={['student', 'instructor', 'admin']} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/courses" element={<StudentCoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/go-learning" element={<GoLearningPage />} />
          <Route path="/learn/:courseId/lesson/:lessonId" element={<VideoPlayerPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          {/* Quiz Routes */}
          <Route path="/quizzes/generate" element={<GenerateQuizPage />} />
          <Route path="/quizzes/my-quizzes" element={<MyQuizzesPage />} />
          <Route path="/quizzes/public" element={<PublicQuizzesPage />} />
          <Route path="/quizzes/:id" element={<QuizDetailPage />} />
          <Route path="/quizzes/:quizId/attempt/:attemptId" element={<QuizAttemptPage />} />
        </Route>
      </Route>

      {/* Khu vực Giảng viên */}
      <Route element={<ProtectedRoute allowedRoles={['instructor', 'admin']} />}>
        <Route element={<MainLayout />}>
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/courses" element={<MyCoursesPage />} />
          <Route path="/instructor/courses/create" element={<CreateCoursePage />} />
          <Route path="/instructor/courses/:id/edit" element={<EditCoursePage />} />
        </Route>
      </Route>

      {/* Khu vực Admin */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<MainLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default App;