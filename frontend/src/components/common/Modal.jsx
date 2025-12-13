import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  preventClose = false,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  showOverlay = true
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, preventClose]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !preventClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${overlayClassName}`}
              onClick={handleOverlayClick}
            />
          )}

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`relative w-full ${sizeClasses[size]} ${className}`}
              >
                <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${contentClassName}`}>
                  {/* Header */}
                  {title && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">{title}</h2>
                        
                        {showCloseButton && !preventClose && (
                          <button
                            onClick={onClose}
                            className="text-white hover:text-blue-200 p-1 rounded-full hover:bg-white/10 transition duration-200"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Close button without title */}
                  {!title && showCloseButton && !preventClose && (
                    <button
                      onClick={onClose}
                      className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition duration-200"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {children}
                  </div>

                  {/* Footer (optional) */}
                  {/* Add footer here if needed */}
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Usage Examples:

// Example 1: Basic Modal
/*
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Add New Expense"
>
  <p>Your content here</p>
</Modal>
*/

// Example 2: Large Modal without title
/*
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  size="lg"
  showCloseButton={true}
>
  <div className="p-6">
    <h3 className="text-xl font-bold mb-4">Custom Title</h3>
    <p>Your content here</p>
  </div>
</Modal>
*/

// Example 3: Modal with custom overlay
/*
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  overlayClassName="backdrop-blur-sm"
  contentClassName="border-4 border-blue-500"
>
  <p>Your content here</p>
</Modal>
*/

export default Modal;

// Additional: Confirmation Modal Component
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // danger, warning, success, info
  isLoading = false
}) => {
  const variantClasses = {
    danger: {
      button: 'bg-red-600 hover:bg-red-700',
      icon: '🔴'
    },
    warning: {
      button: 'bg-yellow-600 hover:bg-yellow-700',
      icon: '⚠️'
    },
    success: {
      button: 'bg-green-600 hover:bg-green-700',
      icon: '✅'
    },
    info: {
      button: 'bg-blue-600 hover:bg-blue-700',
      icon: 'ℹ️'
    }
  };

  const config = variantClasses[variant] || variantClasses.danger;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      preventClose={isLoading}
    >
      <div className="text-center p-2">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">{config.icon}</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition duration-200 disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 text-white rounded-lg font-medium transition duration-200 disabled:opacity-50 ${config.button}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};