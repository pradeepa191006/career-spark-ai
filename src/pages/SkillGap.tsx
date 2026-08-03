import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateText } from '../services/gemini';
import { extractTextFromFile } from '../utils/fileExtractor';
import { 
  AlertCircle, Compass, ShieldAlert, CheckCircle2, 
  RefreshCw
} from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { AiStatusLoader } from '../components/common/AiStatusLoader';
import { FileUploadZone } from '../components/common/FileUploadZone';

interface SkillGapReport {
  matchPercentage: number;
  skillMatch: number;
  educationMatch: number;
  experienceMatch: number;
  keywordMatch: number;
  projectRelevance: number;
  certificationMatch: number;
  softSkillMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendedSkills: string[];
  futureSkills: string[];
  outdatedSkills: string[];
  learningPriority: {
    high: string[];
    medium: string[];
    low: string[];
  };
  weeklyRoadmap: Array<{
    week: string;
    topics: string[];
    tasks: string[];
  }>;
  courseRecommendations: Array<{
    skill: string;
    docsName: string;
    docsLink: string;
    resourceName: string;
    resourceLink: string;
    platformName: string;
    challengesLink: string;
    youtubeSearch: string;
    bookTitle: string;
  }>;
  miniProjects: Array<{
    skill: string;
    title: string;
    desc: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  }>;
  growthSuggestions: string[];
}

export const SkillGap: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const resultsRef = React.useRef<HTMLDivElement | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkillGapReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'gaps' | 'roadmap' | 'resources'>('gaps');

  // AI steps
  const steps = [
    "Connecting to Gemini model...",
    "Auditing resume structure...",
    "Comparing key tech stacks...",
    "Categorizing priority gaps...",
    "Drafting study roadmaps...",
    "Constructing weekly deliverables..."
  ];
  const [activeStep, setActiveStep] = useState(0);

  const handleAnalyze = async () => {
    if (!targetRole.trim()) {
      showToast('Please provide your target career goal role.', 'warning');
      return;
    }

    setLoading(true);
    setError(null);
    setActiveStep(0);

    const interval = setInterval(() => {
      setActiveStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    const userSkills = profile?.skills?.join(', ') || 'React, JavaScript, Tailwind, Node.js';
    const prompt = `
      Perform a comprehensive skill gap analysis for a student targeting the role: "${targetRole}".
      User current skill profile: "${userSkills}".
      Target job description requirements: "${jobDescription || 'Standard engineering requirements for ' + targetRole}".

      Respond strictly with a JSON object matching this schema:
      {
        "matchPercentage": 78,
        "skillMatch": 80,
        "educationMatch": 85,
        "experienceMatch": 70,
        "keywordMatch": 75,
        "projectRelevance": 72,
        "certificationMatch": 60,
        "softSkillMatch": 85,
        "matchedSkills": ["React", "JavaScript"],
        "missingSkills": ["Docker", "Kubernetes"],
        "recommendedSkills": ["TypeScript", "GraphQL"],
        "futureSkills": ["CI/CD Pipeline Configurations"],
        "outdatedSkills": ["Manual deployment processes"],
        "learningPriority": {
          "high": ["Docker", "AWS"],
          "medium": ["Kubernetes"],
          "low": ["GraphQL"]
        },
        "weeklyRoadmap": [
          { "week": "Week 1", "topics": ["Docker basics"], "tasks": ["Containerize frontend React app."] }
        ],
        "courseRecommendations": [
          {
            "skill": "Docker",
            "docsName": "Docker Docs",
            "docsLink": "https://docs.docker.com",
            "resourceName": "Docker Handbook",
            "resourceLink": "#",
            "platformName": "Official Docs",
            "challengesLink": "#",
            "youtubeSearch": "Docker crash course",
            "bookTitle": "Docker Deep Dive"
          }
        ],
        "miniProjects": [
          {
            "skill": "Docker",
            "title": "Containerized React App",
            "desc": "Build a Dockerfile for Vite React app",
            "difficulty": "Intermediate"
          }
        ],
        "growthSuggestions": ["Quantify accomplishments with metrics."]
      }
    `;

    try {
      const response = await generateText(
        prompt,
        'You are a senior technical skill gap auditor. Return strictly valid JSON.',
        true
      );
      const parsed = JSON.parse(response);
      setResult(parsed);
      localStorage.setItem('active_skill_report', JSON.stringify(parsed));
      showToast('Skill gap analysis computed successfully!', 'success');
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      const fallbackReport: SkillGapReport = {
        matchPercentage: 70,
        skillMatch: 75,
        educationMatch: 80,
        experienceMatch: 60,
        keywordMatch: 65,
        projectRelevance: 70,
        certificationMatch: 50,
        softSkillMatch: 80,
        matchedSkills: ['React', 'JavaScript', 'CSS'],
        missingSkills: ['Docker', 'Kubernetes', 'AWS'],
        recommendedSkills: ['TypeScript', 'GraphQL'],
        futureSkills: ['CI/CD Pipeline Configurations'],
        outdatedSkills: ['Manual deployment processes'],
        learningPriority: {
          high: ['Docker', 'AWS'],
          medium: ['Kubernetes'],
          low: ['GraphQL']
        },
        weeklyRoadmap: [
          { week: 'Week 1', topics: ['Docker Containers setup'], tasks: ['Build multi-container express backend app.'] },
          { week: 'Week 2', topics: ['AWS ECS and S3 storage'], tasks: ['Deploy static react frontend to S3 buckets.'] }
        ],
        courseRecommendations: [
          { 
            skill: 'Docker', 
            docsName: 'Docker Get Started Guide', 
            docsLink: 'https://docs.docker.com', 
            resourceName: 'Docker Free Handbook', 
            resourceLink: '#', 
            platformName: 'Docker Docs',
            challengesLink: '#',
            youtubeSearch: 'Docker Crash Course 2026',
            bookTitle: 'Docker Deep Dive by Nigel Poulton'
          }
        ],
        miniProjects: [
          {
            skill: 'Docker',
            title: 'Containerized Portfolio Web App',
            desc: 'Create a multi-stage Docker build pipeline for a modern React frontend.',
            difficulty: 'Intermediate'
          }
        ],
        growthSuggestions: [
          'Add quantitative project metrics like "reduced build sizing by 20%".',
          'Deploy your active client dashboard onto live portfolio nodes.'
        ]
      };
      setResult(fallbackReport);
      localStorage.setItem('active_skill_report', JSON.stringify(fallbackReport));
      showToast('Loaded fallback skill analysis report.', 'info');
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } finally {
      clearInterval(interval);
      setLoading(false);
      setActiveStep(0);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto text-xs leading-normal">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-500" />
          <span>Skill Gap & Career Readiness Audit</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Audit missing tech stack skills against target market roles and generate weekly study roadmaps.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Input panel */}
      <div className="glass-card p-6 md:p-8 rounded-2xl space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-2">Target Career Parameters</h3>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Target Job Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Full Stack Engineer"
            className="w-full glass-input text-xs py-2 px-3"
          />
        </div>

        <div className="space-y-4">
          <FileUploadZone
            acceptTypes={['.pdf', '.docx']}
            maxSizeMB={5}
            onUploadComplete={async (url, name) => {
              setUploading(true);
              try {
                const response = await fetch(url);
                const blob = await response.blob();
                const mockFile = new File([blob], name);
                const text = await extractTextFromFile(mockFile);
                setJobDescription(text);
                showToast('Job Description parsed successfully!', 'success');
              } catch (e) {
                showToast('Failed to extract text. Paste requirements manually.', 'warning');
              } finally {
                setUploading(false);
              }
            }}
            label="Upload Job Description document"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Job Description Text</label>
          <textarea
            rows={5}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job requirements..."
            className="w-full glass-input text-xs"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || uploading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-755 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-lg cursor-pointer disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
          <span>{loading ? 'Auditing Skill Gaps...' : 'Perform Skill Gap Audit'}</span>
        </button>
      </div>

      {/* Results View */}
      {result && (
        <div ref={resultsRef} className="space-y-8 animate-fade-in">
          {/* Match Score header */}
          <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 border-l-indigo-500">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-450">Career Readiness Score</span>
              <p className="text-3xl font-black text-slate-100 mt-1">{result.matchPercentage}%</p>
            </div>
            <div className="flex bg-slate-900/60 p-1 rounded-xl gap-1 text-[11px]">
              <button
                onClick={() => setActiveSubTab('gaps')}
                className={`px-3 py-1.5 font-semibold rounded-lg ${activeSubTab === 'gaps' ? 'bg-indigo-650 text-white' : 'text-slate-400'}`}
              >
                Gaps Breakdown
              </button>
              <button
                onClick={() => setActiveSubTab('roadmap')}
                className={`px-3 py-1.5 font-semibold rounded-lg ${activeSubTab === 'roadmap' ? 'bg-indigo-650 text-white' : 'text-slate-400'}`}
              >
                Weekly Roadmap
              </button>
              <button
                onClick={() => setActiveSubTab('resources')}
                className={`px-3 py-1.5 font-semibold rounded-lg ${activeSubTab === 'resources' ? 'bg-indigo-650 text-white' : 'text-slate-400'}`}
              >
                Learning Resources
              </button>
            </div>
          </div>

          {/* Subtab 1: Gaps */}
          {activeSubTab === 'gaps' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Matched Skills ({result.matchedSkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h4 className="font-bold text-red-400 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Missing Priority Gaps ({result.missingSkills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subtab 2: Roadmap */}
          {activeSubTab === 'roadmap' && (
            <div className="space-y-4">
              {result.weeklyRoadmap.map((item, idx) => (
                <div key={idx} className="glass-card p-6 rounded-2xl space-y-2 border dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs font-bold text-indigo-400">
                    <span>{item.week}</span>
                    <span className="text-[10px] bg-indigo-500/10 px-2 py-0.5 rounded">Deliverables</span>
                  </div>
                  <p className="font-semibold text-slate-200">{item.topics.join(', ')}</p>
                  <ul className="list-disc pl-4 text-slate-400 text-[11px] space-y-1">
                    {item.tasks.map((t, tidx) => <li key={tidx}>{t}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Subtab 3: Resources */}
          {activeSubTab === 'resources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.courseRecommendations.map((c, idx) => (
                <div key={idx} className="glass-card p-5 rounded-2xl space-y-3 border dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-indigo-400">{c.skill}</span>
                    <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">{c.platformName}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <p>📖 Documentation: <a href={c.docsLink} target="_blank" rel="noreferrer" className="underline text-indigo-400">{c.docsName}</a></p>
                    <p>📚 Recommended Book: {c.bookTitle}</p>
                    <p>🎥 Search Tutorial: "{c.youtubeSearch}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AiStatusLoader
        isActive={loading}
        steps={steps}
        currentStepIndex={activeStep}
        title="AI Skill Gap Placement Engine"
      />
    </div>
  );
};
