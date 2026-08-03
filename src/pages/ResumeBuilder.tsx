import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { exportToPDF } from '../utils/pdfExporter';
import { exportToDOCX } from '../utils/docxExporter';
import { PhotoCropModal } from '../components/resume/PhotoCropModal';
import { extractTextFromFile } from '../utils/fileExtractor';
import { parseRawTextToResume } from '../utils/resumeParser';
import { 
  FileText, Download, Save, Trash2, Plus, Upload,
  AlertTriangle, CheckCircle, Sparkles, History, RefreshCw 
} from 'lucide-react';

interface ResumeData {
  title: string;
  template: 'modern' | 'ats_minimal' | 'corporate' | 'fresher' | 'software_engineer';
  photoUrl: string;
  showPhoto: boolean;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    title: string;
    summary: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  experience: Array<{
    id: string;
    company: string;
    role: string;
    start: string;
    end: string;
    desc: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string;
    githubLink: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    department: string;
    cgpa: string;
    start: string;
    end: string;
  }>;
  skills: string[];
  extraSkills: string[];
  languages: string[];
  certifications: string[];
  achievements: string[];
}

interface SavedVersion {
  id: string;
  name: string;
  timestamp: string;
  data: ResumeData;
}

export const ResumeBuilder: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [deleteTarget, setDeleteTarget] = useState<{ type: 'experience' | 'project' | 'education' | 'version'; id: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<string>('');
  
  // Layout states
  const [fontSize, setFontSize] = useState<number>(12); // px
  const [margin, setMargin] = useState<number>(16); // px
  const [sectionSpacing, setSectionSpacing] = useState<number>(12); // px
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  // Crop Photo States
  const [showCrop, setShowCrop] = useState(false);
  const [rawImage, setRawImage] = useState<string>('');
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // Resume Document Import States
  const resumeFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleResumeImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const text = await extractTextFromFile(file);
      const parsed = parseRawTextToResume(text);
      setResume(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          ...parsed.personal
        },
        education: parsed.education.length ? parsed.education : prev.education,
        experience: parsed.experience.length ? parsed.experience : prev.experience,
        projects: parsed.projects.length ? parsed.projects : prev.projects,
        skills: parsed.skills.length ? parsed.skills : prev.skills,
      }));
      showToast(`Successfully parsed "${file.name}"! All extracted fields are now editable below.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to extract resume content.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // Selected Tab in Editor
  const [activeTab, setActiveTab] = useState<'content' | 'templates' | 'format' | 'assistant' | 'history'>('content');

  // Version History States
  const [versions, setVersions] = useState<SavedVersion[]>([]);
  const [versionName, setVersionName] = useState('');
  const [compareVersion, setCompareVersion] = useState<SavedVersion | null>(null);

  // Resume Data State seed from profile
  const [resume, setResume] = useState<ResumeData>({
    title: 'My Resume',
    template: 'modern',
    photoUrl: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    showPhoto: true,
    personal: {
      fullName: profile?.full_name || 'Alex Sparker',
      email: profile?.email || 'alex@university.edu',
      phone: profile?.phone || '+1 (555) 123-4567',
      location: profile?.location || 'San Francisco, CA',
      title: profile?.headline || 'Full Stack Engineering Student',
      summary: profile?.objective || 'CS undergraduate with experience building React web applications.',
      linkedin: profile?.linkedin_url || 'linkedin.com/in/alex',
      github: profile?.github_url || 'github.com/alex',
      portfolio: profile?.portfolio_url || 'alex.dev'
    },
    experience: [
      { id: '1', company: 'TechSolutions Inc.', role: 'Software Engineer Intern', start: '2025-06', end: '2025-08', desc: 'Maintained core UI components using React and styled layout containers with Tailwind CSS.' }
    ],
    projects: [
      { id: '1', title: 'Career Spark AI', description: 'Platform optimized to scan and rephrase resume details dynamically.', technologies: 'React, Tailwind, Gemini API', githubLink: 'github.com/alex/career-spark' }
    ],
    education: [
      { id: '1', school: profile?.college_name || 'State Technical University', degree: profile?.degree || 'Bachelor of Science', department: profile?.department || 'Computer Science', cgpa: profile?.cgpa?.toString() || '3.8', start: '2023', end: '2027' }
    ],
    skills: profile?.skills || ['React', 'TypeScript', 'Node.js', 'Python', 'SQL'],
    extraSkills: profile?.extra_skills || ['Docker', 'Git', 'Figma'],
    languages: profile?.languages_known || ['English', 'Spanish'],
    certifications: profile?.certifications || ['AWS Certified Cloud Practitioner'],
    achievements: profile?.achievements || ['1st Place Hackathon Winner']
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Monitor height overflow on state edits
  useEffect(() => {
    const checkHeight = () => {
      const el = previewRef.current;
      if (!el) return;
      setIsOverflowing(el.scrollHeight > 1122);
    };
    checkHeight();
    
    // Auto save triggers on data modifications
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem('saved_resume', JSON.stringify(resume));
      setSaveStatus('saved');
      setLastSaved(new Date().toLocaleTimeString());
    }, 1200);

    return () => clearTimeout(timer);
  }, [resume, fontSize, margin, sectionSpacing]);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    if (type === 'experience') {
      setResume(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
      showToast('Experience section entry removed.', 'info');
    } else if (type === 'project') {
      setResume(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
      showToast('Project section entry removed.', 'info');
    } else if (type === 'education') {
      setResume(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
      showToast('Education section entry removed.', 'info');
    } else if (type === 'version') {
      const updated = versions.filter(v => v.id !== id);
      setVersions(updated);
      localStorage.setItem('resume_versions', JSON.stringify(updated));
      showToast('Backup version draft deleted.', 'info');
    }
    setDeleteTarget(null);
  };

  // Load from local cache & versions history
  useEffect(() => {
    const cached = localStorage.getItem('saved_resume');
    if (cached) {
      try {
        setResume(JSON.parse(cached));
      } catch (e) {
        console.error('Failed to parse cached resume.');
      }
    }

    const cachedVersions = localStorage.getItem('resume_versions');
    if (cachedVersions) {
      try {
        setVersions(JSON.parse(cachedVersions));
      } catch (e) {
        console.error('Failed to load version history.');
      }
    }
  }, []);

  // Sync to database profile context
  const handleProfileSync = () => {
    updateProfile({
      full_name: resume.personal.fullName,
      email: resume.personal.email,
      phone: resume.personal.phone,
      location: resume.personal.location,
      headline: resume.personal.title,
      objective: resume.personal.summary,
      skills: resume.skills,
      extra_skills: resume.extraSkills,
      languages_known: resume.languages,
      certifications: resume.certifications,
      achievements: resume.achievements,
      avatar_url: resume.photoUrl
    });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBase64: string) => {
    setResume(prev => ({ ...prev, photoUrl: croppedBase64 }));
    setShowCrop(false);
  };

  const handlePDFDownload = async () => {
    try {
      await exportToPDF('resume-preview-canvas', `${resume.personal.fullName.replace(/\s+/g, '_')}_resume.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWordDownload = () => {
    try {
      exportToDOCX('resume-preview-canvas', `${resume.personal.fullName.replace(/\s+/g, '_')}_resume.doc`);
    } catch (err) {
      console.error(err);
    }
  };

  // Version History Actions
  const handleSaveVersion = () => {
    if (!versionName.trim()) return;
    const newVer: SavedVersion = {
      id: Date.now().toString(),
      name: versionName.trim(),
      timestamp: new Date().toLocaleString(),
      data: { ...resume }
    };
    const updated = [newVer, ...versions];
    setVersions(updated);
    localStorage.setItem('resume_versions', JSON.stringify(updated));
    setVersionName('');
  };

  const handleRestoreVersion = (ver: SavedVersion) => {
    setResume(ver.data);
  };

  // Helper arrays update methods
  const addExperience = () => {
    setResume(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now().toString(), company: '', role: '', start: '', end: '', desc: '' }]
    }));
  };

  const addProject = () => {
    setResume(prev => ({
      ...prev,
      projects: [...prev.projects, { id: Date.now().toString(), title: '', description: '', technologies: '', githubLink: '' }]
    }));
  };

  const addEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now().toString(), school: '', degree: '', department: '', cgpa: '', start: '', end: '' }]
    }));
  };

  // Real-time Assistant Analysis
  const detectBuzzwords = () => {
    const text = JSON.stringify(resume).toLowerCase();
    const buzzwords = ['synergy', 'detail-oriented', 'team player', 'go-getter', 'thought leader', 'results-driven', 'motivated'];
    return buzzwords.filter(bw => text.includes(bw));
  };

  const checkWeakVerbs = () => {
    const text = JSON.stringify(resume).toLowerCase();
    const weakVerbs = ['worked on', 'made', 'helped', 'assisted', 'managed', 'did'];
    return weakVerbs.filter(wv => text.includes(wv));
  };

  const detectedBuzzwords = detectBuzzwords();
  const detectedWeakVerbs = checkWeakVerbs();

  return (
    <div className="space-y-8">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <span>AI Resume Builder</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build strict A4 one-page resumes and optimize spacing parameters dynamically.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <span className="text-[10px] text-slate-450 font-semibold uppercase flex items-center gap-1.5 bg-slate-900/40 px-2 py-1.5 rounded border border-slate-850">
            {saveStatus === 'saved' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
            {saveStatus === 'saving' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />}
            {saveStatus === 'saving' ? 'Auto-saving...' : `Saved Successfully (Last saved: ${lastSaved || 'Synced'})`}
          </span>

          <input
            type="file"
            ref={resumeFileInputRef}
            onChange={handleResumeImportFile}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />

          <button
            onClick={() => resumeFileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-1.5 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 font-semibold py-2 px-3 rounded-xl text-xs transition-all cursor-pointer"
          >
            {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{isImporting ? 'Parsing...' : 'Import Resume (PDF/DOCX)'}</span>
          </button>

          <button
            onClick={handleProfileSync}
            className="flex items-center gap-1.5 border border-slate-800 hover:bg-slate-900 text-indigo-400 font-semibold py-2 px-3 rounded-xl text-xs transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Sync to Profile</span>
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
            className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-750 text-white font-semibold py-2 px-4.5 rounded-xl text-xs transition-all shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {isOverflowing && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-xs animate-pulse">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">A4 Single Page Height Overflow Warning</p>
            <p className="text-[11px] text-red-300 leading-normal">
              Your resume height exceeds standard A4 paper boundaries. Spacers may push sections onto Page 2. 
              Reduce font size, section padding, or trim bullet details inside the "Formatting" panel.
            </p>
          </div>
        </div>
      )}

      {/* Editor & Preview Split Screen */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Editor controls: 5 cols */}
        <div className="xl:col-span-5 space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap bg-slate-900/60 border border-slate-850 p-1 rounded-xl gap-0.5">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                activeTab === 'content' ? 'bg-indigo-650 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Data
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                activeTab === 'templates' ? 'bg-indigo-650 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('format')}
              className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all ${
                activeTab === 'format' ? 'bg-indigo-650 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Margins
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'assistant' ? 'bg-indigo-650 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'history' ? 'bg-indigo-650 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          </div>

          {/* TAB 1: Content fields form */}
          {activeTab === 'content' && (
            <div className="glass-card p-6 rounded-2xl space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Photo Upload & Name */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-2">Header Info</h4>
                
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <img 
                      src={resume.photoUrl} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                    />
                    <input 
                      type="file" 
                      ref={photoInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-semibold transition-all"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex-1 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="showPhoto"
                        checked={resume.showPhoto}
                        onChange={(e) => setResume(prev => ({ ...prev, showPhoto: e.target.checked }))}
                        className="rounded accent-indigo-500"
                      />
                      <label htmlFor="showPhoto" className="text-slate-400">Display Passport Photo on Resume</label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      value={resume.personal.fullName}
                      onChange={(e) => setResume(prev => ({ ...prev, personal: { ...prev.personal, fullName: e.target.value } }))}
                      className="w-full glass-input text-xs py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-455 uppercase mb-1">Professional Title</label>
                    <input
                      type="text"
                      value={resume.personal.title}
                      onChange={(e) => setResume(prev => ({ ...prev, personal: { ...prev.personal, title: e.target.value } }))}
                      className="w-full glass-input text-xs py-2 px-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1">Email</label>
                    <input
                      type="text"
                      value={resume.personal.email}
                      onChange={(e) => setResume(prev => ({ ...prev, personal: { ...prev.personal, email: e.target.value } }))}
                      className="w-full glass-input text-[11px] py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1">Phone</label>
                    <input
                      type="text"
                      value={resume.personal.phone}
                      onChange={(e) => setResume(prev => ({ ...prev, personal: { ...prev.personal, phone: e.target.value } }))}
                      className="w-full glass-input text-[11px] py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1">Location</label>
                    <input
                      type="text"
                      value={resume.personal.location}
                      onChange={(e) => setResume(prev => ({ ...prev, personal: { ...prev.personal, location: e.target.value } }))}
                      className="w-full glass-input text-[11px] py-2 px-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1">LinkedIn</label>
                    <input
                      type="text"
                      value={resume.personal.linkedin}
                      onChange={(e) => setResume(prev => ({ ...prev, personal: { ...prev.personal, linkedin: e.target.value } }))}
                      className="w-full glass-input text-[11px] py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1">GitHub</label>
                    <input
                      type="text"
                      value={resume.personal.github}
                      onChange={(e) => setResume(prev => ({ ...prev, personal: { ...prev.personal, github: e.target.value } }))}
                      className="w-full glass-input text-[11px] py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1">Portfolio</label>
                    <input
                      type="text"
                      value={resume.personal.portfolio}
                      onChange={(e) => setResume(prev => ({ ...prev, personal: { ...prev.personal, portfolio: e.target.value } }))}
                      className="w-full glass-input text-[11px] py-2 px-3"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-450 uppercase mb-1">Professional Summary</label>
                  <textarea
                    rows={2}
                    value={resume.personal.summary}
                    onChange={(e) => setResume(prev => ({ ...prev, personal: { ...prev.personal, summary: e.target.value } }))}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </div>

              {/* Education section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Education</h4>
                  <button onClick={addEducation} className="text-[10px] text-indigo-400 flex items-center gap-0.5"><Plus className="w-3.5 h-3.5" /> Add</button>
                </div>

                {resume.education.map((edu) => (
                  <div key={edu.id} className="p-4 rounded-xl border dark:border-slate-900 border-slate-200 space-y-3 relative">
                    <button
                      onClick={() => setDeleteTarget({ type: 'education', id: edu.id })}
                      className="absolute top-2 right-2 text-slate-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[9px] uppercase text-slate-500">School/College</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume(prev => ({
                              ...prev,
                              education: prev.education.map(item => item.id === edu.id ? { ...item, school: val } : item)
                            }));
                          }}
                          className="w-full glass-input py-1.5 px-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-slate-500">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume(prev => ({
                              ...prev,
                              education: prev.education.map(item => item.id === edu.id ? { ...item, degree: val } : item)
                            }));
                          }}
                          className="w-full glass-input py-1.5 px-2.5 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[9px] uppercase text-slate-500">Major/Department</label>
                        <input
                          type="text"
                          value={edu.department}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume(prev => ({
                              ...prev,
                              education: prev.education.map(item => item.id === edu.id ? { ...item, department: val } : item)
                            }));
                          }}
                          className="w-full glass-input py-1.5 px-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-slate-500">CGPA</label>
                        <input
                          type="text"
                          value={edu.cgpa}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume(prev => ({
                              ...prev,
                              education: prev.education.map(item => item.id === edu.id ? { ...item, cgpa: val } : item)
                            }));
                          }}
                          className="w-full glass-input py-1.5 px-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-slate-500">Graduation Year</label>
                        <input
                          type="text"
                          value={edu.end}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume(prev => ({
                              ...prev,
                              education: prev.education.map(item => item.id === edu.id ? { ...item, end: val } : item)
                            }));
                          }}
                          className="w-full glass-input py-1.5 px-2.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Experience list section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Experience</h4>
                  <button onClick={addExperience} className="text-[10px] text-indigo-400 flex items-center gap-0.5"><Plus className="w-3.5 h-3.5" /> Add</button>
                </div>

                {resume.experience.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-xl border dark:border-slate-900 border-slate-200 space-y-3 relative">
                    <button
                      onClick={() => setDeleteTarget({ type: 'experience', id: exp.id })}
                      className="absolute top-2 right-2 text-slate-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[9px] uppercase text-slate-500">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume(prev => ({
                              ...prev,
                              experience: prev.experience.map(item => item.id === exp.id ? { ...item, company: val } : item)
                            }));
                          }}
                          className="w-full glass-input py-1.5 px-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-slate-500">Role</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume(prev => ({
                              ...prev,
                              experience: prev.experience.map(item => item.id === exp.id ? { ...item, role: val } : item)
                            }));
                          }}
                          className="w-full glass-input py-1.5 px-2.5 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[9px] uppercase text-slate-500">Start Date</label>
                        <input
                          type="text"
                          value={exp.start}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume(prev => ({
                              ...prev,
                              experience: prev.experience.map(item => item.id === exp.id ? { ...item, start: val } : item)
                            }));
                          }}
                          className="w-full glass-input py-1.5 px-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-slate-500">End Date</label>
                        <input
                          type="text"
                          value={exp.end}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume(prev => ({
                              ...prev,
                              experience: prev.experience.map(item => item.id === exp.id ? { ...item, end: val } : item)
                            }));
                          }}
                          className="w-full glass-input py-1.5 px-2.5 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase text-slate-500">Description</label>
                      <textarea
                        rows={3}
                        value={exp.desc}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResume(prev => ({
                            ...prev,
                            experience: prev.experience.map(item => item.id === exp.id ? { ...item, desc: val } : item)
                          }));
                        }}
                        className="w-full glass-input text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Projects section */}
              <div className="space-y-4 pt-4 border-t dark:border-slate-850">
                <div className="flex justify-between items-center border-b dark:border-slate-800 pb-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Projects</h4>
                  <button onClick={addProject} className="text-[10px] text-indigo-400 flex items-center gap-0.5"><Plus className="w-3.5 h-3.5" /> Add</button>
                </div>

                {resume.projects.map((proj) => (
                  <div key={proj.id} className="p-4 rounded-xl border dark:border-slate-900 border-slate-200 space-y-3 relative">
                    <button
                      onClick={() => setDeleteTarget({ type: 'project', id: proj.id })}
                      className="absolute top-2 right-2 text-slate-500 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[9px] uppercase text-slate-500">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume(prev => ({
                              ...prev,
                              projects: prev.projects.map(item => item.id === proj.id ? { ...item, title: val } : item)
                            }));
                          }}
                          className="w-full glass-input py-1.5 px-2.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-slate-500">GitHub Link</label>
                        <input
                          type="text"
                          value={proj.githubLink}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume(prev => ({
                              ...prev,
                              projects: prev.projects.map(item => item.id === proj.id ? { ...item, githubLink: val } : item)
                            }));
                          }}
                          className="w-full glass-input py-1.5 px-2.5 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-xs">
                      <div>
                        <label className="block text-[9px] uppercase text-slate-500">Technologies</label>
                        <input
                          type="text"
                          value={proj.technologies}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume(prev => ({
                              ...prev,
                              projects: prev.projects.map(item => item.id === proj.id ? { ...item, technologies: val } : item)
                            }));
                          }}
                          className="w-full glass-input py-1.5 px-2.5 text-xs"
                          placeholder="React, TypeScript, Node"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-slate-500">Description</label>
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setResume(prev => ({
                              ...prev,
                              projects: prev.projects.map(item => item.id === proj.id ? { ...item, description: val } : item)
                            }));
                          }}
                          className="w-full glass-input text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Template Selection */}
          {activeTab === 'templates' && (
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-2">Select Template style</h3>
              
              <div className="space-y-3">
                {[
                  { id: 'modern', name: 'Modern Professional', desc: 'Sleek design, dual columns with sidebar highlights.' },
                  { id: 'ats_minimal', name: 'ATS Minimal', desc: 'Top-tier parsing compatibility. Structured single-column.' },
                  { id: 'corporate', name: 'Corporate Layout', desc: 'Clean lines, traditional layout suitable for finance/business.' },
                  { id: 'fresher', name: 'Fresher Starter', desc: 'Prioritizes college majors, academics, and projects first.' },
                  { id: 'software_engineer', name: 'Software Engineer', desc: 'Focuses on tools grid matrices and custom developer metrics.' },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => setResume(prev => ({ ...prev, template: tpl.id as any }))}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      resume.template === tpl.id 
                        ? 'border-indigo-500 bg-indigo-500/5' 
                        : 'border-slate-855 hover:border-slate-700 bg-transparent'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-200">{tpl.name}</p>
                    <p className="text-[10px] text-slate-450 mt-1">{tpl.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Formatting & Margins */}
          {activeTab === 'format' && (
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-2">A4 Page Formatting Controls</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Base Font Size</span>
                    <span className="font-mono text-slate-300">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="14"
                    step="0.5"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <p className="text-[9px] text-slate-500 mt-1">Adjust to ensure all items fit on one page.</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Page Margins</span>
                    <span className="font-mono text-slate-300">{margin}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="28"
                    step="1"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Section Spacing</span>
                    <span className="font-mono text-slate-300">{sectionSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="20"
                    step="1"
                    value={sectionSpacing}
                    onChange={(e) => setSectionSpacing(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI Writing Assistant */}
          {activeTab === 'assistant' && (
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Writing Diagnostics</span>
              </h3>

              {/* Buzzwords Alert */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Buzzwords Checked:</span>
                  <span className="font-semibold text-slate-350">{detectedBuzzwords.length} Flagged</span>
                </div>
                {detectedBuzzwords.length > 0 ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-400 space-y-1">
                    <p className="font-bold">Avoid Generic Clichés:</p>
                    <p className="leading-relaxed">
                      We detected: <span className="font-mono underline">{detectedBuzzwords.join(', ')}</span>. 
                      Try substituting these with measurable action verbs.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400">
                    ✨ No buzzwords flagged. Your terminology is professional!
                  </div>
                )}
              </div>

              {/* Weak Verbs Suggestion */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Weak Verbs Flagged:</span>
                  <span className="font-semibold text-slate-350">{detectedWeakVerbs.length} Found</span>
                </div>
                {detectedWeakVerbs.length > 0 ? (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 space-y-2">
                    <p className="font-bold">Upgrade Weak Starters:</p>
                    <p>Found phrases: <span className="font-mono">{detectedWeakVerbs.join(', ')}</span>.</p>
                    <p className="text-[9px] text-red-300 leading-normal">
                      Instead of "worked on", try <span className="font-bold">spearheaded</span> or <span className="font-bold">engineered</span>. 
                      Instead of "helped", try <span className="font-bold">facilitated</span> or <span className="font-bold">collaborated</span>.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400">
                    🚀 Great action verbs used. Strong statement impact!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Version History */}
          {activeTab === 'history' && (
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-400" />
                <span>Resume Version Manager</span>
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Draft before scan"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="flex-1 glass-input py-2 px-3 text-xs"
                />
                <button
                  onClick={handleSaveVersion}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl text-xs"
                >
                  Save Draft
                </button>
              </div>

              <div className="space-y-3">
                {versions.map((ver) => (
                  <div key={ver.id} className="p-3 rounded-xl border dark:border-slate-850 border-slate-200 bg-slate-900/10 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-250 truncate">{ver.name}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">{ver.timestamp}</p>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleRestoreVersion(ver)}
                        className="text-[10px] font-bold text-indigo-400 hover:underline"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => setCompareVersion(ver)}
                        className="text-[10px] font-bold text-slate-450 hover:underline ml-1"
                      >
                        Compare
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'version', id: ver.id })}
                        className="text-red-500 hover:text-red-400 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {versions.length === 0 && (
                  <p className="text-[10px] text-slate-500 italic text-center">No backup drafts saved yet. Snapshot your resume status above.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preview Canvas: 7 cols */}
        <div className="xl:col-span-7 flex justify-center bg-slate-900/10 p-4 rounded-2xl overflow-x-auto">
          {/* Strict A4 boundaries */}
          <div 
            id="resume-preview-canvas"
            ref={previewRef}
            className="bg-white text-slate-900 shadow-2xl relative select-none box-border flex flex-col justify-between"
            style={{
              width: '210mm',
              height: '297mm',
              minWidth: '210mm',
              minHeight: '297mm',
              padding: `${margin}px`,
              fontSize: `${fontSize}px`,
              lineHeight: '1.4'
            }}
          >
            {/* Inner Content Render */}
            <div className="flex-1 flex flex-col justify-start">
              {/* Photo top-right fixed positioning */}
              {resume.showPhoto && resume.photoUrl && (
                <img 
                  src={resume.photoUrl} 
                  alt="Passport" 
                  className="absolute border border-slate-300 object-cover shadow-sm"
                  style={{
                    top: `${margin}px`,
                    right: `${margin}px`,
                    width: '32mm',
                    height: '40mm',
                    borderRadius: '2px'
                  }}
                />
              )}

              {/* Header template dependent */}
              <div 
                className="border-b-2 border-indigo-500 pb-3"
                style={{ 
                  marginRight: resume.showPhoto ? '36mm' : '0',
                  marginBottom: `${sectionSpacing}px`
                }}
              >
                <h1 className="text-2xl font-black uppercase tracking-tight text-indigo-955">{resume.personal.fullName}</h1>
                <p className="text-sm font-bold text-indigo-650 mt-0.5">{resume.personal.title}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 mt-2">
                  <span>📍 {resume.personal.location}</span>
                  <span>📞 {resume.personal.phone}</span>
                  <span>✉️ {resume.personal.email}</span>
                  {resume.personal.linkedin && <span>🔗 {resume.personal.linkedin}</span>}
                  {resume.personal.github && <span>💻 {resume.personal.github}</span>}
                  {resume.personal.portfolio && <span>🌐 {resume.personal.portfolio}</span>}
                </div>
              </div>

              {/* Professional Summary */}
              {resume.personal.summary && (
                <div style={{ marginBottom: `${sectionSpacing}px` }}>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Professional Summary</h3>
                  <p className="text-slate-655 mt-1.5 leading-relaxed text-[11px]">{resume.personal.summary}</p>
                </div>
              )}

              {/* Template Render Logic */}
              {resume.template === 'modern' && (
                <div className="grid grid-cols-12 gap-5 flex-1">
                  {/* Left Main column: 8 cols */}
                  <div className="col-span-8 space-y-4">
                    {/* Education */}
                    {resume.education.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Education</h3>
                        <div className="space-y-3 mt-2">
                          {resume.education.map(edu => (
                            <div key={edu.id} className="text-[11px]">
                              <div className="flex justify-between font-bold text-slate-800">
                                <span>{edu.school}</span>
                                <span className="text-slate-500 font-normal">{edu.end}</span>
                              </div>
                              <div className="flex justify-between text-slate-600 italic">
                                <span>{edu.degree} in {edu.department}</span>
                                <span className="font-semibold text-indigo-655">GPA: {edu.cgpa}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {resume.experience.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Experience</h3>
                        <div className="space-y-3 mt-2">
                          {resume.experience.map(exp => (
                            <div key={exp.id} className="text-[11px]">
                              <div className="flex justify-between font-bold text-slate-800">
                                <span>{exp.company}</span>
                                <span className="text-slate-500 font-normal">{exp.start} - {exp.end}</span>
                              </div>
                              <p className="text-slate-600 italic">{exp.role}</p>
                              <p className="text-slate-600 mt-1 leading-normal whitespace-pre-line">{exp.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Sidebar column: 4 cols */}
                  <div className="col-span-4 space-y-4 border-l border-slate-100 pl-4">
                    {/* Skills Matrix */}
                    {resume.skills.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Core Skills</h3>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resume.skills.map((s, i) => (
                            <span key={i} className="text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extra skills */}
                    {resume.extraSkills.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Extra Skills</h3>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resume.extraSkills.map((s, i) => (
                            <span key={i} className="text-[9px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {resume.certifications.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Certifications</h3>
                        <ul className="list-disc pl-4 text-[10px] text-slate-655 space-y-1 mt-1.5">
                          {resume.certifications.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Achievements */}
                    {resume.achievements.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Achievements</h3>
                        <ul className="list-disc pl-4 text-[10px] text-slate-655 space-y-1 mt-1.5">
                          {resume.achievements.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ATS MINIMAL: Single Column layout for high-density parsing */}
              {(resume.template === 'ats_minimal' || resume.template === 'corporate' || resume.template === 'fresher' || resume.template === 'software_engineer') && (
                <div className="space-y-4 flex-1 mt-2">
                  {/* Education */}
                  {resume.education.length > 0 && (
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Education</h3>
                      <div className="space-y-2 mt-1.5">
                        {resume.education.map(edu => (
                          <div key={edu.id} className="text-[11px] flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-800">{edu.school}</p>
                              <p className="text-slate-600 italic">{edu.degree} in {edu.department} (GPA: {edu.cgpa})</p>
                            </div>
                            <span className="text-slate-500 font-mono">{edu.end}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Grid for software engineer template */}
                  {resume.template === 'software_engineer' && resume.skills.length > 0 && (
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Technical Proficiencies</h3>
                      <div className="grid grid-cols-2 gap-3 mt-2 text-[11px]">
                        <div>
                          <span className="font-bold text-slate-800">Languages & Core:</span>
                          <p className="text-slate-600 mt-0.5">{resume.skills.join(', ')}</p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-800">Tools & Docker:</span>
                          <p className="text-slate-600 mt-0.5">{resume.extraSkills.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Skills lists for general minimal templates */}
                  {resume.template !== 'software_engineer' && resume.skills.length > 0 && (
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Skills Matrix</h3>
                      <div className="flex flex-wrap gap-x-2 gap-y-1.5 mt-2 text-[11px]">
                        <span className="font-bold text-slate-800">Core:</span>
                        <span className="text-slate-600">{resume.skills.join(', ')}</span>
                        {resume.extraSkills.length > 0 && (
                          <>
                            <span className="font-bold text-slate-800 ml-2">Extra:</span>
                            <span className="text-slate-600">{resume.extraSkills.join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {resume.experience.length > 0 && (
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Professional Experience</h3>
                      <div className="space-y-3 mt-1.5">
                        {resume.experience.map(exp => (
                          <div key={exp.id} className="text-[11px] space-y-0.5">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>{exp.company} — <span className="font-medium italic text-slate-600">{exp.role}</span></span>
                              <span className="text-slate-500 font-mono font-normal">{exp.start} - {exp.end}</span>
                            </div>
                            <p className="text-slate-655 leading-relaxed whitespace-pre-line">{exp.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resume.projects.length > 0 && (
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Projects</h3>
                      <div className="space-y-2 mt-1.5">
                        {resume.projects.map(proj => (
                          <div key={proj.id} className="text-[11px]">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span>{proj.title} <span className="text-[10px] font-normal text-slate-500">({proj.technologies})</span></span>
                              {proj.githubLink && <span className="text-indigo-650 font-normal text-[10px]">{proj.githubLink}</span>}
                            </div>
                            <p className="text-slate-655 leading-normal mt-0.5">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications and Achievements */}
                  {(resume.certifications.length > 0 || resume.achievements.length > 0) && (
                    <div className="grid grid-cols-2 gap-4">
                      {resume.certifications.length > 0 && (
                        <div>
                          <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Certifications</h3>
                          <ul className="list-disc pl-4 text-[10px] text-slate-655 space-y-0.5 mt-1">
                            {resume.certifications.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      )}
                      {resume.achievements.length > 0 && (
                        <div>
                          <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-955 border-b border-slate-200 pb-0.5">Achievements</h3>
                          <ul className="list-disc pl-4 text-[10px] text-slate-655 space-y-0.5 mt-1">
                            {resume.achievements.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer signature */}
            <div className="border-t border-slate-100 pt-2 text-center text-[9px] text-slate-400">
              Generated via Career Spark AI. Strict A4 single page output compliant.
            </div>
          </div>
        </div>
      </div>

      {/* Compare Version Modal */}
      {compareVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-850 flex justify-between items-center text-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">Compare Draft: {compareVersion.name} vs Current</span>
              </div>
              <button 
                onClick={() => setCompareVersion(null)} 
                className="p-1 hover:bg-slate-850 rounded-lg text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body side-by-side */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed flex-1">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-450 uppercase border-b dark:border-slate-800 pb-1.5">Draft ({compareVersion.timestamp})</p>
                <div className="space-y-2 p-3 bg-slate-900/40 rounded-xl border border-slate-850">
                  <p className="font-semibold text-slate-300">Name: {compareVersion.data.personal.fullName}</p>
                  <p className="font-semibold text-slate-300">Title: {compareVersion.data.personal.title}</p>
                  <p className="text-slate-400">Summary: {compareVersion.data.personal.summary}</p>
                  <p className="text-slate-400">Skills: {compareVersion.data.skills.join(', ')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-indigo-400 uppercase border-b dark:border-slate-800 pb-1.5">Current Active Version</p>
                <div className="space-y-2 p-3 bg-indigo-950/10 rounded-xl border border-indigo-500/10">
                  <p className="font-semibold text-indigo-350">Name: {resume.personal.fullName}</p>
                  <p className="font-semibold text-indigo-350">Title: {resume.personal.title}</p>
                  <p className="text-slate-350">Summary: {resume.personal.summary}</p>
                  <p className="text-slate-350">Skills: {resume.skills.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crop modal portal */}
      {showCrop && (
        <PhotoCropModal
          imageSrc={rawImage}
          onCropComplete={handleCropComplete}
          onClose={() => setShowCrop(false)}
        />
      )}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Confirm Deletion"
        message={`Are you sure you want to remove this ${deleteTarget?.type} entry? This cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

// Fallback X icon since we need it in compare version modal close button
const X: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
