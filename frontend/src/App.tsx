import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { MaterialUploadPage } from './pages/MaterialUploadPage';
import { LessonPlanPage } from './pages/LessonPlanPage';
import { TeachingClassroomPage } from './pages/TeachingClassroomPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { LearningReportPage } from './pages/LearningReportPage';
import { DashboardPage } from './pages/DashboardPage';
import { LearningPathPage } from './pages/LearningPathPage';

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
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
        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
          AI Teacher Platform • Built for AI Innovation Hackathon 2026
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
