import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../components/common/Toast';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { getScopedStorage, setScopedStorage } from '../utils/storageHelper';
import { 
  File, Search, Download, Trash2, Eye, RefreshCw, Upload,
  Calendar, Layers, CheckCircle2, HardDrive, Edit3, X
} from 'lucide-react';

export type FileCategory = 'Resume' | 'Certificates' | 'Profile Photo' | 'Portfolio Images' | 'Project Images' | 'Documents';

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  category: FileCategory;
  date: string;
  url: string;
}

export const FileManager: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modals state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [renameFile, setRenameFile] = useState<UploadedFile | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load files with user isolation
  useEffect(() => {
    loadFiles();
  }, [user]);

  const loadFiles = () => {
    const cached = getScopedStorage<UploadedFile[]>('uploaded_files_hub', user?.id, []);
    if (cached && cached.length) {
      setFiles(cached);
    } else {
      const defaults: UploadedFile[] = [
        { id: '1', name: 'Alex_Resume_Software_Eng.pdf', size: '245 KB', type: 'PDF', category: 'Resume', date: new Date().toLocaleDateString(), url: '' },
        { id: '2', name: 'Profile_Passport_Photo.png', size: '1.2 MB', type: 'PNG', category: 'Profile Photo', date: new Date().toLocaleDateString(), url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
        { id: '3', name: 'AWS_Cloud_Practitioner_Cert.pdf', size: '410 KB', type: 'PDF', category: 'Certificates', date: new Date().toLocaleDateString(), url: '' }
      ];
      setScopedStorage('uploaded_files_hub', defaults, user?.id);
      setFiles(defaults);
    }
  };


  const handleDownload = (file: UploadedFile) => {
    showToast(`Downloading ${file.name}...`, 'info');
    if (file.url && file.url !== '#') {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create a dummy text file blob download for demo documents
      const blob = new Blob([`Sample content for document: ${file.name}\nCategory: ${file.category}\nUploaded: ${file.date}`], { type: 'text/plain' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }
    showToast(`${file.name} download initiated.`, 'success');
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const updated = files.filter(f => f.id !== deleteId);
    setFiles(updated);
    setScopedStorage('uploaded_files_hub', updated, user?.id);
    showToast('File deleted successfully.', 'success');
    setDeleteId(null);
  };

  const inferCategory = (fileName: string): FileCategory => {
    const lower = fileName.toLowerCase();
    if (lower.includes('resume') || lower.includes('cv')) return 'Resume';
    if (lower.includes('cert') || lower.includes('license') || lower.includes('award')) return 'Certificates';
    if (lower.includes('photo') || lower.includes('avatar') || lower.includes('profile')) return 'Profile Photo';
    if (lower.includes('portfolio') || lower.includes('screenshot')) return 'Portfolio Images';
    if (lower.includes('project') || lower.includes('demo')) return 'Project Images';
    return 'Documents';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeKB = Math.round(file.size / 1024);
      const sizeStr = sizeKB > 1024 
        ? (sizeKB / 1024).toFixed(1) + ' MB' 
        : sizeKB + ' KB';
      
      const newFile: UploadedFile = {
        id: 'file_' + Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: sizeStr,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        category: inferCategory(file.name),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        url: URL.createObjectURL(file)
      };

      const updated = [newFile, ...files];
      setFiles(updated);
      setScopedStorage('uploaded_files_hub', updated, user?.id);
      showToast(`${file.name} uploaded successfully!`, 'success');
    }
  };

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!replaceTargetId) return;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeKB = Math.round(file.size / 1024);
      const sizeStr = sizeKB > 1024 
        ? (sizeKB / 1024).toFixed(1) + ' MB' 
        : sizeKB + ' KB';

      const updated = files.map(f => {
        if (f.id === replaceTargetId) {
          return {
            ...f,
            name: file.name,
            size: sizeStr,
            type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
            category: inferCategory(file.name),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            url: URL.createObjectURL(file)
          };
        }
        return f;
      });

      setFiles(updated);
      setScopedStorage('uploaded_files_hub', updated, user?.id);
      showToast('File replaced successfully!', 'success');
      setReplaceTargetId(null);
    }
  };

  const handleSaveRename = () => {
    if (!renameFile || !newFileName.trim()) return;
    const updated = files.map(f => {
      if (f.id === renameFile.id) {
        return {
          ...f,
          name: newFileName.trim()
        };
      }
      return f;
    });
    setFiles(updated);
    setScopedStorage('uploaded_files_hub', updated, user?.id);
    showToast('File renamed successfully!', 'success');
    setRenameFile(null);
    setNewFileName('');
  };

  const categories: string[] = ['All', 'Resume', 'Certificates', 'Profile Photo', 'Portfolio Images', 'Project Images', 'Documents'];

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.type.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 text-xs leading-normal">
      {/* Hidden Replace File Input */}
      <input
        type="file"
        ref={replaceFileInputRef}
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* Hidden Upload File Input */}
      <input
        type="file"
        ref={uploadFileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-500" />
            <span>Recruiter & Student Files Hub</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access, upload, rename, replace, and organize your job search documents across categories.
          </p>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => uploadFileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-755 text-white font-semibold py-2.5 px-4 rounded-xl cursor-pointer shadow-lg transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New File</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <File className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Total Uploads</p>
            <p className="text-lg font-black text-slate-200 mt-0.5">{files.length} Files</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Categories Tracked</p>
            <p className="text-lg font-black text-slate-200 mt-0.5">6 Categories</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Active Storage</p>
            <p className="text-lg font-black text-slate-200 mt-0.5">2.4 MB</p>
          </div>
        </div>
      </div>

      {/* Main Files Table/Grid */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        {/* Search & Category Filter Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full glass-input pl-10 text-xs py-2"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex bg-slate-900/60 border border-slate-850 p-1 rounded-xl gap-0.5 overflow-x-auto max-w-full text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 font-semibold rounded-lg transition-all whitespace-nowrap ${
                  selectedCategory === cat ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredFiles.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-slate-800 text-[10px] text-slate-500 uppercase font-bold">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Size</th>
                  <th className="pb-3">Uploaded Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-855">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-900/10 group">
                    <td className="py-3.5 flex items-center gap-2.5 min-w-[220px]">
                      <File className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                      <span className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">{file.name}</span>
                    </td>
                    <td className="py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {file.category}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-450">{file.type}</td>
                    <td className="py-3.5 text-slate-450">{file.size}</td>
                    <td className="py-3.5 text-slate-450">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        <span>{file.date}</span>
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setRenameFile(file);
                            setNewFileName(file.name);
                          }}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
                          title="Rename"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setReplaceTargetId(file.id);
                            replaceFileInputRef.current?.click();
                          }}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
                          title="Replace File"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(file.id)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 border border-dashed dark:border-slate-800 rounded-xl">
            <File className="w-10 h-10 mx-auto text-slate-700 mb-2" />
            <p className="font-semibold text-sm text-slate-300">No files matched your query.</p>
            <p className="text-[10px] text-slate-550 mt-0.5">Try searching with a different extension or selecting another category.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Alert */}
      <ConfirmationModal
        isOpen={deleteId !== null}
        title="Confirm Deletion"
        message="Are you sure you want to permanently delete this file? This action is irreversible."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Rename Modal */}
      {renameFile && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setRenameFile(null)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-200">Rename File</h3>
              <button onClick={() => setRenameFile(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">New File Name</label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full glass-input text-xs py-2 px-3"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRenameFile(null)}
                className="px-4 py-2 border border-slate-800 text-slate-400 rounded-xl font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl font-semibold"
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setPreviewFile(null)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-200">{previewFile.name}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{previewFile.category} • {previewFile.size}</p>
              </div>
              <button onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewFile.url && previewFile.url.match(/\.(png|jpg|jpeg|webp)$/i) ? (
              <div className="w-full max-h-[300px] overflow-hidden rounded-xl border dark:border-slate-800 flex items-center justify-center bg-slate-955 p-4">
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name}
                  className="max-w-full max-h-[250px] object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950/20 border border-slate-800 rounded-xl space-y-2">
                <File className="w-12 h-12 text-indigo-400 mx-auto" />
                <p className="font-semibold text-slate-200">{previewFile.name}</p>
                <p className="text-[10px] text-slate-400">Category: {previewFile.category} • Type: {previewFile.type}</p>
                <p className="text-[10px] text-slate-500 italic mt-2">Document is ready for recruiter sharing or PDF processing.</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleDownload(previewFile)}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-650 hover:bg-indigo-755 text-white rounded-xl font-bold transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
