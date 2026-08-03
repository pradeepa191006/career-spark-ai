import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  LayoutDashboard, User, FileText, BarChart3, Edit3, Sparkles, 
  Mail, Award, HelpCircle, Settings, LogOut, Moon, Sun, Monitor,
  Menu, X, FolderGit, ChevronLeft, ChevronRight, HardDrive
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  category: 'core' | 'ai-tools' | 'system';
}

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, logout } = useAuth();
  const { theme, setThemeMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigationItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, category: 'core' },
    { name: 'My Profile', path: '/profile', icon: User, category: 'core' },
    { name: 'File Manager', path: '/files', icon: HardDrive, category: 'core' },
    
    { name: 'Resume Builder', path: '/resume', icon: FileText, category: 'ai-tools' },
    { name: 'ATS Analyzer', path: '/ats-analyzer', icon: BarChart3, category: 'ai-tools' },
    { name: 'Resume Rewriter', path: '/resume-rewriter', icon: Edit3, category: 'ai-tools' },
    { name: 'Resume Optimizer', path: '/resume-optimizer', icon: Sparkles, category: 'ai-tools' },
    { name: 'Cover Letter Generator', path: '/cover-letter', icon: Mail, category: 'ai-tools' },
    { name: 'Skill Gap Analyzer', path: '/skill-gap', icon: Award, category: 'ai-tools' },
    { name: 'Interview Preparation', path: '/interview', icon: HelpCircle, category: 'ai-tools' },
    { name: 'AI Career Mentor', path: '/career-mentor', icon: Sparkles, category: 'ai-tools' },
    { name: 'Portfolio Generator', path: '/portfolio-setup', icon: FolderGit, category: 'ai-tools' },
    
    { name: 'Help Center', path: '/help-center', icon: HelpCircle, category: 'system' },
    { name: 'Settings', path: '/settings', icon: Settings, category: 'system' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 transition-colors duration-200">
      {/* Brand Logo */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-indigo-400">
          <Sparkles className="w-6 h-6 animate-pulse-slow text-indigo-400" />
          {!collapsed && <span className="tracking-tight text-white">Career Spark AI</span>}
        </Link>
        {!mobileOpen && (
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Core Links */}
        <div>
          <h3 className={`text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 ${collapsed ? 'sr-only' : ''}`}>
            Core Platform
          </h3>
          <ul className="space-y-1">
            {navigationItems.filter(i => i.category === 'core').map(item => {
              const active = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* AI Tools */}
        <div>
          <h3 className={`text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 ${collapsed ? 'sr-only' : ''}`}>
            AI Engines
          </h3>
          <ul className="space-y-1">
            {navigationItems.filter(i => i.category === 'ai-tools').map(item => {
              const active = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* System Settings */}
        <div>
          <h3 className={`text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 ${collapsed ? 'sr-only' : ''}`}>
            System
          </h3>
          <ul className="space-y-1">
            {navigationItems.filter(i => i.category === 'system').map(item => {
              const active = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <img 
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border border-indigo-500"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-100">{profile?.full_name || 'Alex Sparker'}</p>
              <p className="text-xs text-slate-400 truncate">{profile?.email || 'student@universities.edu'}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full mt-2 py-2 px-3 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-sm transition-all border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className={`hidden md:block shrink-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className="fixed top-0 bottom-0 left-0 z-20 transition-all duration-300 h-screen" style={{ width: collapsed ? '4rem' : '16rem' }}>
          <SidebarContent />
        </div>
      </aside>

      {/* Sidebar Mobile Modal */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-64 h-full">
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Panel Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 py-4 transition-colors duration-200 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-semibold text-lg md:text-xl text-slate-900 dark:text-slate-100">
              {navigationItems.find(item => location.pathname === item.path)?.name || 'Career Spark AI'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Mode Selector Buttons */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setThemeMode('light')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  theme === 'light' 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200 dark:bg-slate-800 dark:text-indigo-400 dark:border-slate-700' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
                title="Light Mode"
              >
                <Sun className="w-4 h-4" />
                <span className="hidden sm:inline">Light</span>
              </button>

              <button
                onClick={() => setThemeMode('dark')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  theme === 'dark' 
                    ? 'bg-slate-800 text-indigo-400 shadow-sm border border-slate-700' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
                title="Dark Mode"
              >
                <Moon className="w-4 h-4" />
                <span className="hidden sm:inline">Dark</span>
              </button>

              <button
                onClick={() => setThemeMode('system')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  theme === 'system' 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200 dark:bg-slate-800 dark:text-indigo-400 dark:border-slate-700' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
                title="System Mode"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">System</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
