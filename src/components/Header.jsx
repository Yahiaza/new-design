// src/components/Header.jsx
export default function Header({ darkMode, setDarkMode, companyProfile, setIsSidebarOpen }) {
  return (
    <header className="h-20 md:h-24 bg-slate-50/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between px-4 md:px-8 z-10 transition-colors">
      
      <div className="flex items-center gap-3 md:gap-4">
        {/* زرار الموبايل السحري لفتح القائمة */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden w-12 h-12 rounded-xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:scale-105 transition-all shadow-sm"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>

        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl shadow-lg shadow-blue-600/30 border border-blue-500/50 shrink-0">
          {companyProfile?.name ? companyProfile.name.charAt(0) : 'V'}
        </div>
        <div>
          <h2 className="font-black text-lg md:text-xl text-slate-900 dark:text-white leading-tight line-clamp-1">
            {companyProfile?.name || 'مؤسسة فينديلا'}
          </h2>
          <p className="hidden md:block text-sm text-slate-500 font-bold dark:text-slate-400">مرحباً بك في لوحة التحكم</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => {
            setDarkMode(!darkMode);
          }}
          className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 flex items-center justify-center hover:scale-105 transition-all shadow-sm border border-gray-100 dark:border-white/5 group z-50 cursor-pointer shrink-0"
        >
          <i className={`fas ${darkMode ? 'fa-sun text-amber-400' : 'fa-moon text-slate-700'} text-lg md:text-2xl`}></i>
        </button>
      </div>

    </header>
  );
}