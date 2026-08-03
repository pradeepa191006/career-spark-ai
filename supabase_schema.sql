-- SQL Schema migration for Supabase (Career Spark AI)
-- Run this in the Supabase SQL Editor to configure all tables, relationships, and RLS policies.

-- 1. Student Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  avatar_url text,
  phone text,
  location text,
  headline text,
  objective text,
  about_me text,
  college_name text,
  degree text,
  department text,
  cgpa numeric(3,2),
  graduation_year integer,
  skills text[] default '{}',
  extra_skills text[] default '{}',
  languages_known text[] default '{}',
  certifications text[] default '{}',
  achievements text[] default '{}',
  github_url text,
  linkedin_url text,
  portfolio_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- 2. Resumes Table
create table if not exists public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Untitled Resume',
  template text not null default 'modern',
  personal_info jsonb default '{}'::jsonb,
  experience jsonb[] default '{}',
  education jsonb[] default '{}',
  skills text[] default '{}',
  projects jsonb[] default '{}',
  certifications text[] default '{}',
  photo_url text,
  target_job_title text,
  target_job_description text,
  ats_score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Resumes
alter table public.resumes enable row level security;

create policy "Users can perform actions on own resumes" on public.resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. ATS Reports Table
create table if not exists public.ats_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  resume_id uuid references public.resumes(id) on delete cascade,
  job_description text not null,
  score integer not null,
  analysis jsonb not null, -- { match_percentage: number, missing_keywords: string[], recommended_phrases: string[], structure_feedback: string }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for ATS Reports
alter table public.ats_reports enable row level security;

create policy "Users can perform actions on own ATS reports" on public.ats_reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. Cover Letters Table
create table if not exists public.cover_letters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Untitled Cover Letter',
  company_name text not null,
  recipient_name text,
  job_title text not null,
  job_description text,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Cover Letters
alter table public.cover_letters enable row level security;

create policy "Users can perform actions on own cover letters" on public.cover_letters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5. Skill Gap Reports Table
create table if not exists public.skill_gap_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  target_role text not null,
  job_description text,
  current_skills text[] default '{}',
  missing_skills text[] default '{}',
  recommendations jsonb[] default '{}', -- array of { type: 'course'|'project'|'certification', title: string, provider: string, link: string }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Skill Gap Reports
alter table public.skill_gap_reports enable row level security;

create policy "Users can perform actions on own skill gap reports" on public.skill_gap_reports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6. Interview Sessions Table
create table if not exists public.interview_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text check (type in ('voice', 'video', 'text')) not null,
  job_role text not null,
  status text check (status in ('ongoing', 'completed')) default 'ongoing' not null,
  transcript jsonb[] default '{}', -- array of { role: 'interviewer'|'candidate', text: string, timestamp: string }
  feedback jsonb, -- score, strengths, improvements, detailed evaluation
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Interview Sessions
alter table public.interview_sessions enable row level security;

create policy "Users can perform actions on own interview sessions" on public.interview_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 7. Portfolios Table
create table if not exists public.portfolios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  slug text unique not null,
  theme text default 'sleek' not null,
  title text not null,
  tagline text,
  about_me text,
  projects jsonb[] default '{}',
  experience jsonb[] default '{}',
  skills text[] default '{}',
  social_links jsonb default '{}'::jsonb,
  is_published boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Portfolios
alter table public.portfolios enable row level security;

create policy "Users can perform actions on own portfolios" on public.portfolios
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Portfolios are public for everyone to view" on public.portfolios
  for select using (is_published = true);
