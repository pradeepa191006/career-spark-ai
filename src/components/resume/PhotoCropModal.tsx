import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, ZoomIn } from 'lucide-react';

interface PhotoCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  onClose: () => void;
}

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({ imageSrc, onCropComplete, onClose }) => {
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
  }, [imageSrc, scale, offsetX, offsetY]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Save context
    ctx.save();

    // Center of canvas
    ctx.translate(size / 2, size / 2);
    ctx.scale(scale, scale);
    ctx.translate(-size / 2 + offsetX, -size / 2 + offsetY);

    // Draw image scaling to fit size
    const imgRatio = img.width / img.height;
    let dw = size;
    let dh = size;
    let dx = 0;
    let dy = 0;

    if (imgRatio > 1) {
      // wider
      dw = size * imgRatio;
      dx = -(dw - size) / 2;
    } else {
      // taller
      dh = size / imgRatio;
      dy = -(dh - size) / 2;
    }

    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();

    // Draw circular mask representing standard passport crop overlay
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setOffsetX(prev => prev + dx / scale);
    setOffsetY(prev => prev + dy / scale);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.8);
    onCropComplete(croppedBase64);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-850 flex justify-between items-center text-slate-100">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm">Crop Passport Photo</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-850 rounded-lg text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-900/40 relative">
          <div className="border border-slate-700/60 rounded-full overflow-hidden shadow-inner bg-slate-950 select-none cursor-move">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="touch-none"
              style={{ width: '250px', height: '250px' }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Drag on photo to reposition. Use zoom slider below.</p>
        </div>

        {/* Controls */}
        <div className="p-5 border-t border-slate-850 bg-slate-950 space-y-4">
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-slate-400" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="flex-1 accent-indigo-500 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-400">{Math.round(scale * 100)}%</span>
          </div>

          <div className="flex gap-3 justify-end text-xs">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-400 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>Apply Crop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
