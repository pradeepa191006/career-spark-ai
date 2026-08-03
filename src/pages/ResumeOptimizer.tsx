import React, { useState, useEffect } from 'react';
import { generateText } from '../services/gemini';
import { 
  Sparkles, CheckCircle2, AlertCircle, RefreshCw, 
  FileText, Import, ShieldCheck, TrendingUp 
} from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { AiStatusLoader } from '../components/common/AiStatusLoader';

interface OptimizationReport {
  originalScore: number;
  optimizedScore: number;
  keywordScore: number;
  formattingScore: number;
  grammarScore: number;
  writingScore: number;
  strengthScore: number;
  readabilityScore: number;
  compatibilityScore: number;
  addedKeywords: string[];
  removedWeakWords: string[];
  improvedSummary: string;
  improvedProject: string;
  improvedVerbs: string[];
}

export const ResumeOptimizer: React.FC = () => {
  const { showToast } = useToast();
  const resultsRef = React.useRef<HTMLDivElement | null>(null);

  const [resumeSource, setResumeSource] = useState<'import' | 'paste'>('import');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<OptimizationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  // AI steps
  const steps = [
    "Connecting to Gemini model...",
    "Analyzing structure issues...",
    "Auditing weak action verbs...",
    "Injecting optimized keywords...",
    "Finalizing scoring scorecard..."
  ];
  const [activeStep, setActiveStep] = useState(0);

  // Load from builder localStorage
  useEffect(() => {
    if (resumeSource === 'import') {
      const cached = localStorage.getItem('saved_resume');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const experienceString = parsed.experience?.map((e: any) => `${e.company}: ${e.role}. ${e.desc}`).join('\n') || '';
          const projectString = parsed.projects?.map((p: any) => `${p.title}: ${p.description} (${p.technologies})`).join('\n') || '';
          const summaryText = `
            Name: ${parsed.personal?.fullName}
            Title: ${parsed.personal?.title}
            Summary: ${parsed.personal?.summary}
            Skills: ${parsed.skills?.join(', ')}
            Experience: ${experienceString}
            Projects: ${projectString}
          `;
          setResumeText(summaryText);
        } catch (e) {
          console.error('Failed to import.');
        }
      } else {
        setResumeText('Alex Sparker. Student at State Technical University. Created websites using Javascript.');
      }
    }
  }, [resumeSource]);

  const handleOptimize = async () => {
    if (!resumeText.trim()) {
      setError('Please provide or import resume text for optimization.');
      return;
    }

    setError(null);
    setLoading(true);
    setReport(null);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        setActiveStep(step);
      }
    }, 450);

    const prompt = `
      Audit the following resume details for optimization metrics. 
      Analyze the text, detect weak verbs and buzzwords, and construct an optimized model.

      RESUME TEXT:
      ${resumeText}

      Respond strictly in JSON format matching this schema:
      {
        "originalScore": number (0-100),
        "optimizedScore": number (0-100),
        "keywordScore": number (0-100),
        "formattingScore": number (0-100),
        "grammarScore": number (0-100),
        "writingScore": number (0-100),
        "strengthScore": number (0-100),
        "readabilityScore": number (0-100),
        "compatibilityScore": number (0-100),
        "addedKeywords": ["keyword1", "keyword2"],
        "removedWeakWords": ["weak1", "weak2"],
        "improvedSummary": "Optimized professional summary",
        "improvedProject": "Optimized project description with metric detail",
        "improvedVerbs": ["engineered", "spearheaded"]
      }
    `;

    try {
      const response = await generateText(
        prompt,
        'You are an expert resume optimizer and systems auditor. Refactor details into STAR format.',
        true
      );
      const parsed = JSON.parse(response);
      setReport(parsed);
      showToast('Optimization report calculated!', 'success');
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      showToast('Failed to analyze resume details. Check settings.', 'error');
    } finally {
      clearInterval(interval);
      setLoading(false);
      setActiveStep(0);
    }
  };

  const handleApplyOptimization = () => {
    if (!report) return;
    const cached = localStorage.getItem('saved_resume');
    if (!cached) return;

    try {
      const parsed = JSON.parse(cached);
      parsed.personal.summary = report.improvedSummary;
      if (parsed.projects && parsed.projects[0]) {
        parsed.projects[0].description = report.improvedProject;
      }
      // Add optimized verbs to skills if they aren't there
      report.improvedVerbs.slice(0, 3).forEach(v => {
        if (!parsed.skills.includes(v)) {
          parsed.skills.push(v);
        }
      });

      localStorage.setItem('saved_resume', JSON.stringify(parsed));
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 3000);
    } catch (e) {
      console.error('Failed to apply optimizations.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <span>AI Resume Optimizer</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Perform a diagnostic audit of your resume data and compare scores side-by-side.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {applySuccess && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs animate-bounce">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <span>Optimized summaries and verbs applied successfully to your active Resume Builder!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>Optimizing Scope</span>
            </h3>

            {/* Source */}
            <div className="space-y-2">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase">Resume Content Source</label>
              <div className="flex bg-slate-900/60 border border-slate-850 p-1 rounded-xl gap-0.5">
                <button
                  onClick={() => setResumeSource('import')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    resumeSource === 'import' ? 'bg-indigo-650 text-white' : 'text-slate-455'
                  }`}
                >
                  <Import className="w-3.5 h-3.5" />
                  Import Builder
                </button>
                <button
                  onClick={() => setResumeSource('paste')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    resumeSource === 'paste' ? 'bg-indigo-650 text-white' : 'text-slate-455'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Paste Text
                </button>
              </div>
            </div>

            {/* Resume Text */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Resume Details to Audit</label>
              <textarea
                rows={12}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume details here..."
                className="w-full glass-input text-xs"
              />
            </div>

            <button
              onClick={handleOptimize}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl text-xs transition-all shadow-lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing details...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Audit & Optimize</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Dashboard Report Panel */}
        <div ref={resultsRef} className="lg:col-span-8 space-y-6">
          {report ? (
            <div className="space-y-6">
              {/* ATS Score Comparison */}
              <div className="glass-card p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 text-center border dark:border-slate-800">
                <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850">
                  <p className="text-xs font-bold text-slate-400 uppercase">Original ATS Score</p>
                  <p className="text-4xl font-black text-slate-500 mt-2">{report.originalScore}%</p>
                  <p className="text-[10px] text-slate-500 mt-1">Before keyword alignment</p>
                </div>

                <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                  <p className="text-xs font-bold text-indigo-400 uppercase">Optimized ATS Score</p>
                  <p className="text-4xl font-black text-emerald-500 mt-2">{report.optimizedScore}%</p>
                  <p className="text-[10px] text-indigo-400 mt-1">Tailored keywords & metric upgrades</p>
                </div>
              </div>

              {/* Progress Gauges */}
              <div className="glass-card p-6 rounded-2xl space-y-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-2">Diagnostic Metrics</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Readability Index</span>
                      <span>{report.readabilityScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${report.readabilityScore}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>ATS Compatibility</span>
                      <span>{report.compatibilityScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${report.compatibilityScore}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Grammar Alignment</span>
                      <span>{report.grammarScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{ width: `${report.grammarScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Added and Removed Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Keywords Added</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {report.addedKeywords.map((w, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                        +{w}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Weak Buzzwords Removed</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {report.removedWeakWords.map((w, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded line-through">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Improved Paragraph Drafts */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-2">Refactored Statements Preview</h3>
                
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 bg-slate-900/40 rounded-xl border border-slate-850">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Optimized Professional Summary</p>
                    <p className="text-slate-300 italic">"{report.improvedSummary}"</p>
                  </div>

                  <div className="p-3.5 bg-slate-900/40 rounded-xl border border-slate-850">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Optimized Project Bullet</p>
                    <p className="text-slate-300 italic">"{report.improvedProject}"</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleApplyOptimization}
                    className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-750 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all shadow-md"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Apply Optimizer Overrides</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-16 rounded-2xl flex flex-col items-center justify-center text-center border border-dashed dark:border-slate-800 border-slate-350 h-full">
              <ShieldCheck className="w-12 h-12 text-slate-600 dark:text-slate-850 mb-3" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Improvement Analysis Dashboard</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">Import your builder data and click optimize to audit original vs optimized parameters.</p>
            </div>
          )}
        </div>
      </div>
      <AiStatusLoader
        isActive={loading}
        steps={steps}
        currentStepIndex={activeStep}
      />
    </div>
  );
};
