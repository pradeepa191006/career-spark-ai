import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { exportToPDF } from '../utils/pdfExporter';
import { 
  Sparkles, Zap, Bell, CheckSquare, Award as BadgeIcon,
  LayoutDashboard, BarChart3, Download, FileText, Mic, HardDrive,
  Globe, ArrowRight, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'analytics'>('overview');

  // Dynamic States
  const [resumeCount, setResumeCount] = useState(1);
  const [atsScore, setAtsScore] = useState(85);
  const [interviewCount, setInterviewCount] = useState(0);
  const [fileCount, setFileCount] = useState(3);
  const [portfolioPublished, setPortfolioPublished] = useState(true);
  const [recentInterviews, setRecentInterviews] = useState<any[]>([]);

  useEffect(() => {
    // Read cached items dynamically
    const cachedResume = localStorage.getItem('saved_resume');
    if (cachedResume) {
      setResumeCount(1);
    }

    const cachedInterviews = localStorage.getItem('saved_interviews');
    if (cachedInterviews) {
      try {
        const list = JSON.parse(cachedInterviews);
        setInterviewCount(list.length);
        setRecentInterviews(list);
      } catch (e) {
        console.error(e);
      }
    }

    const cachedFiles = localStorage.getItem('uploaded_files_hub');
    if (cachedFiles) {
      try {
        const list = JSON.parse(cachedFiles);
        setFileCount(list.length);
      } catch (e) {
        console.error(e);
      }
    }

    const cachedSkill = localStorage.getItem('active_skill_report');
    if (cachedSkill) {
      try {
        const parsed = JSON.parse(cachedSkill);
        if (parsed.matchPercentage) setAtsScore(parsed.matchPercentage);
      } catch (e) {
        console.error(e);
      }
    }

    const cachedPortfolio = localStorage.getItem('portfolio_data');
    if (cachedPortfolio) {
      setPortfolioPublished(true);
    }
  }, []);

  // Computed readiness score
  const readinessScore = Math.min(
    100,
    Math.round((atsScore * 0.4) + (interviewCount > 0 ? 30 : 10) + (profile?.skills?.length ? 20 : 10) + (portfolioPublished ? 10 : 0))
  );

  const getReadinessStatus = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };

  const progressTracking = [
    { name: 'Resumes Saved', count: resumeCount, limit: 'Active' },
    { name: 'ATS Reports', count: atsScore ? 1 : 0, limit: `${atsScore}% Best Match` },
    { name: 'Interview Sessions', count: interviewCount, limit: 'Completed' },
    { name: 'Files Uploaded', count: fileCount, limit: 'In Hub' },
    { name: 'Profile Skills', count: profile?.skills?.length || 5, limit: 'Verified' },
    { name: 'Certifications', count: profile?.certifications?.length || 1, limit: 'Earned' },
  ];

  // Achievements Badges
  const badges = [
    { id: 'resume_expert', name: 'Resume Builder Expert', unlocked: resumeCount > 0, desc: 'Created at least 1 resume draft.', color: 'text-emerald-500 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { id: 'ats_master', name: 'ATS Master', unlocked: atsScore >= 80, desc: 'Achieved an ATS score over 80%.', color: 'text-teal-500 dark:text-teal-400 border-teal-500/30 bg-teal-500/10' },
    { id: 'interview_ready', name: 'Interview Champion', unlocked: interviewCount >= 1, desc: 'Completed a practice interview.', color: 'text-orange-500 dark:text-orange-400 border-orange-500/30 bg-orange-500/10' },
    { id: 'portfolio_creator', name: 'Portfolio Creator', unlocked: portfolioPublished, desc: 'Published personal portfolio.', color: 'text-teal-600 dark:text-teal-300 border-teal-500/30 bg-teal-500/10' },
    { id: 'skill_champion', name: 'Skill Builder', unlocked: (profile?.skills?.length || 0) >= 3, desc: 'Added 3+ core skills to profile.', color: 'text-emerald-600 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10' },
    { id: 'placement_ready', name: 'Placement Ready', unlocked: readinessScore >= 80, desc: 'Placement Readiness rating exceeds 80%.', color: 'text-orange-500 dark:text-orange-400 border-orange-500/30 bg-orange-500/10' }
  ];

  // Dynamic Recent Notifications / Logs
  const notifications = [
    { text: `Profile updated: ${profile?.full_name || 'Alex Sparker'} in ${profile?.department || 'Computer Science'}.`, type: 'info', time: 'Just now' },
    { text: `Latest ATS Match Score: ${atsScore}% for target career role.`, type: 'success', time: 'Today' },
    { text: `Mock Interviews completed: ${interviewCount} total sessions logged.`, type: 'badge', time: 'Active' },
    { text: `Recruiter Hub: ${fileCount} files uploaded & ready for sharing.`, type: 'info', time: 'Syncing' }
  ];

  const handleDownloadWeeklyReport = async () => {
    try {
      await exportToPDF('weekly-report-card', 'weekly_career_report.pdf');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 text-xs leading-normal">
      {/* Top Banner with Circular Gauge */}
      <div className="glass-card p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 font-semibold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>AI Placement Readiness Engine Active</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome back, {profile?.full_name || 'Alex'}!
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
            Your profile is currently targeted in the <span className="text-teal-600 dark:text-teal-400 font-semibold">{profile?.department || 'Computer Science & Engineering'}</span> sector. 
            Keep completing mock sessions and tailoring your resume to maximize recruiter match potential!
          </p>
          <div className="flex gap-3 pt-2 text-xs flex-wrap">
            <Link to="/resume" className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/20">
              <FileText className="w-3.5 h-3.5" />
              <span>Resume Builder</span>
            </Link>
            <Link to="/interview" className="px-4 py-2 border border-slate-300 dark:border-[#143D32] hover:bg-emerald-500/10 text-teal-600 dark:text-teal-400 font-semibold rounded-xl transition-all flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              <span>Mock Interview</span>
            </Link>
            <Link to="/files" className="px-4 py-2 border border-slate-300 dark:border-[#143D32] hover:bg-slate-100 dark:hover:bg-[#0B2A22] text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Files Hub</span>
            </Link>
          </div>
        </div>

        {/* Readiness Circular gauge */}
        <div className="shrink-0 flex items-center gap-4 bg-slate-50 dark:bg-[#071C17] p-5 rounded-2xl border border-slate-200 dark:border-[#143D32]">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="text-slate-200 dark:text-[#0B2A22] stroke-current" strokeWidth="8" fill="transparent" r="38" cx="50" cy="50" />
              <circle className="text-emerald-500 stroke-current" strokeWidth="8" strokeDasharray={2*Math.PI*38} strokeDashoffset={(1 - readinessScore / 100) * (2*Math.PI*38)} strokeLinecap="round" fill="transparent" r="38" cx="50" cy="50" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-slate-900 dark:text-slate-100">{readinessScore}%</span>
              <span className="text-[8px] uppercase font-bold text-slate-500 dark:text-slate-400">Readiness</span>
            </div>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <span>Status:</span>
              <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">
                {getReadinessStatus(readinessScore)}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Target score for placement shortlist: 90%</p>
          </div>
        </div>
      </div>

      {/* Sub-tab selectors */}
      <div className="flex bg-slate-100 dark:bg-[#071C17] border border-slate-200 dark:border-[#143D32] p-1 rounded-xl gap-0.5">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'overview' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview & Quick Actions</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'analytics' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Career Analytics</span>
        </button>
      </div>

      {/* VIEW 1: Overview Summary */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Left Side: 8 cols */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/ats-analyzer" className="glass-card p-5 rounded-2xl hover:border-emerald-500/50 transition-all space-y-2 group">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-emerald-500 transition-colors">ATS Analyzer</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">Audit resume keyword match against target job descriptions.</p>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] pt-1">
                  <span>Run Scan</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>

              <Link to="/resume-optimizer" className="glass-card p-5 rounded-2xl hover:border-teal-500/50 transition-all space-y-2 group">
                <div className="p-2.5 bg-teal-500/10 text-teal-500 dark:text-teal-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-teal-500 transition-colors">Resume Optimizer</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">Inject action verbs & metrics to boost your ATS rating.</p>
                <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold text-[10px] pt-1">
                  <span>Optimize</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>

              <Link to="/portfolio-setup" className="glass-card p-5 rounded-2xl hover:border-emerald-500/50 transition-all space-y-2 group">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-emerald-500 transition-colors">Portfolio Generator</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">Publish interactive web portfolio to showcase achievements.</p>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] pt-1">
                  <span>Build Portfolio</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </div>

            {/* Detailed Progress tracking grids */}
            <div className="glass-card p-6 rounded-2xl space-y-5">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-2">Platform Activity Statistics</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {progressTracking.map((p, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 dark:bg-[#071C17] rounded-xl border border-slate-200 dark:border-[#143D32] text-xs">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] truncate">{p.name}</p>
                    <p className="text-xl font-black text-slate-850 dark:text-slate-100 mt-1">{p.count}</p>
                    <p className="text-[9px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">{p.limit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Interview History */}
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#143D32] pb-2">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recent Interview History</h3>
                <Link to="/interview" className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline">View All</Link>
              </div>
              
              {recentInterviews.length > 0 ? (
                <div className="space-y-3">
                  {recentInterviews.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-3.5 bg-slate-50 dark:bg-[#071C17] rounded-xl border border-slate-200 dark:border-[#143D32] flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.role}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{item.type} mode • {item.date}</p>
                      </div>
                      <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded">Score: {item.score}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 italic">
                  No interview sessions logged yet. Launch a Voice or Video mock session in Interview Prep!
                </div>
              )}
            </div>

            {/* Weekly report card */}
            <div 
              id="weekly-report-card" 
              className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-[#143D32] space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300"
            >
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-[#143D32] pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">AI Placement Readiness Summary</h4>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">Compiled: {new Date().toLocaleDateString()}</p>
                </div>
                <button
                  onClick={handleDownloadWeeklyReport}
                  className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-1.5 px-3 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-950/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px]">
                <div className="p-3.5 bg-slate-50 dark:bg-[#071C17] rounded-xl border border-slate-200 dark:border-[#143D32]">
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">🔥 Resume & ATS Progress</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Best ATS Score rating stands at {atsScore}%. Resume drafts saved and synced across modules.</p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-[#071C17] rounded-xl border border-slate-200 dark:border-[#143D32]">
                  <p className="font-bold text-teal-600 dark:text-teal-400">🎤 Practice & Learning</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">Completed {interviewCount} mock interview sessions. Overall readiness calculated at {readinessScore}%.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: 4 cols */}
          <div className="lg:col-span-4 space-y-6">
            {/* Unlocked Badges */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-2 flex items-center gap-1.5">
                <BadgeIcon className="w-4 h-4 text-emerald-500" />
                <span>Unlocked Achievements</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-2.5">
                {badges.map((badge) => (
                  <div 
                    key={badge.id} 
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      badge.unlocked ? badge.color : 'opacity-30 border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-500'
                    }`}
                    title={badge.desc}
                  >
                    <Zap className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-[8px] font-bold leading-normal truncate">{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time notification log widget */}
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-2 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-teal-500" />
                <span>Career Logs & Notifications</span>
              </h3>

              <div className="space-y-3.5">
                {notifications.map((n, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-xs leading-normal">
                    <div className={`p-1 rounded mt-0.5 ${
                      n.type === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                      n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                      'bg-teal-500/10 text-teal-500 dark:text-teal-400'
                    }`}>
                      <CheckSquare className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-700 dark:text-slate-300 text-[10px]">{n.text}</p>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Career Analytics */}
      {activeSubTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Chart 1: ATS History */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#143D32] pb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ATS Score Peak</span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Score: {atsScore}%</span>
            </div>
            <div className="h-32 flex items-end">
              <svg className="w-full h-full" viewBox="0 0 300 100">
                <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(16,185,129,0.06)" strokeWidth="1" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(16,185,129,0.06)" strokeWidth="1" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(16,185,129,0.06)" strokeWidth="1" />
                <polyline fill="none" stroke="#10b981" strokeWidth="3" points="10,80 70,72 130,55 190,40 250,22" />
                <circle cx="10" cy="80" r="4" fill="#10b981" />
                <circle cx="70" cy="72" r="4" fill="#10b981" />
                <circle cx="130" cy="55" r="4" fill="#10b981" />
                <circle cx="190" cy="40" r="4" fill="#14b8a6" />
                <circle cx="250" cy="22" r="4" fill="#14b8a6" />
              </svg>
            </div>
          </div>

          {/* Chart 2: Placement Readiness Trend */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#143D32] pb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Readiness Progress</span>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">Current: {readinessScore}%</span>
            </div>
            <div className="h-32 flex items-end">
              <svg className="w-full h-full" viewBox="0 0 300 100">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M 10 90 L 10 75 Q 80 65 130 50 T 250 25 L 250 90 Z" fill="url(#areaGrad)" />
                <path d="M 10 75 Q 80 65 130 50 T 250 25" fill="none" stroke="#10b981" strokeWidth="3" />
                <circle cx="250" cy="25" r="4" fill="#14b8a6" />
              </svg>
            </div>
          </div>

          {/* Chart 3: Skill Match */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#143D32] pb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skills Count</span>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">{profile?.skills?.length || 5} Skills</span>
            </div>
            <div className="h-32 flex items-end">
              <svg className="w-full h-full" viewBox="0 0 300 100">
                <rect x="30" y="45" width="20" height="40" fill="#10b981" rx="3" />
                <text x="25" y="95" fill="gray" fontSize="8">Profile</text>
                <rect x="110" y="25" width="20" height="60" fill="#14b8a6" rx="3" />
                <text x="105" y="95" fill="gray" fontSize="8">Target</text>
                <rect x="190" y="60" width="20" height="25" fill="#f97316" rx="3" />
                <text x="190" y="95" fill="gray" fontSize="8">Gaps</text>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
