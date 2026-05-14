// src/components/Sidebar.jsx
export default function Sidebar({ currentView, setAppState, isOpen, setIsOpen }) {
  // ضفنا المحذوفات هنا بشكل احترافي
  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: 'fa-chart-pie' },
    { id: 'calendar', label: 'التقويم', icon: 'fa-calendar-alt' },
    { id: 'properties', label: 'العقارات', icon: 'fa-building' },
    { id: 'tenants', label: 'المستأجرين', icon: 'fa-users' },
    { id: 'rentals', label: 'المالية والمطالبات', icon: 'fa-file-invoice-dollar' },
    { id: 'settings', label: 'الإعدادات', icon: 'fa-cog' },
    { id: 'trash', label: 'سجل المحذوفات', icon: 'fa-trash-restore' }
    
  ];

  return (
    <>
      {/* خلفية ضبابية تظهر في الموبايل لما القائمة تفتح */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* القائمة نفسها - متجاوبة مع الموبايل والديسكتوب */}
      <aside className={`fixed md:relative inset-y-0 right-0 z-50 w-72 bg-white dark:bg-[#1E293B] border-l border-gray-100 dark:border-white/5 flex flex-col transition-transform duration-300 shrink-0 ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        
        {/* زرار إغلاق القائمة في الموبايل */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-6 left-6 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:text-red-500 transition-colors"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="h-24 flex items-center justify-center border-b border-gray-100 dark:border-white/5 mx-6">
          <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-l from-blue-600 to-emerald-500 bg-clip-text text-transparent flex items-center gap-3">
            <i className="fas fa-city text-blue-600 text-2xl"></i> إدارة الأملاك
          </h1>
        </div>
        
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
          {navItems.map(item => {
            const isActive = currentView === item.id || (!currentView && item.id === 'dashboard');
            
            // لون مميز (أحمر) لسجل المحذوفات، وأزرق للباقي
            const activeBgClass = item.id === 'trash' 
              ? 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400 shadow-sm scale-[1.02]' 
              : 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm scale-[1.02]';
              
            const activeIconClass = item.id === 'trash'
              ? 'bg-red-100 dark:bg-red-500/30'
              : 'bg-blue-100 dark:bg-blue-500/30';

            return (
              <button
                key={item.id}
                onClick={() => {
                  setAppState(prev => ({ ...prev, currentView: item.id }));
                  setIsOpen(false); // تقفل القائمة بعد الاختيار في الموبايل
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group ${
                  isActive 
                    ? activeBgClass 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isActive ? activeIconClass : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'}`}>
                  <i className={`fas ${item.icon} text-sm`}></i>
                </div>
                <span className="text-lg">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-100 dark:border-white/5">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold">
            <i className="fas fa-shield-alt"></i> نظام محمي ومحلي
          </div>
        </div>
      </aside>
    </>
  );
}