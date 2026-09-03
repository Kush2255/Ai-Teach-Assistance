import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Play, LayoutDashboard, Compass, BookOpen } from 'lucide-react';
import { startDemoScenario } from '../../services/api';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

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

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center space-x-1.5">
              <span>AI</span>
              <span className="gradient-text">TEACHER</span>
            </span>
            <span className="block text-[10px] tracking-wider uppercase text-slate-400 font-medium">Adaptive Educator</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
          <Link to="/onboarding" className="hover:text-blue-400 transition-colors flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>New Lesson</span>
          </Link>
          <Link to="/dashboard" className="hover:text-blue-400 transition-colors flex items-center space-x-1.5">
            <LayoutDashboard className="w-4 h-4 text-slate-400" />
            <span>Dashboard</span>
          </Link>
          <Link to="/learning-path" className="hover:text-blue-400 transition-colors flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-slate-400" />
            <span>Learning Path</span>
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleLaunchDemo}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl gradient-button font-semibold text-xs tracking-wide shadow-md"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Try Hackathon Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
