// src/components/StatCard.jsx
import { useMemo } from 'react';

export default function StatCard({ title, value, icon, bgColorClass, borderColorClass, subValue, trendData }) {
  const finalColor = borderColorClass ? borderColorClass.replace('border-r-', '') : 'blue';

  return (
    // نظام الـ Bento: كروت منفصلة تماماً، حدود ناعمة جداً، أنيميشن هادئ
    <div className={`relative bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100/50 dark:border-white/5 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 relative group flex flex-col justify-between overflow-hidden`}>
      
      {/* شريطة ملونة خفية على اليمين تظهر بوضوح عند الهايلايت */}
      <div className={`absolute top-0 right-0 h-full w-1 ${borderColorClass || 'border-r-blue-500'} transition-all group-hover:w-1.5`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-slate-900 dark:text-white">{value}</p>
            {subValue && <span className="text-sm text-gray-500 dark:text-gray-400">{subValue}</span>}
          </div>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner ${bgColorClass || 'bg-blue-100 text-blue-600'}`}>
          <i className={`fas ${icon}`}></i>
        </div>
      </div>
      
      {/* رسم بياني صغير (Dummy Sparkline) في الخلفية كعنصر تصميمي */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 dark:opacity-5">
        <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,15 L10,12 L20,18 L30,5 L40,15 L50,8 L60,19 L70,10 L80,14 L90,2 L100,10 V20 H0 Z" fill={finalColor.includes('blue') ? '#3B82F6' : finalColor.includes('emerald') ? '#10B981' : finalColor.includes('amber') ? '#F59E0B' : '#EF4444'} />
        </svg>
      </div>
    </div>
  );
}