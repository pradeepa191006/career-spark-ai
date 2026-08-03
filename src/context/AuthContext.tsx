import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  headline?: string;
  objective?: string;
  about_me?: string;
  college_name?: string;
  degree?: string;
  department?: string;
  cgpa?: number;
  graduation_year?: number;
  skills: string[];
  extra_skills: string[];
  languages_known: string[];
  certifications: string[];
  achievements: string[];
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  experience?: any[];
  education?: any[];
  projects?: any[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isMock: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {
  id: 'default-user-id',
  full_name: 'Alex Sparker',
  email: 'student@universities.edu',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  phone: '+1 (555) 019-2834',
  location: 'San Francisco, CA',
  headline: 'Aspiring Full Stack Engineer & Open Source Contributor',
  objective: 'To secure a challenging Software Engineering Internship where I can leverage my React, TypeScript, and AI skills to build impactful user interfaces.',
  about_me: 'I am a highly motivated Computer Science student with a strong foundation in modern web technologies. I love building responsive, user-friendly SaaS products and preparing for competitive technical interviews.',
  college_name: 'State Technical University',
  degree: 'Bachelor of Science',
  department: 'Computer Science & Engineering',
  cgpa: 3.8,
  graduation_year: 2027,
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS', 'SQL'],
  extra_skills: ['Docker', 'Git & GitHub', 'Figma', 'Supabase Realtime'],
  languages_known: ['English', 'Spanish', 'Mandarin'],
  certifications: [
    'AWS Certified Cloud Practitioner',
    'Meta Front-End Developer Professional Certificate'
  ],
  achievements: [
    '1st Place Winner - State Tech University Hackathon 2025',
    'Deans List Honor Roll - All semesters'
  ],
  github_url: 'https://github.com/alex-sparker',
  linkedin_url: 'https://linkedin.com/in/alex-sparker',
  portfolio_url: 'https://alex-sparker.dev',
  education: [
    {
      school: 'State Technical University',
      degree: 'Bachelor of Science in Computer Science',
      start_date: '2023-09',
      end_date: '2027-06',
      gpa: '3.8/4.0',
    },
  ],
  experience: [
    {
      company: 'TechSolutions Inc.',
      role: 'Software Engineer Intern',
      start_date: '2025-06',
      end_date: '2025-08',
      description: 'Worked on front-end features using React and optimized API request times.',
    },
  ],
  projects: [
    {
      title: 'Career Spark AI',
      description: 'An AI-powered application helper matching students to recruiters.',
      technologies: 'React, Tailwind, Gemini API',
      url: 'https://github.com/alex/career-spark',
    },
  ],
};

interface LocalAccount {
  user: User;
  passwordHash: string;
  profile: UserProfile;
}

const getUsersDb = (): Record<string, LocalAccount> => {
  const stored = localStorage.getItem('cs_users_db');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse users DB', e);
    }
  }
  // Seed default account
  const defaultAccount: LocalAccount = {
    user: {
      id: 'default-user-id',
      app_metadata: {},
      user_metadata: { full_name: 'Alex Sparker' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'student@universities.edu',
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    },
    passwordHash: 'student123',
    profile: DEFAULT_PROFILE,
  };
  const initialDb = { 'student@universities.edu': defaultAccount };
  localStorage.setItem('cs_users_db', JSON.stringify(initialDb));
  return initialDb;
};

const saveUsersDb = (db: Record<string, LocalAccount>) => {
  localStorage.setItem('cs_users_db', JSON.stringify(db));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        if (session) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          checkLocalSession();
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (session) {
          setUser(session.user);
          setIsMock(false);
          fetchProfile(session.user.id);
        } else {
          checkLocalSession();
        }
      });

      return () => subscription.unsubscribe();
    } else {
      checkLocalSession();
    }
  }, []);

  const checkLocalSession = () => {
    const activeEmail = localStorage.getItem('cs_active_session_email');
    if (activeEmail) {
      const db = getUsersDb();
      const account = db[activeEmail.toLowerCase()];
      if (account) {
        setUser(account.user);
        setProfile(account.profile);
        setIsMock(true);
        setLoading(false);
        return;
      }
    }
    setUser(null);
    setProfile(null);
    setIsMock(false);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data as UserProfile);
      } else {
        const newProfile: UserProfile = {
          id: userId,
          full_name: user?.user_metadata?.full_name || 'New Student',
          email: user?.email || '',
          skills: [],
          extra_skills: [],
          languages_known: [],
          certifications: [],
          achievements: [],
          experience: [],
          education: [],
          projects: [],
        };
        await supabase.from('profiles').insert(newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Error fetching profile from Supabase:', err);
      setProfile({
        id: userId,
        full_name: user?.user_metadata?.full_name || 'Student User',
        email: user?.email || 'user@universities.edu',
        skills: [],
        extra_skills: [],
        languages_known: [],
        certifications: [],
        achievements: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const login = async (email: string, password: string) => {
    setLoading(true);

    if (!email || !email.trim()) {
      setLoading(false);
      throw new Error('Please enter a valid email address.');
    }

    if (!password) {
      setLoading(false);
      throw new Error('Please enter your password.');
    }

    if (!validateEmail(email)) {
      setLoading(false);
      throw new Error('Invalid email format. Please check your email address.');
    }

    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoading(false);
        throw error;
      }
      return;
    }

    // Local authentication
    const db = getUsersDb();
    const normalizedEmail = email.trim().toLowerCase();
    const account = db[normalizedEmail];

    if (!account) {
      setLoading(false);
      throw new Error('Account not found. Please check your email or click Sign Up to register.');
    }

    if (account.passwordHash !== password) {
      setLoading(false);
      throw new Error('Incorrect password. Please try again or use Forgot Password.');
    }

    setUser(account.user);
    setProfile(account.profile);
    setIsMock(true);
    localStorage.setItem('cs_active_session_email', normalizedEmail);
    setLoading(false);
  };

  const signup = async (email: string, password: string, fullName: string) => {
    setLoading(true);

    if (!fullName || !fullName.trim()) {
      setLoading(false);
      throw new Error('Full Name is required.');
    }

    if (!email || !email.trim() || !validateEmail(email)) {
      setLoading(false);
      throw new Error('Please provide a valid email address.');
    }

    if (!password || password.length < 6) {
      setLoading(false);
      throw new Error('Password must be at least 6 characters long.');
    }

    if (supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setLoading(false);
        throw error;
      }
      return;
    }

    // Local signup
    const db = getUsersDb();
    const normalizedEmail = email.trim().toLowerCase();

    if (db[normalizedEmail]) {
      setLoading(false);
      throw new Error('An account with this email address already exists. Please log in.');
    }

    const userId = 'user_' + Math.random().toString(36).substring(2, 9);
    const newUser: User = {
      id: userId,
      app_metadata: {},
      user_metadata: { full_name: fullName },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: normalizedEmail,
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    };

    const newProfile: UserProfile = {
      id: userId,
      full_name: fullName.trim(),
      email: normalizedEmail,
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150`,
      skills: ['React', 'JavaScript'],
      extra_skills: ['Git'],
      languages_known: ['English'],
      certifications: [],
      achievements: [],
      experience: [],
      education: [],
      projects: [],
    };

    const newAccount: LocalAccount = {
      user: newUser,
      passwordHash: password,
      profile: newProfile,
    };

    db[normalizedEmail] = newAccount;
    saveUsersDb(db);

    setUser(newUser);
    setProfile(newProfile);
    setIsMock(true);
    localStorage.setItem('cs_active_session_email', normalizedEmail);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('cs_active_session_email');
    setUser(null);
    setProfile(null);
    setIsMock(false);
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);

    if (supabase) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
      if (error) console.error('Supabase profile update error:', error);
    }

    // Always update local DB session if active
    if (user?.email) {
      const db = getUsersDb();
      const account = db[user.email.toLowerCase()];
      if (account) {
        account.profile = newProfile;
        db[user.email.toLowerCase()] = account;
        saveUsersDb(db);
      }
    }
  };

  const forgotPassword = async (email: string) => {
    if (!email || !email.trim() || !validateEmail(email)) {
      throw new Error('Please enter a valid email address.');
    }

    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return;
    }

    const db = getUsersDb();
    const account = db[email.trim().toLowerCase()];
    if (!account) {
      throw new Error('No account found with this email address.');
    }
  };

  const resetPassword = async (password: string) => {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (supabase) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return;
    }

    if (!user || !user.email) {
      throw new Error('No active user session to reset password for.');
    }

    const db = getUsersDb();
    const account = db[user.email.toLowerCase()];
    if (account) {
      account.passwordHash = password;
      db[user.email.toLowerCase()] = account;
      saveUsersDb(db);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isMock, 
      login, 
      signup, 
      logout, 
      updateProfile,
      forgotPassword,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
