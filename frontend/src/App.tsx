import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { OnboardingPage } from './pages/OnboardingPage';
import { LessonPlanPage } from './pages/LessonPlanPage';
import { TeachingClassroomPage } from './pages/TeachingClassroomPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { LearningReportPage } from './pages/LearningReportPage';
import { DashboardPage } from './pages/DashboardPage';
import { LearningPathPage } from './pages/LearningPathPage';
import { MaterialUploadPage } from './pages/MaterialUploadPage';

function AppLayout() {
  const location = useLocation();
  const isClassroom = location.pathname.startsWith('/teach/');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar />
      <div className="flex-1 flex w-full">
        {!isClassroom && <Sidebar />}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<OnboardingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/material" element={<MaterialUploadPage />} />
            <Route path="/planning" element={<LessonPlanPage />} />
            <Route path="/teach/:lessonId" element={<TeachingClassroomPage />} />
            <Route path="/assessment/:lessonId" element={<AssessmentPage />} />
            <Route path="/report/:lessonId" element={<LearningReportPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/learning-path" element={<LearningPathPage />} />
          </Routes>
        </main>
      </div>
      <footer className="border-t border-slate-200 py-5 bg-white text-center text-xs text-slate-500">
        AI Teacher Platform • Built for AI Innovation Hackathon 2026
      </footer>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
