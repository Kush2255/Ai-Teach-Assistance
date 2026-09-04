import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Play, LayoutDashboard, Compass, FolderOpen, Bell, Sparkles } from 'lucide-react';
import { startDemoScenario } from '../../services/api';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLaunchDemo = async () => {
    try {
      const res = await startDemoScenario();
      if (res.demo_lesson_id) {
        navigate(`/teach/${res.demo_lesson_id}`);
      }
    } catch (e) {
      console.error('Failed to launch demo:', e);
    }
  };

  const DARK_PATHS = ['/', '/learning-path'];
  const DARK_PREFIXES = ['/assessment/', '/report/'];
  const isDarkTheme = DARK_PATHS.includes(location.pathname) ||
    DARK_PREFIXES.some((p) => location.pathname.startsWith(p));
  const isNewLessonActive = location.pathname === '/onboarding' || location.pathname === '/planning';
  const isDashboardActive = location.pathname === '/dashboard';
  const isLearningPathActive = location.pathname === '/learning-path';

  return (
    <header className={`sticky top-0 z-50 px-6 py-3 ${
      isDarkTheme
        ? 'bg-[#020817]/80 backdrop-blur-xl border-b border-slate-800/60'
        : 'bg-white border-b border-slate-200'
    }`}>
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className={`text-lg font-extrabold tracking-tight block leading-tight ${
              isDarkTheme ? 'text-white' : 'text-slate-900'
            }`}>
              AI TEACHER
            </span>
            <span className="block text-[11px] font-medium tracking-wide text-slate-400">
              Adaptive Educator
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-2 text-sm font-medium">
          <Link
            to="/onboarding"
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all ${
              isNewLessonActive
                ? 'text-indigo-400 bg-indigo-500/10 font-semibold'
                : isDarkTheme
                  ? 'text-slate-300 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>New Lesson</span>
          </Link>

          <Link
            to="/dashboard"
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all ${
              isDashboardActive
                ? 'text-indigo-400 bg-indigo-500/10 font-semibold'
                : isDarkTheme
                  ? 'text-slate-300 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/learning-path"
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all ${
              isLearningPathActive
                ? 'text-indigo-400 bg-indigo-500/10 font-semibold'
                : isDarkTheme
                  ? 'text-slate-300 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-4 h-4 text-slate-400" />
            <span>Learning Path</span>
          </Link>

          <Link
            to="/dashboard"
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition-all ${
              isDarkTheme
                ? 'text-slate-300 hover:text-white hover:bg-white/5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-slate-400" />
            <span>Resources</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3.5">
          <button
            onClick={handleLaunchDemo}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-xs tracking-wide cursor-pointer transition-all ${
              isDarkTheme
                ? 'gradient-button'
                : 'primary-button'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Try Hackathon Demo</span>
          </button>

          <button
            title="Notifications"
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors relative ${
              isDarkTheme
                ? 'border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className={`w-2 h-2 rounded-full bg-indigo-500 absolute top-2 right-2 ring-2 ${
              isDarkTheme ? 'ring-[#020817]' : 'ring-white'
            }`}></span>
          </button>

          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 cursor-pointer shadow-sm">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
