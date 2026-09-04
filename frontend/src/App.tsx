import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LessonPlanPage } from './pages/LessonPlanPage';
import { TeachingClassroomPage } from './pages/TeachingClassroomPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { LearningReportPage } from './pages/LearningReportPage';
import { DashboardPage } from './pages/DashboardPage';
import { LearningPathPage } from './pages/LearningPathPage';
import { MaterialUploadPage } from './pages/MaterialUploadPage';

// Pages that use the dark glass theme
const DARK_PAGES = ['/', '/learning-path'];
const DARK_PAGE_PREFIXES = ['/assessment/', '/report/'];

function isDarkPage(pathname: string): boolean {
  if (DARK_PAGES.includes(pathname)) return true;
  return DARK_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function AppLayout() {
  const location = useLocation();
  const isClassroom = location.pathname.startsWith('/teach/');
  const dark = isDarkPage(location.pathname);

  if (dark) {
    return (
      <div className="min-h-screen dark-page flex flex-col selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/assessment/:lessonId" element={<AssessmentPage />} />
            <Route path="/report/:lessonId" element={<LearningReportPage />} />
            <Route path="/learning-path" element={<LearningPathPage />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-800 py-5 text-center text-xs text-slate-600">
          AI Teacher Platform • Built for AI Innovation Hackathon 2026
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar />
      <div className="flex-1 flex w-full">
        {!isClassroom && <Sidebar />}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/material" element={<MaterialUploadPage />} />
            <Route path="/planning" element={<LessonPlanPage />} />
            <Route path="/teach/:lessonId" element={<TeachingClassroomPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
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
