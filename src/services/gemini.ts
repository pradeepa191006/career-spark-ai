import { GoogleGenerativeAI } from '@google/generative-ai';
import { computeAtsScore } from '../utils/atsEngine';

// Retrieve API key from environment or localStorage for flexible student developer setups
const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || '';
};

export const hasGeminiKey = () => {
  return getApiKey().trim().length > 0;
};

// Lazy initialization of the Gemini client
const getGeminiClient = () => {
  const key = getApiKey();
  if (!key) {
    throw new Error('Gemini API key is missing. Configure it in Settings or add VITE_GEMINI_API_KEY to your .env file.');
  }
  return new GoogleGenerativeAI(key);
};

/**
 * Text generation utility using Gemini
 * @param prompt The string prompt to send to the AI
 * @param systemInstruction Optional system instruction to guide the AI persona
 * @param jsonMode Force response to be JSON
 */
export const generateText = async (
  prompt: string,
  systemInstruction?: string,
  jsonMode = false
): Promise<string> => {
  try {
    if (!hasGeminiKey()) {
      return getMockResponse(prompt);
    }

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined,
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

/**
 * Multimodal image/video frame analysis for interview feedback
 */
export const generateMultimodalContent = async (
  prompt: string,
  imageParts: { inlineData: { data: string; mimeType: string } }[],
  systemInstruction?: string
): Promise<string> => {
  try {
    if (!hasGeminiKey()) {
      return JSON.stringify({
        confidence_score: 85,
        content_score: 80,
        strengths: ['Great posture and framing', 'Professional mock interview engagement'],
        improvements: ['Reduce filler words', 'Try to look more consistently at the camera lens'],
        overall_feedback: 'This is mock feedback. Connect your Gemini API Key in Settings to get real-time facial/posture AI confidence feedback!'
      });
    }

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent([prompt, ...imageParts]);
    return result.response.text();
  } catch (error: any) {
    console.error('Gemini Multimodal Error:', error);
    throw error;
  }
};

// Intelligent fallbacks when API key is missing
const getMockResponse = async (prompt: string): Promise<string> => {
  // Let's simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const promptLower = prompt.toLowerCase();

  if (promptLower.includes('ats') || promptLower.includes('score')) {
    const jdIndex = prompt.indexOf('JOB DESCRIPTION:');
    const resumeIndex = prompt.indexOf('RESUME:');
    let jd = "";
    let resume = "";
    if (jdIndex !== -1 && resumeIndex !== -1) {
      jd = prompt.substring(jdIndex + 'JOB DESCRIPTION:'.length, resumeIndex).trim();
      resume = prompt.substring(resumeIndex + 'RESUME:'.length).trim();
    }
    const report = computeAtsScore(resume, jd);
    return JSON.stringify(report);
  }

  if (promptLower.includes('rewrite') || promptLower.includes('bullet')) {
    return '• Spearheaded frontend engineering of a Career Platform, boosting user interaction metrics by 40% through responsive design.';
  }

  if (promptLower.includes('cover letter')) {
    return `Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer position. As a student at State Technical University majoring in Computer Science, my experiences building React platforms and configuring database workflows align directly with your requirements.

I look forward to the opportunity to discuss my qualifications further.

Sincerely,
Alex Sparker`;
  }

  if (promptLower.includes('gap') || promptLower.includes('skill')) {
    return JSON.stringify({
      missing_skills: ['Docker', 'AWS S3', 'Redis Caching'],
      recommendations: [
        { type: 'course', title: 'Docker for Web Developers', provider: 'Udemy (Free)', link: '#' },
        { type: 'project', title: 'Deploy a Multi-container Web App on AWS', provider: 'Project Idea', link: '#' }
      ]
    });
  }

  return 'Career Spark AI: This is a placeholder mock response. Please add your Gemini API Key in Settings to enable real AI generation!';
};
