// src/components/Modal.jsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children }) {
  // السطر ده عشان النافذة تعرف إحنا في أي وضع حالياً
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // أول ما النافذة تفتح، بتسأل الذاكرة: إحنا دارك ولا لايت؟
      setIsDarkMode(localStorage.getItem('theme') === 'dark');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    // هنا قفشنا النافذة ولبسناها الدارك مود غصب عنها لو الوضع شغال
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        
        {/* الخلفية الضبابية */}
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        ></div>

        {/* النافذة الفاخرة */}
        <div className="relative w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-white/10 animate-scale-in text-right">
          
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400 transition-colors flex items-center justify-center shrink-0">
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto custom-scrollbar max-h-[75vh]">
            {children}
          </div>
          
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}