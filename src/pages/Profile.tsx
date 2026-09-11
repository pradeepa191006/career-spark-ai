import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { FileUploadZone } from '../components/common/FileUploadZone';
import { 
  User, School, Code, Plus, Trash2,
  Briefcase, Award, Globe, FileText, CloudLightning
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    headline: profile?.headline || '',
    objective: profile?.objective || '',
    about_me: profile?.about_me || '',
    college_name: profile?.college_name || '',
    degree: profile?.degree || '',
    department: profile?.department || '',
    cgpa: profile?.cgpa || 0,
    graduation_year: profile?.graduation_year || 2027,
    github_url: profile?.github_url || '',
    linkedin_url: profile?.linkedin_url || '',
    portfolio_url: profile?.portfolio_url || '',
    avatar_url: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
  });

  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const [extraSkills, setExtraSkills] = useState<string[]>(profile?.extra_skills || []);
  const [newExtraSkill, setNewExtraSkill] = useState('');

  const [languages, setLanguages] = useState<string[]>(profile?.languages_known || []);
  const [newLanguage, setNewLanguage] = useState('');

  const [certifications, setCertifications] = useState<string[]>(profile?.certifications || []);
  const [newCert, setNewCert] = useState('');

  const [achievements, setAchievements] = useState<string[]>(profile?.achievements || []);
  const [newAchievement, setNewAchievement] = useState('');

  // Auto save states
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSaved, setLastSaved] = useState<string>('');
  
  // Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'cert' | 'achievement'; value: string } | null>(null);

  // Sync profile to state on load
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        headline: profile.headline || '',
        objective: profile.objective || '',
        about_me: profile.about_me || '',
        college_name: profile.college_name || '',
        degree: profile.degree || '',
        department: profile.department || '',
        cgpa: profile.cgpa || 0,
        graduation_year: profile.graduation_year || 2027,
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        portfolio_url: profile.portfolio_url || '',
        avatar_url: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80',
      });
      setSkills(profile.skills || []);
      setExtraSkills(profile.extra_skills || []);
      setLanguages(profile.languages_known || []);
      setCertifications(profile.certifications || []);
      setAchievements(profile.achievements || []);
    }
  }, [profile]);

  // Debounced auto-save hook
  useEffect(() => {
    if (!profile) return;
    
    setSaveStatus('saving');
    const delayDebounce = setTimeout(async () => {
      try {
        await updateProfile({
          ...formData,
          skills,
          extra_skills: extraSkills,
          languages_known: languages,
          certifications,
          achievements
        });
        setSaveStatus('saved');
        setLastSaved(new Date().toLocaleTimeString());
      } catch (err) {
        console.error(err);
        setSaveStatus('idle');
      }
    }, 2000);

    return () => clearTimeout(delayDebounce);
  }, [formData, skills, extraSkills, languages, certifications, achievements]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cgpa' || name === 'graduation_year' ? Number(value) : value
    }));
  };

  const handleArrayAdd = (
    e: React.FormEvent,
    item: string,
    setItem: React.Dispatch<React.SetStateAction<string>>,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    e.preventDefault();
    if (item.trim() && !list.includes(item.trim())) {
      setList(prev => [...prev, item.trim()]);
      setItem('');
      showToast(`Added: ${item.trim()}`, 'success');
    }
  };

  const handleArrayRemove = (
    itemToRemove: string,
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(prev => prev.filter(i => i !== itemToRemove));
    showToast(`Removed entry.`, 'info');
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'cert') {
      handleArrayRemove(deleteTarget.value, setCertifications);
    } else {
      handleArrayRemove(deleteTarget.value, setAchievements);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-8 text-xs leading-normal">
      {/* Header section with auto-save indicators */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-[#143D32] pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">My Student Profile</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage credentials used across resumes and shareable portfolios</p>
        </div>
        
        {/* Autosave HUD */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#071C17] border border-slate-200 dark:border-[#143D32] px-3.5 py-1.5 rounded-xl">
          <CloudLightning className={`w-3.5 h-3.5 ${saveStatus === 'saving' ? 'text-emerald-500 animate-bounce' : 'text-slate-400'}`} />
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            {saveStatus === 'saving' ? 'Saving changes...' : saveStatus === 'saved' ? `Saved successfully (Last saved: ${lastSaved})` : 'Autosave active'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Photo & Personal info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500" />
              <span>Personal Information</span>
            </h3>

            {/* Profile pic upload */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                <img 
                  src={formData.avatar_url} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shadow-emerald-500/20"
                />
              </div>
              <div className="flex-1 w-full max-w-sm">
                <FileUploadZone
                  acceptTypes={['.png', '.jpg', '.jpeg', '.webp']}
                  maxSizeMB={2}
                  onUploadComplete={(url) => {
                    setFormData(prev => ({ ...prev, avatar_url: url }));
                  }}
                  label="Profile avatar photo"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full glass-input bg-slate-900/50 cursor-not-allowed opacity-60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full glass-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Headline</label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                className="w-full glass-input"
                placeholder="e.g. Aspiring Frontend Engineer | React Developer"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Career Objective</label>
              <textarea
                name="objective"
                value={formData.objective}
                onChange={handleInputChange}
                rows={3}
                className="w-full glass-input"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">About Me</label>
              <textarea
                name="about_me"
                value={formData.about_me}
                onChange={handleInputChange}
                rows={4}
                className="w-full glass-input"
              />
            </div>
          </div>

          {/* Education Details */}
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-3 flex items-center gap-2">
              <School className="w-4 h-4 text-teal-500" />
              <span>Academic Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">College Name</label>
                <input
                  type="text"
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleInputChange}
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Degree</label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">CGPA</label>
                  <input
                    type="number"
                    name="cgpa"
                    step="0.01"
                    value={formData.cgpa}
                    onChange={handleInputChange}
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Graduation Year</label>
                  <input
                    type="number"
                    name="graduation_year"
                    value={formData.graduation_year}
                    onChange={handleInputChange}
                    className="w-full glass-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>Social & Project Handles</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">GitHub profile</label>
                <input
                  type="text"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleInputChange}
                  className="w-full glass-input"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">LinkedIn profile</label>
                <input
                  type="text"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleInputChange}
                  className="w-full glass-input"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Personal Portfolio Link</label>
                <input
                  type="text"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleInputChange}
                  className="w-full glass-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Skill editors & lists */}
        <div className="space-y-6">
          {/* Primary Skills */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-500" />
              <span>Core Skills</span>
            </h4>

            <form 
              onSubmit={(e) => handleArrayAdd(e, newSkill, setNewSkill, skills, setSkills)} 
              className="flex gap-2"
            >
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add core skill"
                className="flex-1 glass-input py-1.5 px-3 text-xs"
              />
              <button type="submit" className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg cursor-pointer"><Plus className="w-4 h-4" /></button>
            </form>

            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-500/20">
                  <span>{s}</span>
                  <button type="button" onClick={() => handleArrayRemove(s, setSkills)}><Trash2 className="w-3 h-3 text-red-500 hover:text-red-600" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Extra Skills */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-teal-500" />
              <span>Extra Skills</span>
            </h4>

            <form 
              onSubmit={(e) => handleArrayAdd(e, newExtraSkill, setNewExtraSkill, extraSkills, setExtraSkills)} 
              className="flex gap-2"
            >
              <input
                type="text"
                value={newExtraSkill}
                onChange={(e) => setNewExtraSkill(e.target.value)}
                placeholder="Add extra skill"
                className="flex-1 glass-input py-1.5 px-3 text-xs"
              />
              <button type="submit" className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg cursor-pointer"><Plus className="w-4 h-4" /></button>
            </form>

            <div className="flex flex-wrap gap-1.5">
              {extraSkills.map((s, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-semibold border border-teal-500/20">
                  <span>{s}</span>
                  <button type="button" onClick={() => handleArrayRemove(s, setExtraSkills)}><Trash2 className="w-3 h-3 text-red-500 hover:text-red-600" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>Languages Known</span>
            </h4>

            <form 
              onSubmit={(e) => handleArrayAdd(e, newLanguage, setNewLanguage, languages, setLanguages)} 
              className="flex gap-2"
            >
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add language"
                className="flex-1 glass-input py-1.5 px-3 text-xs"
              />
              <button type="submit" className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg cursor-pointer"><Plus className="w-4 h-4" /></button>
            </form>

            <div className="flex flex-wrap gap-1.5">
              {languages.map((s, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#071C17] text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-[#143D32]">
                  <span>{s}</span>
                  <button type="button" onClick={() => handleArrayRemove(s, setLanguages)}><Trash2 className="w-3 h-3 text-red-500 hover:text-red-600" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-500" />
              <span>Certifications</span>
            </h4>

            <form 
              onSubmit={(e) => handleArrayAdd(e, newCert, setNewCert, certifications, setCertifications)} 
              className="flex gap-2"
            >
              <input
                type="text"
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                placeholder="Add credential"
                className="flex-1 glass-input py-1.5 px-3 text-xs"
              />
              <button type="submit" className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg cursor-pointer"><Plus className="w-4 h-4" /></button>
            </form>

            <div className="space-y-2">
              {certifications.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px] p-2 bg-slate-50 dark:bg-[#071C17] rounded border border-slate-200 dark:border-[#143D32] text-slate-800 dark:text-slate-200">
                  <span className="truncate pr-2">{s}</span>
                  <button type="button" onClick={() => setDeleteTarget({ type: 'cert', value: s })}><Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-600 cursor-pointer" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#143D32] pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Achievements</span>
            </h4>

            <form 
              onSubmit={(e) => handleArrayAdd(e, newAchievement, setNewAchievement, achievements, setAchievements)} 
              className="flex gap-2"
            >
              <input
                type="text"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="Add achievement"
                className="flex-1 glass-input py-1.5 px-3 text-xs"
              />
              <button type="submit" className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg cursor-pointer"><Plus className="w-4 h-4" /></button>
            </form>

            <div className="space-y-2">
              {achievements.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px] p-2 bg-slate-50 dark:bg-[#071C17] rounded border border-slate-200 dark:border-[#143D32] text-slate-800 dark:text-slate-200">
                  <span className="truncate pr-2">{s}</span>
                  <button type="button" onClick={() => setDeleteTarget({ type: 'achievement', value: s })}><Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-600 cursor-pointer" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete item confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Confirm Delete"
        message={`Are you sure you want to delete this ${deleteTarget?.type === 'cert' ? 'certification' : 'achievement'}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
