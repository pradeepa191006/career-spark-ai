import React, { useState } from 'react';
import { generateText } from '../services/gemini';
import { 
  HelpCircle, MessageSquare, Send, Sparkles, Plus, CheckCircle2, 
  Search, BookOpen, Video, AlertTriangle, FileText, X
} from 'lucide-react';

export const HelpCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faqs' | 'guide' | 'tutorials' | 'ticket'>('faqs');
  const [searchQuery, setSearchQuery] = useState('');

  const [faqs, setFaqs] = useState([
    {
      q: 'How does the ATS Scanner compute scores?',
      a: 'Our scanner extracts key structural sections (experience, projects, skills) and compares the semantic density of skills and keywords in your resume against target job requirements.',
      category: 'ATS & Resume',
      open: false
    },
    {
      q: 'Can I export my resume as a PDF or DOCX file?',
      a: 'Yes! The AI Resume Builder includes pixel-perfect single-page A4 PDF downloads as well as DOCX Word export options.',
      category: 'ATS & Resume',
      open: false
    },
    {
      q: 'How does the Video Interview AI analyze posture & eye contact?',
      a: 'We process camera frames at short intervals during your mock interview and analyze eye alignment, posture stability, and facial confidence ratings.',
      category: 'Interview Prep',
      open: false
    },
    {
      q: 'How do I import my existing PDF or DOCX resume?',
      a: 'In the Resume Builder, click "Import Resume (PDF/DOCX)" in the top action bar. The system will parse your document text and auto-fill editable fields!',
      category: 'ATS & Resume',
      open: false
    },
    {
      q: 'Is my data secure when using Career Spark AI?',
      a: 'Yes. All authentication sessions, document uploads, and profile details are stored locally and encrypted according to strict privacy guidelines.',
      category: 'Account & Security',
      open: false
    }
  ]);

  const userGuideModules = [
    { title: 'Resume Builder & Importer', icon: FileText, desc: 'Upload existing resumes (PDF/DOCX) or build from scratch using standard A4 layouts, passport photo cropping, and live previews.' },
    { title: 'ATS Analyzer & Optimizer', icon: Sparkles, desc: 'Audit resume keyword match percentages against target job descriptions and inject high-impact action verbs.' },
    { title: 'AI Mock Interviews', icon: Video, desc: 'Practice voice and video placement questions with live audio waveform analysis, eye-contact tracking, and posture coaching.' },
    { title: 'File Manager Hub', icon: BookOpen, desc: 'Organize certificates, resumes, portfolio images, and profile photos into categorized cloud storage.' }
  ];

  const videoTutorials = [
    { title: 'Mastering the AI Resume Builder & PDF Exporter', duration: '4:15', thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400', desc: 'Learn how to import existing resumes and format single-page A4 drafts.' },
    { title: 'Ace Placement Mock Video Interviews', duration: '6:30', thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', desc: 'Understand real-time eye contact tracking and verbal fluency scoring.' },
    { title: 'Optimizing your ATS Match Score over 85%', duration: '5:10', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400', desc: 'Discover how keyword density and domain classification impact shortlist rankings.' }
  ];

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Report Issue Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueSuccess, setIssueSuccess] = useState(false);

  // Floating AI Chat Widget state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'ai', text: 'Hi! I am your Career Spark AI Support Assistant. How can I help you navigate the platform, prepare for interviews, or optimize your resume today?' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const toggleFaq = (index: number) => {
    setFaqs(prev => prev.map((faq, i) => i === index ? { ...faq, open: !faq.open } : faq));
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    const newTicket = {
      id: Math.random().toString(36).substring(2, 9),
      subject: ticketSubject,
      message: ticketMessage,
      status: 'Open',
      date: new Date().toLocaleDateString()
    };

    setTickets(prev => [newTicket, ...prev]);
    setTicketSubject('');
    setTicketMessage('');
    setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 3000);
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle.trim() || !issueDesc.trim()) return;
    setIssueSuccess(true);
    setTimeout(() => {
      setIssueSuccess(false);
      setReportModalOpen(false);
      setIssueTitle('');
      setIssueDesc('');
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    const prompt = `
      You are a friendly AI Support Assistant on Career Spark AI.
      Answer this student support question: "${chatInput}"
      Keep your answer clear, encouraging, and under 80 words.
    `;

    try {
      const reply = await generateText(prompt, 'You are a career platform support assistant.');
      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Career Spark AI Support: Feel free to check our FAQs or submit a support ticket if you need immediate assistance!' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto relative text-xs leading-normal">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b dark:border-[#143D32] pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-500" />
            <span>Help & Learning Center</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Explore platform guides, video tutorials, FAQs, or contact our support team.</p>
        </div>

        <button
          onClick={() => setReportModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 font-semibold border border-orange-500/20 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Report an Issue</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-500 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Help Center articles, FAQs, or guide topics..."
          className="w-full glass-input text-xs py-2 bg-transparent border-none focus:outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-[#0B2A22]/80 border border-slate-200 dark:border-[#143D32] p-1 rounded-xl gap-0.5">
        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'faqs' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>FAQs</span>
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'guide' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>User Guide</span>
        </button>
        <button
          onClick={() => setActiveTab('tutorials')}
          className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'tutorials' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Video Tutorials</span>
        </button>
        <button
          onClick={() => setActiveTab('ticket')}
          className={`flex-1 py-2 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ticket' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Contact Support</span>
        </button>
      </div>

      {/* TAB 1: FAQs */}
      {activeTab === 'faqs' && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 dark:border-[#143D32] rounded-xl overflow-hidden text-xs">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 text-left font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#0B2A22] flex justify-between items-center bg-slate-50 dark:bg-[#071C17]/50 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] uppercase border border-emerald-500/20">{faq.category}</span>
                    <span>{faq.q}</span>
                  </span>
                  <span className="text-lg font-bold text-slate-400">{faq.open ? '−' : '+'}</span>
                </button>
                {faq.open && (
                  <div className="p-4 bg-white dark:bg-[#071C17]/60 text-slate-600 dark:text-slate-300 leading-relaxed border-t dark:border-[#143D32]">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: User Guide */}
      {activeTab === 'guide' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {userGuideModules.map((mod, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl space-y-3 border border-slate-200 dark:border-[#143D32]">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl w-fit">
                <mod.icon className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{mod.title}</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{mod.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Video Tutorials */}
      {activeTab === 'tutorials' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {videoTutorials.map((tut, idx) => (
            <div key={idx} className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-[#143D32] flex flex-col group">
              <div className="relative aspect-video bg-black">
                <img src={tut.thumbnail} alt={tut.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80" />
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-white">
                  {tut.duration}
                </div>
              </div>
              <div className="p-5 flex-1 space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-normal">{tut.title}</h4>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">{tut.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Contact Support & Ticket Log */}
      {activeTab === 'ticket' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Log Support Ticket</h3>
            {ticketSuccess && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Ticket submitted successfully! Our support engineers will contact your email.</span>
              </div>
            )}
            <form onSubmit={handleCreateTicket} className="glass-card p-6 rounded-2xl space-y-4 border border-slate-200 dark:border-[#143D32]">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Issue scanning PDF resume details"
                  className="w-full glass-input text-xs py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Detailed Message</label>
                <textarea
                  required
                  rows={5}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your issue or feedback in detail..."
                  className="w-full glass-input text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>
            </form>
          </div>

          {/* Ticket history */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket History</h3>
            {tickets.length ? (
              <div className="space-y-3">
                {tickets.map(t => (
                  <div key={t.id} className="p-4 bg-slate-50 dark:bg-[#071C17]/60 rounded-xl border border-slate-200 dark:border-[#143D32] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{t.subject}</span>
                      <span className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">{t.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate">{t.message}</p>
                    <span className="text-[8px] text-slate-500 font-mono block pt-1">{t.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 border border-dashed border-slate-200 dark:border-[#143D32] rounded-xl">
                No past tickets logged.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setReportModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#10352C] border border-slate-200 dark:border-[#143D32] p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b dark:border-[#143D32] pb-3">
              <h3 className="font-bold text-sm text-red-500 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Report Platform Issue</span>
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {issueSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs">
                Issue report logged! Thank you for helping us improve.
              </div>
            )}

            <form onSubmit={handleReportIssue} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Issue Title</label>
                <input
                  type="text"
                  required
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="e.g. Broken preview formatting"
                  className="w-full glass-input text-xs py-2 px-3"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">Issue Description</label>
                <textarea
                  required
                  rows={4}
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="Provide steps to reproduce..."
                  className="w-full glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-[#143D32] text-slate-600 dark:text-slate-400 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-[#0B2A22] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold cursor-pointer"
                >
                  Submit Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating AI Assistant Toggler */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-2xl shadow-emerald-500/30 transition-all flex items-center justify-center hover:scale-105 border border-emerald-500/30 cursor-pointer"
          aria-label="Toggle AI Help"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* Chat Drawer Side Widget */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[450px] glass-card rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-emerald-500/30">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-bold text-sm">Career Spark AI Assistant</span>
            </div>
            <button 
              onClick={() => setChatOpen(false)}
              className="text-white hover:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Hide
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-[#071C17] text-xs leading-relaxed">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[80%] ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-sm' 
                    : 'bg-white dark:bg-[#10352C] border border-slate-200 dark:border-[#143D32] text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="p-3 bg-white dark:bg-[#10352C] border border-slate-200 dark:border-[#143D32] text-slate-400 rounded-2xl rounded-tl-none animate-pulse">
                  AI is thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-[#0B2A22] border-t border-slate-200 dark:border-[#143D32] flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a support question..."
              className="flex-1 glass-input py-1.5 px-3 text-xs"
            />
            <button
              type="submit"
              className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg transition-all shrink-0 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
