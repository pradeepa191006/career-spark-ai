import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getScopedStorage, setScopedStorage } from '../utils/storageHelper';
import { 
  Globe, Sparkles, Edit3, Trash2, Eye, Plus, QrCode, ShieldCheck
} from 'lucide-react';
import { useToast } from '../components/common/Toast';

export interface PortfolioData {
  id: string;
  slug: string;
  theme: 'sleek' | 'minimal' | 'cyberpunk';
  title: string;
  tagline: string;
  about_me: string;
  profile_photo: string;
  selected_skills: string[];
  selected_projects: Array<{ title: string; description: string; tech: string; link?: string }>;
  selected_education: Array<{ degree: string; school: string; year: string; gpa?: string }>;
  selected_certifications: string[];
  selected_achievements: string[];
  social_links: { github?: string; linkedin?: string; email?: string; website?: string };
  is_published: boolean;
  updated_at: string;
}

export const Portfolio: React.FC = () => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'preview' | 'wizard' | 'editor'>('preview');
  const [copied, setCopied] = useState(false);

  // Portfolio state
  const [portfolio, setPortfolio] = useState<PortfolioData>(() => {
    const cached = getScopedStorage<PortfolioData>('saved_portfolio', user?.id);
    if (cached) return cached;

    return {
      id: 'portfolio_' + Date.now(),
      slug: (profile?.full_name || 'alex-sparker').toLowerCase().replace(/\s+/g, '-'),
      theme: 'sleek',
      title: profile?.full_name || 'Alex Sparker',
      tagline: profile?.headline || 'Full Stack Engineer & Computer Science Major',
      about_me: profile?.about_me || 'Passionate about building responsive, high-performance web applications and AI tools.',
      profile_photo: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      selected_skills: profile?.skills || ['React', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS', 'SQL'],
      selected_projects: [
        {
          title: 'Career Spark AI',
          description: 'AI-powered recruitment & ATS optimization platform for university students.',
          tech: 'React, Vite, TypeScript, Gemini API',
          link: 'https://github.com/alex/career-spark'
        }
      ],
      selected_education: [
        {
          school: profile?.college_name || 'State Technical University',
          degree: profile?.degree || 'Bachelor of Science in Computer Science',
          year: `${profile?.graduation_year || 2027}`,
          gpa: `${profile?.cgpa || 3.8}/4.0`
        }
      ],
      selected_certifications: profile?.certifications || ['AWS Certified Cloud Practitioner'],
      selected_achievements: profile?.achievements || ['1st Place Winner - State Tech Hackathon 2025'],
      social_links: {
        github: profile?.github_url || 'https://github.com',
        linkedin: profile?.linkedin_url || 'https://linkedin.com',
        email: profile?.email || 'student@universities.edu'
      },
      is_published: false,
      updated_at: new Date().toLocaleDateString()
    };
  });

  // Wizard step state
  const [wizardStep, setWizardStep] = useState(1);

  // Persist portfolio
  const savePortfolio = (updated: PortfolioData) => {
    setPortfolio(updated);
    setScopedStorage('saved_portfolio', updated, user?.id);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/portfolio/${portfolio.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Public portfolio link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePublish = () => {
    const updated = { ...portfolio, is_published: !portfolio.is_published, updated_at: new Date().toLocaleDateString() };
    savePortfolio(updated);
    showToast(updated.is_published ? 'Portfolio published live for recruiters!' : 'Portfolio saved as draft.', updated.is_published ? 'success' : 'info');
  };

  const handleDeletePortfolio = () => {
    const reset = {
      ...portfolio,
      is_published: false,
      selected_projects: [],
      selected_skills: [],
      selected_certifications: [],
      selected_achievements: []
    };
    savePortfolio(reset);
    showToast('Portfolio configuration reset.', 'info');
  };

  // Helper to append custom items
  const [newSkill, setNewSkill] = useState('');
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const updated = { ...portfolio, selected_skills: [...portfolio.selected_skills, newSkill.trim()] };
    savePortfolio(updated);
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    const updated = { ...portfolio, selected_skills: portfolio.selected_skills.filter((_, i) => i !== index) };
    savePortfolio(updated);
  };

  const addProject = () => {
    if (!newProjTitle.trim()) return;
    const newProj = { title: newProjTitle.trim(), description: newProjDesc.trim(), tech: newProjTech.trim() };
    const updated = { ...portfolio, selected_projects: [...portfolio.selected_projects, newProj] };
    savePortfolio(updated);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjTech('');
  };

  const removeProject = (index: number) => {
    const updated = { ...portfolio, selected_projects: portfolio.selected_projects.filter((_, i) => i !== index) };
    savePortfolio(updated);
  };

  return (
    <div className="space-y-8 text-xs leading-normal">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            <span>AI Portfolio Generator & Publisher</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build, customize, preview, and publish your professional recruiter landing page.
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('wizard')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2 px-3.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE PORTFOLIO</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Header */}
      <div className="flex bg-slate-100 dark:bg-[#0B2A22]/80 p-1 rounded-xl gap-1 text-[11px] border border-slate-200 dark:border-[#143D32]">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'preview' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Live Preview & Controls</span>
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'editor' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Section Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('wizard')}
          className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'wizard' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Setup Wizard</span>
        </button>
      </div>

      {/* TAB 1: Live Preview & Action Controls */}
      {activeTab === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Sidebar (4 cols) */}
          <div className="lg:col-span-4 glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-[#143D32] pb-3">
              Publish & Theme Controls
            </h3>

            {/* Slug URL Input */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Public URL Slug</label>
              <div className="flex gap-2">
                <span className="bg-slate-100 dark:bg-[#071C17] border border-slate-300 dark:border-[#143D32] rounded-lg px-2.5 py-2 text-[10px] text-slate-500 font-mono flex items-center shrink-0">
                  /portfolio/
                </span>
                <input
                  type="text"
                  value={portfolio.slug}
                  onChange={(e) => savePortfolio({ ...portfolio, slug: e.target.value })}
                  className="flex-1 glass-input text-xs font-mono"
                />
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase">Portfolio Design Theme</label>
              <select
                value={portfolio.theme}
                onChange={(e) => savePortfolio({ ...portfolio, theme: e.target.value as any })}
                className="w-full glass-input"
              >
                <option value="sleek">Sleek Corporate (Emerald & Dark Slate)</option>
                <option value="minimal">Minimalist Clean (White & Slate)</option>
                <option value="cyberpunk">Cyberpunk Neon (Dark & Cyan/Pink)</option>
              </select>
            </div>

            {/* Publish Toggle Button */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#071C17]/60 border border-slate-200 dark:border-[#143D32]">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-xs">Publish Status</p>
                <p className="text-[10px] text-slate-500">{portfolio.is_published ? 'Live for recruiters' : 'Draft mode'}</p>
              </div>
              <button
                onClick={handleTogglePublish}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  portfolio.is_published 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20' 
                    : 'bg-slate-200 dark:bg-[#10352C] hover:bg-slate-300 dark:hover:bg-[#143D32] text-slate-700 dark:text-slate-300'
                }`}
              >
                {portfolio.is_published ? 'Published' : 'Publish Now'}
              </button>
            </div>

            {/* Action Toolbar */}
            <div className="space-y-3 pt-2">
              {portfolio.is_published && (
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>{copied ? 'Link Copied!' : 'Copy Recruiter Link'}</span>
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('editor')}
                  className="flex-1 py-2 border border-slate-300 dark:border-[#143D32] hover:bg-slate-100 dark:hover:bg-[#0B2A22] rounded-xl text-xs font-semibold text-center cursor-pointer"
                >
                  Edit Sections
                </button>
                <button
                  onClick={handleDeletePortfolio}
                  className="px-3 py-2 border border-red-500/20 hover:bg-red-500/10 text-red-500 rounded-xl text-xs font-semibold cursor-pointer"
                  title="Reset Portfolio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* QR Code section */}
            {portfolio.is_published && (
              <div className="pt-4 border-t dark:border-[#143D32] flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-emerald-500" /> Recruiter QR Code
                </span>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/portfolio/${portfolio.slug}`)}`}
                  alt="Portfolio QR Code"
                  className="w-28 h-28 bg-white p-2 rounded-xl shadow-md border border-slate-200"
                />
              </div>
            )}
          </div>

          {/* Portfolio Sandbox Live Preview Frame (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
              <span>LIVE PORTFOLIO SANDBOX PREVIEW</span>
              <span className="text-emerald-500 font-bold uppercase text-[10px]">Theme: {portfolio.theme}</span>
            </div>

            {/* Dynamic Theme Renderer Container */}
            <div className={`rounded-2xl border overflow-hidden shadow-2xl p-8 min-h-[500px] flex flex-col justify-between transition-all ${
              portfolio.theme === 'cyberpunk'
                ? 'bg-slate-950 text-cyan-400 font-mono border-cyan-500/30'
                : portfolio.theme === 'minimal'
                ? 'bg-white text-slate-800 border-slate-300'
                : 'bg-[#0B2A22] text-slate-100 border-[#143D32]'
            }`}>
              {/* Profile Header Section */}
              <header className="flex justify-between items-start border-b pb-6 dark:border-[#143D32] border-slate-200">
                <div className="flex gap-4 items-center">
                  <img
                    src={portfolio.profile_photo}
                    alt={portfolio.title}
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                  />
                  <div>
                    <h1 className={`text-xl font-extrabold ${portfolio.theme === 'cyberpunk' ? 'text-pink-500' : 'text-slate-900 dark:text-slate-100'}`}>
                      {portfolio.title}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {portfolio.tagline}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] uppercase font-bold border px-2.5 py-1 rounded-full ${
                  portfolio.theme === 'cyberpunk' ? 'border-cyan-500 text-cyan-400' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  Open to Roles
                </span>
              </header>

              {/* Main Content Body */}
              <main className="my-6 space-y-6 flex-1 text-xs">
                {/* About Me */}
                <div className="space-y-1.5">
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${portfolio.theme === 'cyberpunk' ? 'text-pink-500' : 'text-emerald-400'}`}>About Me</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {portfolio.about_me}
                  </p>
                </div>

                {/* Core Skills */}
                <div className="space-y-2">
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${portfolio.theme === 'cyberpunk' ? 'text-pink-500' : 'text-emerald-400'}`}>Core Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {portfolio.selected_skills.map((s, idx) => (
                      <span 
                        key={idx} 
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
                          portfolio.theme === 'cyberpunk'
                            ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                            : portfolio.theme === 'minimal'
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'bg-[#10352C] text-emerald-300 border border-[#143D32]'
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Projects Section */}
                {portfolio.selected_projects.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${portfolio.theme === 'cyberpunk' ? 'text-pink-500' : 'text-emerald-400'}`}>Featured Projects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {portfolio.selected_projects.map((p, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-[#143D32] bg-slate-50 dark:bg-[#071C17]/60 space-y-1.5">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">{p.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{p.description}</p>
                          <span className="text-[9px] font-mono text-teal-400 block pt-1">{p.tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Section */}
                {portfolio.selected_education.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${portfolio.theme === 'cyberpunk' ? 'text-pink-500' : 'text-emerald-400'}`}>Education</h3>
                    {portfolio.selected_education.map((e, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{e.degree}</p>
                          <p className="text-[10px] text-slate-500">{e.school}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-teal-400">{e.year} • GPA {e.gpa}</span>
                      </div>
                    ))}
                  </div>
                )}
              </main>

              {/* Footer Links */}
              <footer className="flex justify-between items-center text-[10px] text-slate-500 border-t pt-4 dark:border-[#143D32] border-slate-200">
                <span>Created with Career Spark AI</span>
                <div className="flex gap-4 font-semibold text-teal-400">
                  {portfolio.social_links.github && <a href={portfolio.social_links.github} target="_blank" rel="noreferrer">GitHub</a>}
                  {portfolio.social_links.linkedin && <a href={portfolio.social_links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                  {portfolio.social_links.email && <span>{portfolio.social_links.email}</span>}
                </div>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Section Editor */}
      {activeTab === 'editor' && (
        <div className="glass-card p-6 rounded-2xl space-y-6 max-w-4xl mx-auto border border-slate-200 dark:border-[#143D32]">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b dark:border-[#143D32] pb-3">
            Manual Portfolio Section Editor
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title & Tagline */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Display Name</label>
              <input
                type="text"
                value={portfolio.title}
                onChange={(e) => savePortfolio({ ...portfolio, title: e.target.value })}
                className="w-full glass-input"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Tagline / Headline</label>
              <input
                type="text"
                value={portfolio.tagline}
                onChange={(e) => savePortfolio({ ...portfolio, tagline: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">About Me Statement</label>
            <textarea
              rows={3}
              value={portfolio.about_me}
              onChange={(e) => savePortfolio({ ...portfolio, about_me: e.target.value })}
              className="w-full glass-input"
            />
          </div>

          {/* Edit Skills */}
          <div className="space-y-3 pt-2 border-t dark:border-[#143D32]">
            <label className="block text-[10px] font-bold uppercase text-slate-400">Edit Skills List</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add new skill e.g. Docker, Redux..."
                className="flex-1 glass-input text-xs"
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md shadow-emerald-500/20"
              >
                Add Skill
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {portfolio.selected_skills.map((s, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#071C17] border border-slate-200 dark:border-[#143D32] flex items-center gap-1.5 text-[10px] text-slate-700 dark:text-slate-300">
                  <span>{s}</span>
                  <button onClick={() => removeSkill(idx)} className="text-red-400 hover:text-red-500 font-bold cursor-pointer">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Edit Projects */}
          <div className="space-y-3 pt-4 border-t dark:border-[#143D32]">
            <label className="block text-[10px] font-bold uppercase text-slate-400">Add New Project</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={newProjTitle}
                onChange={(e) => setNewProjTitle(e.target.value)}
                placeholder="Project title..."
                className="glass-input text-xs"
              />
              <input
                type="text"
                value={newProjTech}
                onChange={(e) => setNewProjTech(e.target.value)}
                placeholder="Tech stack..."
                className="glass-input text-xs"
              />
              <button
                onClick={addProject}
                className="py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md shadow-emerald-500/20"
              >
                Add Project Card
              </button>
            </div>
            <textarea
              rows={2}
              value={newProjDesc}
              onChange={(e) => setNewProjDesc(e.target.value)}
              placeholder="Project description..."
              className="w-full glass-input text-xs mt-2"
            />
            <div className="space-y-2 pt-2">
              {portfolio.selected_projects.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-[#071C17]/40 rounded-xl border border-slate-200 dark:border-[#143D32] flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{p.title}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono ml-2">({p.tech})</span>
                  </div>
                  <button onClick={() => removeProject(idx)} className="text-red-400 hover:text-red-500 font-bold text-xs cursor-pointer">Remove</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 12-Step Setup Wizard */}
      {activeTab === 'wizard' && (
        <div className="glass-card p-8 rounded-2xl space-y-6 max-w-2xl mx-auto border border-slate-200 dark:border-[#143D32]">
          <div className="flex justify-between items-center border-b dark:border-[#143D32] pb-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Portfolio Creation Wizard (Step {wizardStep} of 4)
            </h3>
            <span className="text-[10px] text-emerald-500 font-bold uppercase">Automated Import</span>
          </div>

          {wizardStep === 1 && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-700 dark:text-slate-200">Step 1: Confirm Profile & Contact Links</h4>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <input type="text" value={portfolio.title} onChange={(e) => savePortfolio({ ...portfolio, title: e.target.value })} className="w-full glass-input" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Professional Tagline</label>
                <input type="text" value={portfolio.tagline} onChange={(e) => savePortfolio({ ...portfolio, tagline: e.target.value })} className="w-full glass-input" />
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-700 dark:text-slate-200">Step 2: Confirm Core Skills & Education</h4>
              <p className="text-slate-500 text-[10px]">Loaded {portfolio.selected_skills.length} skills from your profile.</p>
              <div className="flex flex-wrap gap-1.5">
                {portfolio.selected_skills.map((s, idx) => (
                  <span key={idx} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-700 dark:text-slate-200">Step 3: Select Theme Style</h4>
              <div className="grid grid-cols-3 gap-3">
                {['sleek', 'minimal', 'cyberpunk'].map((t) => (
                  <button
                    key={t}
                    onClick={() => savePortfolio({ ...portfolio, theme: t as any })}
                    className={`p-4 rounded-xl border text-center font-bold uppercase text-[10px] capitalize transition-all cursor-pointer ${
                      portfolio.theme === t ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-slate-300 dark:border-[#143D32]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-4 text-xs text-center py-4">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Portfolio Creation Completed!</h4>
              <p className="text-slate-500 max-w-xs mx-auto text-[11px]">Your recruiter page setup is ready. Click below to preview and publish live.</p>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t dark:border-[#143D32] text-xs">
            <button
              onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}
              disabled={wizardStep === 1}
              className="px-4 py-2 border border-slate-300 dark:border-[#143D32] rounded-xl font-semibold disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>

            {wizardStep < 4 ? (
              <button
                onClick={() => setWizardStep(wizardStep + 1)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-semibold cursor-pointer shadow-md shadow-emerald-500/20"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('preview')}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Go to Live Preview
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
