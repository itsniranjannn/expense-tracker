import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  X
} from 'lucide-react';

// Create a global toast system
let addToastCallback = null;

export const useToast = () => {
  const showToast = (type, message, options = {}) => {
    if (addToastCallback) {
      addToastCallback({ type, message, ...options });
    } else {
      console.warn('Toast system not initialized');
    }
  };

  return {
    success: (message, options) => showToast('success', message, options),
    error: (message, options) => showToast('error', message, options),
    warning: (message, options) => showToast('warning', message, options),
    info: (message, options) => showToast('info', message, options),
  };
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  // Expose the addToast function globally
  useEffect(() => {
    addToastCallback = (toast) => {
      const id = Date.now();
      const newToast = {
        id,
        ...toast,
        autoClose: toast.autoClose !== false,
        duration: toast.duration || 5000
      };
      
      setToasts(prev => [newToast, ...prev]);

      if (newToast.autoClose) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }
    };

    return () => {
      addToastCallback = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastConfig = (type) => {
    const configs = {
      success: {
        icon: <CheckCircle className="w-5 h-5" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-500'
      },
      error: {
        icon: <XCircle className="w-5 h-5" />,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-500'
      },
      warning: {
        icon: <AlertCircle className="w-5 h-5" />,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-500'
      },
      info: {
        icon: <Info className="w-5 h-5" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-500'
      }
    };
    return configs[type] || configs.info;
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 w-96 max-w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = getToastConfig(toast.type);
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`relative ${config.bgColor} border ${config.borderColor} rounded-xl shadow-lg overflow-hidden`}
            >
              {/* Progress Bar */}
              {toast.autoClose && (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: toast.duration / 1000 }}
                  className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"
                />
              )}

              <div className="p-4">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 ${config.iconColor}`}>
                    {config.icon}
                  </div>
                  
                  <div className="ml-3 flex-1">
                    {toast.title && (
                      <h3 className="text-sm font-semibold mb-1">
                        {toast.title}
                      </h3>
                    )}
                    
                    <p className={`text-sm ${config.textColor}`}>
                      {toast.message}
                    </p>
                    
                    {toast.action && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            toast.action.onClick?.();
                            removeToast(toast.id);
                          }}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          {toast.action.label}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Toast;