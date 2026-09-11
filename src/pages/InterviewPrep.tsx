import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportToPDF } from '../utils/pdfExporter';
import { useAuth } from '../context/AuthContext';
import { getScopedStorage, setScopedStorage } from '../utils/storageHelper';
import { 
  Mic, Video, HelpCircle, LayoutDashboard, Settings, 
  History, Calendar, AlertTriangle, 
  Trash2, Download, CheckSquare, ChevronRight 
} from 'lucide-react';

interface MockInterviewSession {
  id: string;
  date: string;
  type: 'voice' | 'video';
  role: string;
  difficulty: string;
  score: number;
  confidenceScore: number;
  communicationScore: number;
  technicalScore: number;
  hrScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  speakingSpeed: string;
  fillerWordCount: number;
  questions: string[];
  answers: string[];
  strengths: string[];
  improvements: string[];
  idealResponses?: string[];
  videoFeedback?: {
    posture: string;
    eyeContact: string;
    engagement: number;
    professionalism: number;
  };
}

export const InterviewPrep: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'setup' | 'history'>('dashboard');

  // Setup form states
  const [role, setRole] = useState(() => sessionStorage.getItem('interview_role') || 'Software Engineer');
  const [description, setDescription] = useState(() => sessionStorage.getItem('interview_desc') || '');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [duration, setDuration] = useState('10 minutes');
  const [voiceSpeed, setVoiceSpeed] = useState('Normal');
  const [categories, setCategories] = useState<string[]>(['Technical', 'HR']);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const [history, setHistory] = useState<MockInterviewSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<MockInterviewSession | null>(null);

  // Load interview history with user isolation
  useEffect(() => {
    const cached = getScopedStorage<MockInterviewSession[]>('saved_interviews', user?.id, []);
    if (cached && cached.length) {
      setHistory(cached);
    } else {
      const initialMock: MockInterviewSession[] = [
        {
          id: 'mock_1',
          date: new Date().toLocaleDateString(),
          type: 'voice',
          role: 'Full Stack Software Engineer',
          difficulty: 'Medium',
          score: 82,
          confidenceScore: 85,
          communicationScore: 80,
          technicalScore: 84,
          hrScore: 80,
          fluencyScore: 78,
          grammarScore: 82,
          vocabularyScore: 78,
          speakingSpeed: '125 WPM',
          fillerWordCount: 4,
          questions: ['Tell me about your primary technical stack', 'How do you handle React component state performance?'],
          answers: ['I build applications using React and Node.js...', 'I optimize state updates using useMemo and useCallback hooks...'],
          strengths: ['Upright sitting posture', 'Clear verbal pacing and technical relevance'],
          improvements: ['Infuse quantifiable metric benchmarks in project summaries'],
        }
      ];
      setHistory(initialMock);
      setScopedStorage('saved_interviews', initialMock, user?.id);
    }
  }, [user]);

  const handleStartSession = (mode: 'voice' | 'video') => {
    sessionStorage.setItem('interview_role', role);
    sessionStorage.setItem('interview_desc', description);
    sessionStorage.setItem('interview_difficulty', difficulty);
    sessionStorage.setItem('interview_duration', duration);
    sessionStorage.setItem('interview_voice_speed', voiceSpeed);
    sessionStorage.setItem('interview_categories', JSON.stringify(categories));
    sessionStorage.setItem('interview_mic', String(micEnabled));
    sessionStorage.setItem('interview_camera', String(cameraEnabled));

    if (mode === 'voice') {
      navigate('/interview/voice');
    } else {
      navigate('/interview/video');
    }
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    localStorage.setItem('saved_interviews', JSON.stringify(updated));
    if (selectedSession?.id === id) {
      setSelectedSession(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedSession) return;
    try {
      await exportToPDF('interview-report-view', `interview_${selectedSession.role.replace(/\s+/g, '_')}_report.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  // Compute aggregated scores
  const totalMockInterviews = history.length;
  const bestConfidence = history.length ? Math.max(...history.map(h => h.confidenceScore)) : 0;
  const bestCommunication = history.length ? Math.max(...history.map(h => h.communicationScore)) : 0;
  const avgTechnical = history.length ? Math.round(history.reduce((acc, h) => acc + h.technicalScore, 0) / history.length) : 0;
  const avgHR = history.length ? Math.round(history.reduce((acc, h) => acc + h.hrScore, 0) / history.length) : 0;
  const readinessScore = history.length ? Math.round(history.reduce((acc, h) => acc + h.score, 0) / history.length) : 0;

  const toggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Title Controls */}
      <div>
        <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <Mic className="w-5 h-5 text-emerald-500" />
          <span>AI Interview Preparation Platform</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Simulate professional mock placements and obtain live posture, voice fluency, and grammar metrics.
        </p>
      </div>

      {/* Navigation sub-tabs */}
      <div className="flex bg-slate-100 dark:bg-[#0B2A22]/80 border border-slate-200 dark:border-[#143D32] p-1 rounded-xl gap-1 text-xs">
        <button
          onClick={() => { setActiveTab('dashboard'); setSelectedSession(null); }}
          className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'dashboard' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => { setActiveTab('setup'); setSelectedSession(null); }}
          className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'setup' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configure Setup</span>
        </button>

        <button
          onClick={() => { setActiveTab('history'); setSelectedSession(null); }}
          className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'history' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Interview History</span>
        </button>
      </div>

      {/* TAB 1: Dashboard View */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-[#143D32]">
              <p className="text-[10px] font-bold text-slate-450 uppercase">Total Interviews</p>
              <p className="text-2xl font-black mt-2 text-slate-800 dark:text-slate-100">{totalMockInterviews}</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-[#143D32]">
              <p className="text-[10px] font-bold text-slate-450 uppercase">Best Confidence</p>
              <p className="text-2xl font-black mt-2 text-teal-500">{bestConfidence}%</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-[#143D32]">
              <p className="text-[10px] font-bold text-slate-450 uppercase">Best Communication</p>
              <p className="text-2xl font-black mt-2 text-emerald-500">{bestCommunication}%</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-[#143D32]">
              <p className="text-[10px] font-bold text-slate-450 uppercase">Avg Technical</p>
              <p className="text-2xl font-black mt-2 text-teal-400">{avgTechnical}%</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-[#143D32]">
              <p className="text-[10px] font-bold text-slate-450 uppercase">Avg HR Score</p>
              <p className="text-2xl font-black mt-2 text-amber-500">{avgHR}%</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-[#0B2A22]">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Readiness Rating</p>
              <p className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-300">{readinessScore}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: recent history logs + weak areas */}
            <div className="lg:col-span-8 space-y-6">
              {/* Custom SVG improvement progress chart */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b dark:border-[#143D32] pb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Improvement Progress Trend</h4>
                  <span className="text-[10px] font-bold text-emerald-500">Readiness target: 90%</span>
                </div>
                <div className="h-36 flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 500 120">
                    <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      points="20,100 100,92 180,80 260,68 340,50 420,38"
                    />
                    <circle cx="20" cy="100" r="4.5" fill="#10b981" />
                    <circle cx="100" cy="92" r="4.5" fill="#10b981" />
                    <circle cx="180" cy="80" r="4.5" fill="#10b981" />
                    <circle cx="260" cy="68" r="4.5" fill="#10b981" />
                    <circle cx="340" cy="50" r="4.5" fill="#10b981" />
                    <circle cx="420" cy="38" r="4.5" fill="#14b8a6" />
                    <text x="20" y="115" fill="gray" fontSize="8">Session 1</text>
                    <text x="100" y="115" fill="gray" fontSize="8">Session 2</text>
                    <text x="180" y="115" fill="gray" fontSize="8">Session 3</text>
                    <text x="260" y="115" fill="gray" fontSize="8">Session 4</text>
                    <text x="340" y="115" fill="gray" fontSize="8">Session 5</text>
                    <text x="420" y="115" fill="gray" fontSize="8">Today</text>
                  </svg>
                </div>
              </div>

              {/* Recent mock session log list */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-[#143D32] pb-2">Recent Sessions</h3>
                <div className="space-y-3">
                  {history.slice(0, 3).map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => { setSelectedSession(item); setActiveTab('history'); }}
                      className="p-4 bg-white dark:bg-[#071C17]/60 hover:bg-slate-50 dark:hover:bg-[#0B2A22]/50 rounded-xl border dark:border-[#143D32] border-slate-200 flex justify-between items-center text-xs cursor-pointer transition-all"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.role}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{item.type} Mode • {item.difficulty} • {item.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{item.score}%</span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: weak areas and upcoming practice goals */}
            <div className="lg:col-span-4 space-y-6 text-xs">
              <div className="glass-card p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>Weak Coaching Areas</span>
                </h4>
                <ul className="space-y-2">
                  <li className="flex gap-2 items-start text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                    <span>Eye contact drops when detailing challenges.</span>
                  </li>
                  <li className="flex gap-2 items-start text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                    <span>Slightly high density of verbal filler "like" and "um".</span>
                  </li>
                  <li className="flex gap-2 items-start text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                    <span>Lacks quantitative metrics inside project descriptions.</span>
                  </li>
                </ul>
              </div>

              <div className="glass-card p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Practice Target Goals</span>
                </h4>
                <ul className="space-y-3">
                  <li className="flex gap-2 items-center text-slate-600 dark:text-slate-400">
                    <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
                    <span>Complete 1 HR situational mock</span>
                  </li>
                  <li className="flex gap-2 items-center text-slate-600 dark:text-slate-400">
                    <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
                    <span>Practice webcam posture evaluations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Setup Mock Configuration */}
      {activeTab === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Main configuration forms */}
          <div className="lg:col-span-8 glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-[#143D32] pb-3">Session Parameters</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Target Job Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full glass-input text-xs py-2"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Difficulty Level</label>
                <div className="flex bg-slate-100 dark:bg-[#071C17] border border-slate-200 dark:border-[#143D32] p-1 rounded-xl gap-0.5 text-xs">
                  {['Easy', 'Medium', 'Hard'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d as any)}
                      className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
                        difficulty === d ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Focus Topics / Job Details</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full glass-input text-xs py-2 px-3"
                placeholder="e.g. React hooks, system design, HR basics"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Session Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full glass-input text-xs py-2"
                >
                  <option value="5 minutes">5 minutes (3 questions)</option>
                  <option value="10 minutes">10 minutes (5 questions)</option>
                  <option value="15 minutes">15 minutes (8 questions)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Interviewer Voice Speed</label>
                <select
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(e.target.value)}
                  className="w-full glass-input text-xs py-2"
                >
                  <option value="Slow">Slow pacing</option>
                  <option value="Normal">Normal pace</option>
                  <option value="Fast">Fast pacing</option>
                </select>
              </div>
            </div>

            {/* Question category checkboxes */}
            <div className="space-y-3">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase">Question Focus Categories</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {['Technical', 'HR', 'Behavioral', 'Situational', 'Coding', 'Project Discussion'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                      categories.includes(cat)
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-[#143D32] hover:border-emerald-500/30 bg-transparent text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Media device selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t dark:border-[#143D32]">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Configure Microphone</span>
                  <p className="text-[10px] text-slate-500">Utilize voice synthesis recorders</p>
                </div>
                <input
                  type="checkbox"
                  checked={micEnabled}
                  onChange={(e) => setMicEnabled(e.target.checked)}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Configure Camera</span>
                  <p className="text-[10px] text-slate-500">Utilize vision posture trackers</p>
                </div>
                <input
                  type="checkbox"
                  checked={cameraEnabled}
                  onChange={(e) => setCameraEnabled(e.target.checked)}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
              </div>
            </div>

            {/* Action launcher triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => handleStartSession('voice')}
                className="py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Launch Voice Mock</span>
              </button>

              <button
                onClick={() => handleStartSession('video')}
                className="py-3 border border-teal-500 hover:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Launch Camera Mock</span>
              </button>
            </div>
          </div>

          {/* Right info panel help */}
          <div className="lg:col-span-4 glass-card p-6 rounded-2xl space-y-4 self-start text-xs text-slate-500">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b dark:border-[#143D32] pb-2">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              <span>SaaS Coaching Help</span>
            </h4>
            <p className="leading-relaxed">
              We leverage browser Speech-to-Text and media tools. Your session details are saved locally. 
              Always sit upright, mount your camera at eye level, and speak clearly.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: Session History List */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* History selection column: 4 cols */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-[#143D32] pb-2">Mock Sessions List</h3>
              
              {history.length ? (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedSession(item)}
                      className={`p-3 rounded-xl border transition-all text-xs cursor-pointer flex justify-between items-center ${
                        selectedSession?.id === item.id 
                          ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10' 
                          : 'border-slate-200 dark:border-[#143D32] hover:border-emerald-500/30 bg-transparent'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.role}</p>
                        <p className="text-[9px] text-slate-500">{item.date} • {item.type}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{item.score}%</span>
                        <button 
                          onClick={(e) => handleDeleteSession(item.id, e)}
                          className="p-1 hover:text-red-500 text-slate-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No past sessions found. Configure setup to begin.</p>
              )}
            </div>
          </div>

          {/* Feedback Report Detail Column: 8 cols */}
          <div className="lg:col-span-8">
            {selectedSession ? (
              <div className="space-y-6">
                {/* Score header */}
                <div className="flex justify-between items-center bg-white dark:bg-[#0B2A22]/80 border border-slate-200 dark:border-[#143D32] p-4 rounded-xl">
                  <div>
                    <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">{selectedSession.type} feedback report</span>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedSession.role} Mock</h3>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleDownloadPDF}
                      className="p-2 border border-slate-200 dark:border-[#143D32] hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Report</span>
                    </button>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded">{selectedSession.score}%</span>
                  </div>
                </div>

                {/* Report Content view */}
                <div 
                  id="interview-report-view" 
                  className="glass-card p-6 rounded-2xl space-y-6 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#143D32]"
                >
                  <div className="border-b dark:border-[#143D32] pb-4">
                    <h4 className="text-base font-extrabold text-slate-850 dark:text-slate-100">AI Performance scorecard</h4>
                    <p className="text-[10px] text-slate-500 mt-1">Generated: {selectedSession.date} • Type: {selectedSession.type}</p>
                  </div>

                  {/* Core Scores Matrix Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-slate-50 dark:bg-[#071C17]/60 rounded-xl border border-slate-200 dark:border-[#143D32]">
                      <p className="text-[9px] uppercase font-bold text-slate-400">Confidence</p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{selectedSession.confidenceScore}%</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-[#071C17]/60 rounded-xl border border-slate-200 dark:border-[#143D32]">
                      <p className="text-[9px] uppercase font-bold text-slate-400">Communication</p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{selectedSession.communicationScore}%</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-[#071C17]/60 rounded-xl border border-slate-200 dark:border-[#143D32]">
                      <p className="text-[9px] uppercase font-bold text-slate-400">Fluency</p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{selectedSession.fluencyScore}%</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-[#071C17]/60 rounded-xl border border-slate-200 dark:border-[#143D32]">
                      <p className="text-[9px] uppercase font-bold text-slate-400">Grammar Index</p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{selectedSession.grammarScore}%</p>
                    </div>
                  </div>

                  {/* Speech particulars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-[#071C17]/40 rounded-xl border border-slate-200 dark:border-[#143D32]">
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Vocabulary Level</p>
                      <p className="text-[10px] text-slate-500 mt-1">Score: {selectedSession.vocabularyScore}% • Average: 75%</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Speech Flow Characteristics</p>
                      <p className="text-[10px] text-slate-500 mt-1">Speaking Speed: {selectedSession.speakingSpeed} • Filler Words: {selectedSession.fillerWordCount}</p>
                    </div>
                  </div>

                  {/* Video analysis specific details */}
                  {selectedSession.videoFeedback && (
                    <div className="space-y-3 pt-2">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200">Coaching Vision Cues Feedback</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] leading-relaxed">
                        <div className="p-3.5 bg-slate-50 dark:bg-[#071C17]/60 rounded-xl border border-slate-200 dark:border-[#143D32]">
                          <p className="font-semibold text-teal-600 dark:text-teal-400 uppercase text-[8px] mb-1">Posture Alignment</p>
                          <p className="text-slate-600 dark:text-slate-400 italic">"{selectedSession.videoFeedback.posture}"</p>
                        </div>
                        <div className="p-3.5 bg-slate-50 dark:bg-[#071C17]/60 rounded-xl border border-slate-200 dark:border-[#143D32]">
                          <p className="font-semibold text-teal-600 dark:text-teal-400 uppercase text-[8px] mb-1">Eye-Contact Track</p>
                          <p className="text-slate-600 dark:text-slate-400 italic">"{selectedSession.videoFeedback.eyeContact}"</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Strengths and Weaknesses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t dark:border-[#143D32]">
                    <div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[10px]">Strengths</span>
                      <ul className="list-disc pl-4 text-[10px] text-slate-600 dark:text-slate-400 mt-1.5 space-y-1">
                        {selectedSession.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-orange-500 uppercase text-[10px]">Areas to Improve</span>
                      <ul className="list-disc pl-4 text-[10px] text-slate-600 dark:text-slate-400 mt-1.5 space-y-1">
                        {selectedSession.improvements.map((i, idx) => <li key={idx}>{i}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* Question and answer log */}
                  <div className="space-y-3 pt-4 border-t dark:border-[#143D32]">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200">Questions and Answers Log</h5>
                    <div className="space-y-4">
                      {selectedSession.questions.map((q, idx) => (
                        <div key={idx} className="space-y-1 text-[10px]">
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">Q{idx + 1}: {q}</p>
                          <p className="text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-[#071C17]/60 border border-slate-200 dark:border-[#143D32] p-2.5 rounded-lg">A: {selectedSession.answers[idx] || 'No verbal response recorded.'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-20 rounded-2xl text-center border border-dashed border-slate-200 dark:border-[#143D32] h-full flex flex-col items-center justify-center text-slate-500">
                <History className="w-12 h-12 text-slate-400 dark:text-emerald-500/30 mb-3" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Session Details Viewer</h4>
                <p className="text-[10px] text-slate-500 max-w-xs mx-auto mt-1">Select an interview session in the list on the left to inspect detailed verbal analyses, ideal answers, and download PDFs.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
