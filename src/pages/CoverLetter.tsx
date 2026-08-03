import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateText } from '../services/gemini';
import { exportToPDF } from '../utils/pdfExporter';
import { exportToDOCX } from '../utils/docxExporter';
import { 
  Mail, Copy, Check, AlertCircle, RefreshCw, 
  Download, FileText, Edit, Sparkles 
} from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { AiStatusLoader } from '../components/common/AiStatusLoader';

export const CoverLetter: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const resultsRef = React.useRef<HTMLDivElement | null>(null);
  
  // Inputs
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [hiringManager, setHiringManager] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [appType, setAppType] = useState<'internship' | 'job' | 'fresher' | 'experienced'>('job');
  const [template, setTemplate] = useState<'professional' | 'corporate' | 'modern' | 'minimal'>('professional');
  
  const [loading, setLoading] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI steps
  const steps = [
    "Connecting to Gemini model...",
    "Reading student profile...",
    "Parsing job description details...",
    "Drafting cover letter layout...",
    "Structuring print styles...",
    "Finalizing content output..."
  ];
  const [activeStep, setActiveStep] = useState(0);

  const handleGenerate = async () => {
    if (!companyName.trim() || !jobTitle.trim()) {
      setError('Please provide the Company Name and Target Job Role.');
      return;
    }

    setError(null);
    setLoading(true);
    setLetterContent('');

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        setActiveStep(step);
      }
    }, 400);

    const prompt = `
      Generate a professional and compelling cover letter based on the following student parameters:
      - Student Name: ${profile?.full_name || 'Alex Sparker'}
      - College: ${profile?.college_name || 'State Technical University'}
      - Department: ${profile?.department || 'Computer Science'}
      - Company Name: ${companyName}
      - Job Role: ${jobTitle}
      - Hiring Manager: ${hiringManager || 'Hiring Manager'}
      - Application Type: ${appType}
      - Target Job Details: ${jobDescription}
      - Core Skills: ${profile?.skills?.join(', ') || ''}

      Writing Rules:
      1. Structure the letter cleanly: Header, Greeting, Introduction, Background, Skills/Projects alignment, Why this Company, Closing, and Signature.
      2. Keep it under 350 words, completely professional, avoiding generic templates or repetitive clichés.
      3. Focus on how the candidate's projects align with target specifications.
    `;

    try {
      const response = await generateText(
        prompt,
        'You are an expert career consultant drafting bespoke, persuasive cover letters.'
      );
      setLetterContent(response);
      showToast('Cover letter compiled successfully!', 'success');
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      showToast('Failed to generate letter. Check your API settings.', 'error');
    } finally {
      clearInterval(interval);
      setLoading(false);
      setActiveStep(0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letterContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePDFDownload = async () => {
    try {
      await exportToPDF('cover-letter-preview', 'cover_letter.pdf');
    } catch (err) {
      console.error(err);
    }
  };

  const handleWordDownload = () => {
    try {
      exportToDOCX('cover-letter-preview', 'cover_letter.doc');
    } catch (err) {
      console.error(err);
    }
  };

  // Styles mapping for templates
  const getTemplateStyles = () => {
    switch (template) {
      case 'corporate':
        return {
          wrapper: 'bg-white text-slate-900 border-l-[10px] border-slate-800 p-12 shadow-lg min-h-[700px] font-serif',
          header: 'border-b border-slate-200 pb-4 mb-6',
          title: 'text-xl font-bold uppercase text-slate-850',
          accentText: 'text-slate-500 font-mono text-[10px]'
        };
      case 'modern':
        return {
          wrapper: 'bg-white text-slate-900 p-12 shadow-lg min-h-[700px] font-sans relative overflow-hidden',
          header: 'bg-indigo-650/5 p-4 rounded-xl border border-indigo-100 mb-6',
          title: 'text-xl font-extrabold text-indigo-950',
          accentText: 'text-indigo-600 font-semibold text-[10px]'
        };
      case 'minimal':
        return {
          wrapper: 'bg-white text-slate-900 p-12 shadow-lg min-h-[700px] font-mono text-xs leading-relaxed',
          header: 'border-b border-slate-100 pb-3 mb-6',
          title: 'text-base font-bold text-slate-900 uppercase',
          accentText: 'text-slate-400 text-[10px]'
        };
      case 'professional':
      default:
        return {
          wrapper: 'bg-white text-slate-900 p-12 shadow-lg min-h-[700px] font-sans',
          header: 'border-b-2 border-indigo-500 pb-4 mb-6',
          title: 'text-2xl font-black uppercase text-indigo-950',
          accentText: 'text-indigo-650 font-bold text-[10px]'
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div className="space-y-8">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            <span>AI Cover Letter Generator</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Draft tailored, professional cover letters and export them to PDF or Word documents.
          </p>
        </div>

        {letterContent && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 border border-slate-800 hover:bg-slate-900 text-indigo-400 font-semibold py-2 px-3 rounded-xl text-xs transition-all"
            >
              <Edit className="w-4 h-4" />
              <span>{isEditing ? 'Preview Layout' : 'Edit Text'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 border border-slate-800 hover:bg-slate-900 text-indigo-400 font-semibold py-2 px-3 rounded-xl text-xs transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleWordDownload}
              className="flex items-center gap-1.5 border border-slate-800 hover:bg-slate-900 text-indigo-400 font-semibold py-2 px-3 rounded-xl text-xs transition-all"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>DOCX</span>
            </button>

            <button
              onClick={handlePDFDownload}
              className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-755 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs Pane: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>Letter Parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full glass-input text-xs py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Target Job Role</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Frontend Intern"
                  className="w-full glass-input text-xs py-2 px-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Hiring Manager</label>
                <input
                  type="text"
                  value={hiringManager}
                  onChange={(e) => setHiringManager(e.target.value)}
                  placeholder="e.g. Jane Doe (Optional)"
                  className="w-full glass-input text-xs py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Application Type</label>
                <select
                  value={appType}
                  onChange={(e) => setAppType(e.target.value as any)}
                  className="w-full glass-input text-xs py-2 px-3"
                >
                  <option value="job">Standard Job Application</option>
                  <option value="internship">Internship Position</option>
                  <option value="fresher">Fresher Graduate Entry</option>
                  <option value="experienced">Experienced Professional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Letter Style Template</label>
              <div className="flex bg-slate-900/60 border border-slate-855 p-1 rounded-xl gap-0.5 text-xs">
                {['professional', 'corporate', 'modern', 'minimal'].map((style) => (
                  <button
                    key={style}
                    onClick={() => setTemplate(style as any)}
                    className={`flex-1 py-1.5 font-semibold rounded-lg transition-all capitalize ${
                      template === style ? 'bg-indigo-650 text-white' : 'text-slate-455'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Target Job Description</label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description details to align project keywords..."
                className="w-full glass-input text-xs"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl text-xs transition-all shadow-lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Drafting Cover Letter...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Letter</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Preview canvas: 7 cols */}
        <div ref={resultsRef} className="lg:col-span-7 flex justify-center bg-slate-90/10 p-4 rounded-2xl overflow-x-auto">
          {letterContent ? (
            <div className="w-full max-w-[210mm] relative">
              {isEditing ? (
                <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Edit Letter Wording</label>
                  <textarea
                    rows={22}
                    value={letterContent}
                    onChange={(e) => setLetterContent(e.target.value)}
                    className="w-full p-4 border border-slate-300 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ) : (
                <div 
                  id="cover-letter-preview"
                  className={styles.wrapper}
                >
                  {/* Header info */}
                  <div className={styles.header}>
                    <h1 className={styles.title}>{profile?.full_name || 'Alex Sparker'}</h1>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 mt-2">
                      <span>✉️ {profile?.email}</span>
                      <span>📞 {profile?.phone || '+1 (555) 123-4567'}</span>
                      <span>📍 {profile?.location || 'San Francisco, CA'}</span>
                    </div>
                  </div>

                  {/* Body text content */}
                  <div className="text-xs leading-relaxed text-slate-800 space-y-4 whitespace-pre-line">
                    <p className="font-semibold text-slate-900">
                      Date: {new Date().toLocaleDateString()}<br />
                      To: {hiringManager || 'Hiring Manager'}<br />
                      {companyName && `Company: ${companyName}`}
                    </p>

                    <p className="mt-4 font-bold text-slate-900 border-b border-slate-100 pb-1 uppercase tracking-wide">
                      RE: Application for the {jobTitle || 'Target Position'} position
                    </p>

                    <p className="mt-2 text-slate-700">
                      {letterContent}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-16 rounded-2xl flex flex-col items-center justify-center text-center border border-dashed dark:border-slate-800 border-slate-350 h-full w-full">
              <Mail className="w-12 h-12 text-slate-655 dark:text-slate-855 mb-3" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Cover Letter Canvas</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">Configure company particulars on the left and run generator to compile A4 styled letters.</p>
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
