import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings as SettingsIcon, Key, Eye, EyeOff, Save, Check,
  User, Lock, Globe, ShieldCheck 
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { profile, updateProfile, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // 1. API key state
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [apiKeySuccess, setApiKeySuccess] = useState(false);

  // 2. Personal Profile form
  const [profileData, setProfileData] = useState({
    fullName: profile?.full_name || 'Alex Sparker',
    email: profile?.email || 'student@universities.edu',
    phone: profile?.phone || '',
    location: profile?.location || '',
    headline: profile?.headline || '',
  });
  const [profileSuccess, setProfileSuccess] = useState(false);

  // 3. Password form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // 4. System Preferences (saved locally)
  const [notifications, setNotifications] = useState({
    emailReports: true,
    careerUpdates: false,
    badgeUnlocks: true
  });
  const [lang, setLang] = useState(() => localStorage.getItem('lang_pref') || 'English');
  const [privacy, setPrivacy] = useState({
    portfolioPublic: true,
    shareRecruiters: false
  });
  const [preferencesSuccess, setPreferencesSuccess] = useState(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (geminiKey.trim()) {
      localStorage.setItem('gemini_api_key', geminiKey.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setApiKeySuccess(true);
    setTimeout(() => setApiKeySuccess(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        headline: profileData.headline
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword(newPassword);
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 2000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update credentials.');
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lang_pref', lang);
    // Mock save other parameters
    setPreferencesSuccess(true);
    setTimeout(() => setPreferencesSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-550" />
          <span>Application Settings</span>
        </h2>
        <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
          Configure security credentials, theme preferences, and sync profile records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left main forms: 2 cols */}
        <div className="md:col-span-2 space-y-6">
          {/* Gemini Card */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-500" />
              <span>Google Gemini API Credentials</span>
            </h3>
            
            <form onSubmit={handleSaveKey} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Gemini API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full glass-input pr-10 text-xs py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-755 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all shadow-md"
              >
                {apiKeySuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{apiKeySuccess ? 'Saved Locally' : 'Save Key'}</span>
              </button>
            </form>
          </div>

          {/* Profile Card */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Sync Personal Profile</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full glass-input py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full glass-input py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Phone</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full glass-input py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Location</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full glass-input py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Professional Headline</label>
                <input
                  type="text"
                  value={profileData.headline}
                  onChange={(e) => setProfileData(prev => ({ ...prev, headline: e.target.value }))}
                  className="w-full glass-input py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-755 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all shadow-md"
              >
                {profileSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{profileSuccess ? 'Profile Updated' : 'Update Profile'}</span>
              </button>
            </form>
          </div>

          {/* Password Security Card */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-500" />
              <span>Update Credentials</span>
            </h3>

            {passwordError && (
              <div className="p-2.5 rounded bg-red-950/40 border border-red-500/20 text-red-400 text-[10px]">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[10px]">
                Credentials updated successfully!
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full glass-input py-2 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-755 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all shadow-md"
              >
                {passwordSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>Update Password</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right side Preferences: 1 col */}
        <div className="space-y-6">
          {/* Preferences Card */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b dark:border-slate-800 pb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>System preferences</span>
            </h3>

            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
              {/* Theme Toggle */}
              <div className="flex justify-between items-center py-1">
                <div>
                  <span className="font-semibold text-slate-300">Theme Preference</span>
                  <p className="text-[10px] text-slate-500">Choose dark or light visual interface</p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-3 py-1.5 border dark:border-slate-800 rounded-xl hover:bg-slate-900 capitalize font-semibold font-mono text-[10px]"
                >
                  {theme}
                </button>
              </div>

              {/* Language */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-2">Language Selection</label>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="w-full glass-input py-2 text-xs"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Notification Subscriptions</span>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="emailReports"
                    checked={notifications.emailReports}
                    onChange={(e) => setNotifications(prev => ({ ...prev, emailReports: e.target.checked }))}
                    className="rounded accent-indigo-500"
                  />
                  <label htmlFor="emailReports" className="text-slate-400 text-[10px]">Email Match scan reports</label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="badgeUnlocks"
                    checked={notifications.badgeUnlocks}
                    onChange={(e) => setNotifications(prev => ({ ...prev, badgeUnlocks: e.target.checked }))}
                    className="rounded accent-indigo-500"
                  />
                  <label htmlFor="badgeUnlocks" className="text-slate-400 text-[10px]">Instant Badge Achievements notification</label>
                </div>
              </div>

              {/* Privacy */}
              <div className="space-y-3 pt-2 border-t dark:border-slate-850">
                <span className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Privacy details</span>
                </span>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="portfolioPublic"
                    checked={privacy.portfolioPublic}
                    onChange={(e) => setPrivacy(prev => ({ ...prev, portfolioPublic: e.target.checked }))}
                    className="rounded accent-indigo-500"
                  />
                  <label htmlFor="portfolioPublic" className="text-slate-400 text-[10px]">Allow public portfolio visibility</label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-650 hover:bg-indigo-755 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-md"
              >
                {preferencesSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{preferencesSuccess ? 'Preferences Saved' : 'Save Preferences'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
