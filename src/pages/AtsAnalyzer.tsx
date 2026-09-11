import React, { useState, useRef } from 'react';
import { generateText } from '../services/gemini';
import { extractTextFromFile } from '../utils/fileExtractor';
import { computeAtsScore } from '../utils/atsEngine';
import type { AtsReport } from '../utils/atsEngine';
import { FileUploadZone } from '../components/common/FileUploadZone';
import { AiStatusLoader } from '../components/common/AiStatusLoader';
import { useToast } from '../components/common/Toast';
import { 
  BarChart3, Sparkles, 
  BookOpen, RefreshCw, Check, ShieldAlert, Lightbulb
} from 'lucide-react';

export const AtsAnalyzer: React.FC = () => {
  const { showToast } = useToast();
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AtsReport | null>(null);
  const [showPaste, setShowPaste] = useState(false);

  // AI Suggestions State
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // AI steps
  const scanSteps = [
    "Reading resume layout...",
    "Extracting profile text...",
    "Analyzing target job requirements...",
    "Checking domain & keyword alignment...",
    "Evaluating domain mismatch risks...",
    "Generating final ATS scorecard..."
  ];
  const [activeScanStep, setActiveScanStep] = useState(0);

  const suggestionSteps = [
    "Connecting to Gemini model...",
    "Auditing bullet structures...",
    "Formulating keyword injections...",
    "Finalizing markdown report..."
  ];
  const [activeSuggestionStep, setActiveSuggestionStep] = useState(0);

  const handleScan = async () => {
    if (!jobDescription.trim()) {
      showToast('Please provide target job requirements first.', 'warning');
      return;
    }
    if (!resumeText.trim()) {
      showToast('Please upload your resume file or paste text.', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);
    setAiSuggestions(null);
    
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % scanSteps.length;
      setActiveScanStep(step);
    }, 400);

    try {
      await new Promise(r => setTimeout(r, 1200));
      const scoreReport = computeAtsScore(resumeText, jobDescription);
      setResult(scoreReport);
      showToast(`Scan completed successfully! ATS Score: ${scoreReport.score}%`, 'success');
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      showToast('Failed to analyze resume details. Please try again.', 'error');
    } finally {
      clearInterval(interval);
      setLoading(false);
      setActiveScanStep(0);
    }
  };

  const generateAiSuggestions = async () => {
    if (!result) return;
    setAiLoading(true);
    setAiSuggestions(null);

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % suggestionSteps.length;
      setActiveSuggestionStep(step);
    }, 500);

    const prompt = `
      Based on the following ATS Scan Results, write 4 high-quality tailored resume suggestions:
      - Resume Domain: ${result.resumeDomain}
      - Target Job Domain: ${result.jobDomain}
      - Missing Keywords: ${result.missingKeywords.join(', ')}
      - Skills Missing: ${result.skillsMissingFromJd.join(', ')}

      Provide recommendations in these 4 areas:
      1. Professional Summary alignment for ${result.jobDomain}
      2. Project Description Improvement (incorporating missing keywords)
      3. Specific action verbs to add
      4. ATS formatting suggestions.

      Respond in clear, professional markdown bullet points.
    `;

    try {
      const response = await generateText(
        prompt,
        'You are an expert technical resume writer. Provide highly actionable, bulleted rewrites.'
      );
      setAiSuggestions(response);
      showToast('AI suggestions computed successfully!', 'success');
    } catch (err) {
      showToast('Failed to generate suggestions. Please check settings.', 'error');
    } finally {
      clearInterval(interval);
      setAiLoading(false);
      setActiveSuggestionStep(0);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-rose-500 stroke-rose-500';
    if (score < 75) return 'text-orange-500 stroke-orange-500';
    return 'text-emerald-500 stroke-emerald-500';
  };

  return (
    <div className="space-y-8 text-xs leading-normal">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-500" />
          <span>ATS Resume & Domain Analyzer</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Audits resume keyword relationship against target job descriptions and enforces strict domain suitability rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs Pane */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-3 flex items-center justify-between">
              <span>Target Job Requirements</span>
            </h3>

            {/* Job Description Textarea */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Target Job Description</label>
              <textarea
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste target job requirements (e.g. Full Stack Engineer, HR Manager, UI/UX)..."
                className="w-full glass-input text-xs"
              />
            </div>

            {/* Resume Upload Dropzone */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Upload Resume Document</label>
              
              {!showPaste && (
                <FileUploadZone
                  acceptTypes={['.pdf', '.docx', '.txt']}
                  maxSizeMB={5}
                  onUploadComplete={async (url, name) => {
                    setUploading(true);
                    try {
                      const response = await fetch(url);
                      const blob = await response.blob();
                      const mockFile = new File([blob], name);
                      const text = await extractTextFromFile(mockFile);
                      setResumeText(text);
                      showToast('Resume parsed successfully!', 'success');
                    } catch (e) {
                      showToast('Text extraction failed. Try pasting manually.', 'warning');
                    } finally {
                      setUploading(false);
                    }
                  }}
                  label="Drop Resume PDF/DOCX here"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPaste(!showPaste)}
                className="text-[10px] text-teal-600 dark:text-teal-400 hover:text-emerald-500 hover:underline font-semibold cursor-pointer"
              >
                {showPaste ? 'Hide plain text input' : 'Paste resume text directly instead'}
              </button>
            </div>

            {showPaste && (
              <div className="space-y-2">
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Paste Resume Text</label>
                <textarea
                  rows={6}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste plain text resume content..."
                  className="w-full glass-input text-[11px] font-mono"
                />
              </div>
            )}

            <button
              onClick={handleScan}
              disabled={loading || uploading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-950/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing Resume Alignment...</span>
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  <span>Scan Resume Compliance</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Results Pane */}
        <div ref={resultsRef} className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Score summary card */}
              <div className="glass-card p-6 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Circular Gauge */}
                <div className="md:col-span-5 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#143D32] pb-4 md:pb-0 md:pr-4">
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle 
                        className="text-slate-200 dark:text-[#0B2A22] stroke-current" 
                        strokeWidth="8" 
                        fill="transparent" 
                        r="38" 
                        cx="50" 
                        cy="50" 
                      />
                      <circle 
                        className={`${getScoreColor(result.score)} stroke-current`} 
                        strokeWidth="8" 
                        strokeDasharray={2 * Math.PI * 38}
                        strokeDashoffset={(1 - result.score / 100) * (2 * Math.PI * 38)}
                        strokeLinecap="round"
                        fill="transparent" 
                        r="38" 
                        cx="50" 
                        cy="50" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{result.score}%</span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-semibold">ATS Match</span>
                    </div>
                  </div>
                </div>

                {/* Domain Match results */}
                <div className="md:col-span-7 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sector & Domain Classification</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Resume Domain:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{result.resumeDomain}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Target Job Sector:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{result.jobDomain}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-200 dark:border-[#143D32] pt-2">
                      <span className="text-slate-500 dark:text-slate-400">Domain Status:</span>
                      {result.domainMatch ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">
                          <Check className="w-3.5 h-3.5" /> Domain Aligned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded">
                          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> DOMAIN MISMATCH
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* DOMAIN MISMATCH Alert Box */}
              {!result.domainMatch && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs flex gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm">DOMAIN MISMATCH REPORTED</p>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {result.mismatchReason || `Your resume is tailored for ${result.resumeDomain}, but the job description requires ${result.jobDomain}. The engine does NOT artificially produce high ATS scores for mismatched career sectors.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Matched vs Missing vs Irrelevant Skills Breakdown */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-2">Skills & Keywords Breakdown</h3>
                
                {/* Present Skills */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Skills Already Present ({result.skillsPresent.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.skillsPresent.map((s, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills from JD */}
                <div className="space-y-1.5 pt-2">
                  <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase">Skills Missing From Job Description ({result.skillsMissingFromJd.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.skillsMissingFromJd.map((s, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-orange-500/10 border border-orange-500/25 text-orange-600 dark:text-orange-300 px-2 py-0.5 rounded">
                        ⚠ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Irrelevant Skills */}
                {result.irrelevantSkillsNotToAdd.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase">Skills NOT Relevant (Do NOT Add to Resume)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.irrelevantSkillsNotToAdd.map((s, i) => (
                        <span key={i} className="text-[10px] font-semibold bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 px-2 py-0.5 rounded line-through">
                          ✗ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommended Keywords with Granular Explanations */}
              {result.recommendedKeywords.length > 0 && (
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-orange-400" />
                    <span>Keyword Rationale & Suggested Locations</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {result.recommendedKeywords.map((item, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 dark:bg-[#071C17] border border-slate-200 dark:border-[#143D32] rounded-xl space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-teal-600 dark:text-teal-400 uppercase text-[11px]">{item.keyword}</span>
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">{item.jdSection}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-sans"><strong className="text-slate-900 dark:text-slate-100">Why Suggested:</strong> {item.reason}</p>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]"><strong className="text-slate-800 dark:text-slate-200">Where to Add:</strong> {item.suggestedLocation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggestions button */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#143D32] pb-3">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <span>AI Tailoring Report</span>
                  </h3>
                  <button
                    onClick={generateAiSuggestions}
                    disabled={aiLoading}
                    className="flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-emerald-500 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiLoading ? 'Drafting suggestions...' : 'Get AI Suggestions'}</span>
                  </button>
                </div>

                {aiSuggestions && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071C17] border border-slate-200 dark:border-[#143D32] text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {aiSuggestions}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-16 rounded-2xl flex flex-col items-center justify-center text-center h-full border border-dashed border-slate-300 dark:border-[#143D32]">
              <BarChart3 className="w-12 h-12 text-slate-400 dark:text-emerald-500/40 mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Scan Report Offline</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1.5">
                Upload your resume file and paste target requirements to audit category scoring and keyword gaps.
              </p>
            </div>
          )}
        </div>
      </div>

      <AiStatusLoader
        isActive={loading}
        steps={scanSteps}
        currentStepIndex={activeScanStep}
      />
      <AiStatusLoader
        isActive={aiLoading}
        steps={suggestionSteps}
        currentStepIndex={activeSuggestionStep}
      />
    </div>
  );
};
