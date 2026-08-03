import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, RefreshCw } from 'lucide-react';
import { useToast } from './Toast';

interface FileUploadZoneProps {
  acceptTypes: string[]; // e.g. ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.webp']
  maxSizeMB: number;
  onUploadComplete: (fileUrl: string, fileName: string, fileSize: string) => void;
  onRemove?: () => void;
  initialFileName?: string;
  initialFileSize?: string;
  label?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  acceptTypes,
  maxSizeMB,
  onUploadComplete,
  onRemove,
  initialFileName = '',
  initialFileSize = '',
  label = 'Upload your document'
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState(initialFileName);
  const [fileSize, setFileSize] = useState(initialFileSize);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Validate size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      showToast(`File is too large. Maximum allowed size is ${maxSizeMB}MB.`, 'error');
      return false;
    }

    // Validate type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isAccepted = acceptTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      return file.type.includes(type);
    });

    if (!isAccepted) {
      showToast(`Unsupported file format. Please upload: ${acceptTypes.join(', ')}`, 'error');
      return false;
    }

    return true;
  };

  const simulateUpload = (file: File) => {
    setUploading(true);
    setProgress(0);
    setFileName(file.name);
    
    // Format size
    const sizeKB = Math.round(file.size / 1024);
    const sizeStr = sizeKB > 1024 
      ? (sizeKB / 1024).toFixed(1) + ' MB' 
      : sizeKB + ' KB';
    setFileSize(sizeStr);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 20) + 10;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setUploading(false);
        showToast('File uploaded successfully!', 'success');
        
        // Mock static URL
        const mockUrl = URL.createObjectURL(file);
        onUploadComplete(mockUrl, file.name, sizeStr);
        
        // Save file to localStorage database simulated history
        try {
          const cachedFiles = JSON.parse(localStorage.getItem('uploaded_files_hub') || '[]');
          const newUpload = {
            id: 'file_' + Math.random().toString(36).substring(2, 9),
            name: file.name,
            size: sizeStr,
            type: fileExtension(file.name),
            date: new Date().toLocaleDateString(),
            url: mockUrl
          };
          localStorage.setItem('uploaded_files_hub', JSON.stringify([newUpload, ...cachedFiles]));
        } catch (e) {
          console.error(e);
        }
      }
      setProgress(currentProgress);
    }, 200);
  };

  const fileExtension = (name: string): string => {
    return name.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        simulateUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        simulateUpload(file);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setFileName('');
    setFileSize('');
    setProgress(0);
    if (onRemove) {
      onRemove();
    }
    showToast('File removed.', 'info');
  };

  return (
    <div className="w-full text-xs">
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>

      {fileName ? (
        /* File Uploaded view */
        <div className="p-4 rounded-xl border border-indigo-500/20 bg-slate-900/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
              <File className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-200 truncate">{fileName}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{fileSize} • {fileExtension(fileName)}</p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleBrowseClick}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Replace File"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleRemove}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Drag & drop dropzone */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-indigo-500 bg-indigo-500/5' 
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/10'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={acceptTypes.join(',')}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 mx-auto animate-spin" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-300">Uploading File... {progress}%</p>
                <div className="w-32 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <UploadCloud className="w-8 h-8 text-slate-500 mx-auto" />
              <div>
                <p className="font-bold text-slate-300">Drag & drop file here, or <span className="text-indigo-400 underline">browse</span></p>
                <p className="text-[10px] text-slate-500 mt-1">Supports: {acceptTypes.join(', ')} (Max {maxSizeMB}MB)</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
