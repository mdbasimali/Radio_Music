import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Trash2, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

// Custom modal configuration
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, deleteCount }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Handle Escape press
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const getDynamicMessage = () => {
    if (message) return message;
    if (deleteCount === undefined) return 'Are you sure you want to delete this? This action cannot be undone.';
    if (deleteCount === 1) return 'Are you sure you want to delete this track? This action cannot be undone.';
    return `Are you sure you want to delete these ${deleteCount} tracks? This action cannot be undone.`;
  };

  return ReactDOM.createPortal(
    <div 
      onClick={handleOutsideClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-md bg-surface-900 border border-surface-800 shadow-2xl rounded-2xl p-6 text-center transform scale-95 animate-scale-up"
      >
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
          <Trash2 size={24} />
        </div>
        
        <h3 className="text-lg font-bold text-surface-100 mb-2">
          {title || 'Delete Selected?'}
        </h3>
        
        <p className="text-sm text-surface-400 mb-6 px-2">
          {getDynamicMessage()}
        </p>

        <div className="flex items-center gap-3 justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 border border-surface-700/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Global Toast manager helper states
let toastListeners = [];
export const toast = {
  success: (msg) => notify('success', msg),
  error: (msg) => notify('error', msg),
  info: (msg) => notify('info', msg),
};

function notify(type, message) {
  const id = Math.random().toString(36).substring(7);
  toastListeners.forEach(listener => listener({ id, type, message }));
}

// Custom Toast notification provider
export function ToastContainer() {
  const [toasts, setToasts] = React.useState([]);

  useEffect(() => {
    const handleNotification = (newToast) => {
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 4000);
    };

    toastListeners.push(handleNotification);
    return () => {
      toastListeners = toastListeners.filter(l => l !== handleNotification);
    };
  }, []);

  return ReactDOM.createPortal(
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 className="text-emerald-400" size={18} />,
          error: <AlertTriangle className="text-red-400" size={18} />,
          info: <Info className="text-blue-400" size={18} />,
        };
        const colors = {
          success: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300',
          error: 'border-red-500/20 bg-red-500/5 text-red-300',
          info: 'border-blue-500/20 bg-blue-500/5 text-blue-300',
        };

        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-lg animate-slide-in ${colors[t.type]}`}
          >
            {icons[t.type]}
            <p className="text-xs font-semibold flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-surface-400 hover:text-surface-200 transition-colors p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
