/**
 * Intelligent ATS Scoring, Domain Classification & Keyword Rationale Engine
 */

export interface KeywordSuggestion {
  keyword: string;
  reason: string;
  jdSection: string;
  suggestedLocation: string;
}

export interface AtsReport {
  score: number;
  match_percentage: number;
  resumeDomain: string;
  jobDomain: string;
  domainMatch: boolean;
  mismatchReason?: string;
  categoryBreakdown: {
    domainMatch: number;
    skillMatch: number;
    experienceMatch: number;
    educationMatch: number;
    keywordMatch: number;
    formattingScore: number;
  };
  resumeKeywords: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendedKeywords: KeywordSuggestion[];
  skillsPresent: string[];
  skillsMissingFromJd: string[];
  irrelevantSkillsNotToAdd: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  recommended_phrases: string[];
}

const DOMAINS: Record<string, string[]> = {
  'Software Developer / Full Stack': [
    'react', 'typescript', 'javascript', 'python', 'c++', 'java', 'node', 'express',
    'postgresql', 'mongodb', 'git', 'docker', 'devops', 'database', 'frontend', 'backend',
    'fullstack', 'software', 'engineer', 'coding', 'developer', 'aws', 'rest api', 'graphql',
    'html', 'css', 'redux', 'next.js', 'vite', 'api'
  ],
  'HR Manager / Human Resources': [
    'hr', 'human resources', 'recruitment', 'recruiting', 'talent acquisition', 'onboarding', 'payroll',
    'staffing', 'employee relations', 'benefits', 'compensation', 'compliance', 'interviewing', 'performance management', 'hris'
  ],
  'Marketing Specialist': [
    'marketing', 'seo', 'sem', 'campaign', 'ads', 'analytics', 'social media', 'copywriter',
    'brand', 'growth', 'newsletter', 'content creation', 'conversion rate', 'funnel', 'google analytics'
  ],
  'Finance & Accounting': [
    'finance', 'accounting', 'accountant', 'tax', 'audit', 'banking', 'ledger', 'stock',
    'trading', 'investment', 'excel', 'financial forecasting', 'balance sheet', 'portfolio', 'quickbooks'
  ],
  'UI/UX Designer': [
    'figma', 'sketch', 'user experience', 'user interface', 'ui/ux', 'wireframe', 'prototype',
    'prototyping', 'designer', 'design', 'user research', 'mockup', 'usability testing', 'design system', 'adobe xd'
  ],
  'Data Analyst': [
    'tableau', 'powerbi', 'analytics', 'sql', 'excel', 'pandas', 'numpy', 'visualization',
    'cleaning', 'report', 'data analyst', 'data science', 'statistics', 'dashboard', 'r', 'etl'
  ],
  'Machine Learning Engineer': [
    'pytorch', 'tensorflow', 'keras', 'scikit-learn', 'deep learning', 'models', 'neural network',
    'nlp', 'computer vision', 'training', 'dataset', 'ml', 'ai', 'machine learning', 'transformers', 'llm'
  ]
};

export const detectDomain = (text: string): string => {
  const cleanText = text.toLowerCase();
  let bestDomain = 'General / Technical';
  let maxScore = 0;

  Object.entries(DOMAINS).forEach(([domain, keywords]) => {
    let score = 0;
    keywords.forEach(kw => {
      if (cleanText.includes(kw)) {
        const matches = (cleanText.match(new RegExp(`\\b${kw.replace('.', '\\.')}\\b`, 'g')) || []).length;
        score += matches * 1.5 + 1;
      }
    });

    if (score > maxScore && score > 2) {
      maxScore = score;
      bestDomain = domain;
    }
  });

  return bestDomain;
};

export const computeAtsScore = (resumeText: string, jobDescriptionText: string): AtsReport => {
  const resumeClean = resumeText.toLowerCase();
  const jdClean = jobDescriptionText.toLowerCase();

  // 1. Detect Domains
  const resumeDomain = detectDomain(resumeClean);
  const jobDomain = detectDomain(jdClean);

  const isFullStack = resumeDomain.includes('Software') || resumeDomain.includes('Full Stack');
  const isML = jobDomain.includes('Machine Learning') || jobDomain.includes('Data Analyst');
  const domainMatch = resumeDomain === jobDomain || (isFullStack && isML);

  // Extract explicit skill words from JD
  const jdWords = Array.from(new Set(jdClean.match(/\b[a-z0-9+#.-]{3,20}\b/g) || []));
  const resumeWords = new Set(resumeClean.match(/\b[a-z0-9+#.-]{3,20}\b/g) || []);

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const skillsPresent: string[] = [];
  const skillsMissingFromJd: string[] = [];
  const irrelevantSkillsNotToAdd: string[] = [];

  // Categorize domain-specific keywords
  const resumeDomainKws = DOMAINS[resumeDomain] || [];
  const jobDomainKws = DOMAINS[jobDomain] || [];

  resumeDomainKws.forEach(kw => {
    if (resumeClean.includes(kw)) {
      skillsPresent.push(kw);
      if (!jdClean.includes(kw) && !domainMatch) {
        irrelevantSkillsNotToAdd.push(kw);
      }
    }
  });

  jobDomainKws.forEach(kw => {
    if (jdClean.includes(kw)) {
      if (resumeClean.includes(kw)) {
        if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
      } else {
        if (!skillsMissingFromJd.includes(kw)) skillsMissingFromJd.push(kw);
        if (!missingKeywords.includes(kw)) missingKeywords.push(kw);
      }
    }
  });

  // Extract general non-stopword keywords matching
  const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'will', 'your', 'about', 'can', 'must', 'work', 'team']);
  jdWords.forEach(w => {
    if (stopWords.has(w) || w.length < 3) return;
    if (resumeWords.has(w)) {
      if (!matchedKeywords.includes(w) && matchedKeywords.length < 15) matchedKeywords.push(w);
    } else if (jobDomainKws.some(k => k.includes(w))) {
      if (!missingKeywords.includes(w) && missingKeywords.length < 15) missingKeywords.push(w);
    }
  });

  // Detailed rationale for recommended keywords
  const recommendedKeywords: KeywordSuggestion[] = missingKeywords.slice(0, 6).map(kw => ({
    keyword: kw,
    reason: `Directly requested in the target ${jobDomain} job specification.`,
    jdSection: `Key Qualifications / Technical Requirements`,
    suggestedLocation: `Skills Matrix or Relevant Project Description (only if you have hands-on experience)`
  }));

  // Composite ATS score computation
  let domainMatchScore = domainMatch ? 100 : 0;
  const keywordMatchRatio = matchedKeywords.length / Math.max(1, matchedKeywords.length + missingKeywords.length);
  const keywordMatchScore = Math.round(keywordMatchRatio * 100);
  const skillMatchScore = Math.round(Math.max(0, 100 - (skillsMissingFromJd.length * 12)));
  const hasMetrics = /\b\d+%\b|\b\$\d+|\b\d+ years\b|\bmanaged \d+/.test(resumeClean);
  const experienceMatchScore = hasMetrics ? 85 : 50;
  const hasEducation = /bachelor|degree|university|college|gpa|major/.test(resumeClean);
  const educationMatchScore = hasEducation ? 90 : 40;
  let formattingScore = 95;
  if (resumeClean.length > 8000) formattingScore -= 15;
  if (resumeClean.length < 400) formattingScore -= 40;

  let compositeScore = Math.round(
    (domainMatchScore * 0.25) +
    (skillMatchScore * 0.25) +
    (keywordMatchScore * 0.20) +
    (experienceMatchScore * 0.15) +
    (educationMatchScore * 0.10) +
    (formattingScore * 0.05)
  );

  let mismatchReason: string | undefined = undefined;

  // STRICT DOMAIN MISMATCH PENALTY
  if (!domainMatch && jobDomain !== 'General / Technical') {
    compositeScore = Math.floor(Math.random() * 4) + 2; // Strict 2-5%
    mismatchReason = `Domain Mismatch Detected: Your resume is aligned with '${resumeDomain}', whereas the job description requires '${jobDomain}'. A technical developer resume cannot be artificially scored high for an unrelated position (e.g. HR Manager / Marketing).`;
  }

  compositeScore = Math.max(0, Math.min(100, compositeScore));

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  const recommended_phrases: string[] = [];

  if (domainMatch) {
    strengths.push(`Resume belongs correctly to the target sector: ${resumeDomain}.`);
  } else {
    weaknesses.push(`Severe Domain Mismatch: Resume sector is ${resumeDomain}, but Job requires ${jobDomain}.`);
    suggestions.push(`Re-align your profile headline, summary, and experience to fit ${jobDomain}. Do not apply with an irrelevant resume.`);
  }

  if (hasMetrics) {
    strengths.push('Good inclusion of quantitative metrics and numeric achievements.');
  } else {
    weaknesses.push('Lacks quantified metrics or numerical results in experience bullet points.');
    suggestions.push('Add percentages, latency reductions, or efficiency gains to your projects.');
  }

  if (matchedKeywords.length > 0) {
    strengths.push(`Successfully matches target keywords: ${matchedKeywords.slice(0, 4).join(', ')}.`);
  }

  if (skillsMissingFromJd.length > 0) {
    weaknesses.push(`Missing key role requirements: ${skillsMissingFromJd.slice(0, 4).join(', ')}.`);
  }

  missingKeywords.slice(0, 3).forEach(kw => {
    recommended_phrases.push(`Utilized ${kw} to improve application reliability and system performance.`);
  });

  return {
    score: compositeScore,
    match_percentage: compositeScore,
    resumeDomain,
    jobDomain,
    domainMatch,
    mismatchReason,
    categoryBreakdown: {
      domainMatch: domainMatchScore,
      skillMatch: skillMatchScore,
      experienceMatch: experienceMatchScore,
      educationMatch: educationMatchScore,
      keywordMatch: keywordMatchScore,
      formattingScore
    },
    resumeKeywords: Array.from(resumeWords).slice(0, 15),
    matchedKeywords,
    missingKeywords,
    recommendedKeywords,
    skillsPresent: skillsPresent.slice(0, 10),
    skillsMissingFromJd: skillsMissingFromJd.slice(0, 10),
    irrelevantSkillsNotToAdd: irrelevantSkillsNotToAdd.slice(0, 8),
    strengths,
    weaknesses,
    suggestions,
    recommended_phrases
  };
};

