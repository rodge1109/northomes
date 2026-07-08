import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Eraser, Check } from 'lucide-react';

export default function SignaturePadModal({ isOpen, onClose, onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Set fixed resolution
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Set background to white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Setup pen
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000000';
    }
  }, [isOpen]);

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Support for both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (e) e.preventDefault();
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-[#f8f9fa]">
          <div>
            <h3 className="text-base font-black text-black/80">Digital Signature</h3>
            <p className="text-xs text-black/50 font-medium">Please sign inside the box below.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white rounded-full border border-black/5 hover:bg-gray-50 text-black/40 hover:text-black transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-6 bg-gray-50 flex-1 relative flex flex-col items-center">
          <div className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl overflow-hidden shadow-inner relative" style={{ height: '400px' }}>
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onTouchCancel={stopDrawing}
            />
            {/* Guide line */}
            <div className="absolute bottom-16 left-12 right-12 border-b-2 border-black/10 pointer-events-none"></div>
            <div className="absolute bottom-10 left-0 right-0 text-center text-xs font-bold text-black/20 uppercase tracking-widest pointer-events-none">Sign Here</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-black/5 bg-white flex items-center justify-between">
          <button 
            onClick={clearSignature}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-black/10 text-black/60 font-bold text-sm hover:bg-gray-50 hover:text-black transition-all"
          >
            <Eraser size={18} />
            Clear
          </button>
          
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#005530] text-white font-bold text-sm hover:bg-[#004420] transition-all shadow-md hover:-translate-y-0.5"
          >
            <Check size={18} strokeWidth={3} />
            Save Signature
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
