// src/components/Toast.jsx
import React from 'react';

export default function Toast({ message, type }) {
  const isSuccess = type === 'success';
  const isError = type === 'error';
  
  // تحديد الألوان بناءً على نوع الرسالة
  const borderColor = isSuccess ? 'border-emerald-500/30' : isError ? 'border-red-500/30' : 'border-blue-500/30';
  const shadowColor = isSuccess ? 'shadow-emerald-500/20' : isError ? 'shadow-red-500/20' : 'shadow-blue-500/20';
  const stripColor = isSuccess ? 'bg-emerald-500' : isError ? 'bg-red-500' : 'bg-blue-500';
  const iconGradient = isSuccess ? 'from-emerald-400 to-emerald-600' : isError ? 'from-red-400 to-red-600' : 'from-blue-400 to-blue-600';
  const iconName = isSuccess ? 'fa-check' : isError ? 'fa-exclamation' : 'fa-info';

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex justify-center w-full px-4">
      <div className={`
        relative overflow-hidden flex items-center gap-4 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl 
        bg-white/90 dark:bg-[#1E293B]/90 
        ${borderColor} ${shadowColor}
        toast-animation
      `}>
        {/* شريط الإضاءة الجانبي */}
        <div className={`absolute right-0 top-0 w-1.5 h-full ${stripColor}`}></div>
        
        {/* الأيقونة المضيئة */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner text-white bg-gradient-to-br ${iconGradient}`}>
          <i className={`fas ${iconName} text-lg`}></i>
        </div>
        
        {/* نص الرسالة */}
        <div className="pl-4 pr-1">
          <p className="font-bold text-slate-800 dark:text-white text-sm">{message}</p>
        </div>
      </div>

      {/* الأنيميشن الناعم المدمج */}
      <style>{`
        .toast-animation {
          animation: dropBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes dropBounce {
          0% { transform: translateY(-40px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}