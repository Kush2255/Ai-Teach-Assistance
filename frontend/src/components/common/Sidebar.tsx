import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, LayoutDashboard, Compass, Calendar, BarChart2, FolderClosed, Sparkles } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const isNewLesson = location.pathname === '/' || location.pathname === '/onboarding' || location.pathname === '/planning';
  const isDashboard = location.pathname === '/dashboard';
  const isLearningPath = location.pathname === '/learning-path';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between hidden lg:flex shrink-0 min-h-[calc(100vh-61px)]">
      {/* Top Navigation Menu */}
      <div className="space-y-1.5">
        <Link
          to="/onboarding"
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isNewLesson
              ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isNewLesson ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>New Lesson</span>
        </Link>

        <Link
          to="/dashboard"
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isDashboard
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-slate-400" />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/learning-path"
          className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isLearningPath
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4 text-slate-400" />
          <span>Learning Path</span>
        </Link>

        <Link
          to="/dashboard"
          className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Calendar</span>
        </Link>

        <Link
          to="/dashboard"
          className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <BarChart2 className="w-4 h-4 text-slate-400" />
          <span>Progress</span>
        </Link>

        <Link
          to="/dashboard"
          className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <FolderClosed className="w-4 h-4 text-slate-400" />
          <span>Resources</span>
        </Link>
      </div>

      {/* Upgrade to Pro Card */}
      <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/60 border border-indigo-100 rounded-2xl p-4 space-y-3">
        <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </div>
          <span>Upgrade to Pro</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Unlock unlimited lessons, advanced AI models & more.
        </p>
        <button
          onClick={() => alert("Pro Plan upgrade portal")}
          className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-500/20 transition-all"
        >
          Upgrade Now
        </button>
      </div>
    </aside>
  );
};
