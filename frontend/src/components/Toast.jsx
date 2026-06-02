import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

let toastTimeout;
let globalToastCallback = null;

export const useToast = () => {
  const showToast = useCallback((message, type = 'info') => {
    if (globalToastCallback) {
      globalToastCallback(message, type);
    }
  }, []);

  return { showToast };
};

export const ToastContainer = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    globalToastCallback = (message, type) => {
      setToast({ message, type });
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        setToast(null);
      }, 3000);
    };

    return () => {
      globalToastCallback = null;
    };
  }, []);

  if (!toast) return null;

  const bgColors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-orange-50 border-orange-200 text-orange-800'
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-orange-500'
  };

  const Icon = toast.type === 'success' ? CheckCircle : 
               toast.type === 'error' ? XCircle : Info;

  return (
    <div className="fixed bottom-6 right-6 z-50 transform transition-all duration-300 translate-y-0 opacity-100">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[300px] ${bgColors[toast.type] || bgColors.info}`}>
        <Icon className={iconColors[toast.type] || iconColors.info} size={20} />
        <p className="font-medium text-sm flex-1">{toast.message}</p>
        <button 
          onClick={() => setToast(null)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
