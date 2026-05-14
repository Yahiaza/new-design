// src/pages/Calendar.jsx
import { useState, useMemo } from 'react';

export default function Calendar({ state }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { tenants = [], charges = [] } = state;
  const todayStr = new Date().toISOString().split('T')[0];

  // مصفوفة الشهور العربية
  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  // حساب أيام الشهر
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // تعديل البداية لتناسب التقويم العربي (السبت أو الأحد)
    const days = [];
    for (let i = 0; i < (firstDay + 0) % 7; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push(dateStr);
    }
    return days;
  }, [currentDate]);

  // جلب الأحداث لكل يوم
  const getEventsForDate = (dateStr) => {
    if (!dateStr) return [];
    const events = [];
    
    // عقود تنتهي
    tenants.filter(t => !t.deletedAt && t.endDate === dateStr).forEach(t => {
      events.push({ type: 'expiry', title: `انتهاء عقد: ${t.name}`, icon: 'fa-file-contract', color: 'bg-red-500' });
    });

    // مطالبات مستحقة (فوترة)
    charges.filter(c => !c.deletedAt && c.date === dateStr).forEach(c => {
      const t = tenants.find(x => x.id === c.tenantId);
      events.push({ type: 'charge', title: `استحقاق لـ: ${t?.name || 'مستأجر'}`, icon: 'fa-money-bill-wave', color: 'bg-blue-500' });
    });

    return events;
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

  const selectedEvents = getEventsForDate(selectedDate);

  return (
    <div className="section-view active animate-fadeIn space-y-6">
      
      {/* الهيدر */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-600/20">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">أجندة العقارات</h2>
            <p className="text-slate-500 text-sm">تابع المواعيد الهامة والتحصيلات</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-black/20 p-2 rounded-2xl border border-slate-100 dark:border-white/5">
          <button onClick={prevMonth} className="w-10 h-10 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-blue-600"><i className="fas fa-chevron-right"></i></button>
          <span className="text-lg font-black text-slate-800 dark:text-white min-w-[120px] text-center">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="w-10 h-10 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-blue-600"><i className="fas fa-chevron-left"></i></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* التقويم */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
          <div className="grid grid-cols-7 mb-4">
            {['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
              <div key={day} className="text-center text-xs font-black text-slate-400 py-2 uppercase">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {calendarData.map((date, idx) => {
              const events = getEventsForDate(date);
              const isSelected = date === selectedDate;
              const isToday = date === todayStr;

              return (
                <div 
                  key={idx} 
                  onClick={() => date && setSelectedDate(date)}
                  className={`
                    h-20 sm:h-28 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-start gap-1 relative overflow-hidden
                    ${!date ? 'bg-transparent border-transparent' : 'bg-slate-50/50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-blue-500/50'}
                    ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-500/10' : ''}
                  `}
                >
                  {date && (
                    <>
                      <span className={`text-sm font-black ${isToday ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-lg shadow-md' : 'text-slate-500 dark:text-slate-400'}`}>
                        {date.split('-')[2]}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {events.slice(0, 3).map((ev, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${ev.color}`}></div>
                        ))}
                        {events.length > 3 && <span className="text-[10px] text-slate-400">+{events.length - 3}</span>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* تفاصيل اليوم */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm p-6 flex flex-col h-full">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <i className="fas fa-clock text-blue-500"></i> أحداث يوم {selectedDate}
            </h3>
            
            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {selectedEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <i className="fas fa-calendar-check text-2xl"></i>
                  </div>
                  <p className="text-slate-400 text-sm font-bold">لا توجد مواعيد مسجلة في هذا اليوم</p>
                </div>
              ) : (
                selectedEvents.map((ev, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 group hover:scale-[1.02] transition-transform">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${ev.color}`}>
                      <i className={`fas ${ev.icon}`}></i>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-sm">{ev.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black mt-0.5">{ev.type === 'expiry' ? 'تنبيه إخلاء / تجديد' : 'مطالبة مالية'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* ملخص الشهر السريع */}
            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-2xl text-center">
                        <p className="text-[10px] text-red-600 font-bold mb-1">عقود تنتهي</p>
                        <p className="text-xl font-black text-red-700 dark:text-red-400">{tenants.filter(t => !t.deletedAt && t.endDate?.startsWith(currentDate.toISOString().slice(0, 7))).length}</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-center">
                        <p className="text-[10px] text-blue-600 font-bold mb-1">فواتير الشهر</p>
                        <p className="text-xl font-black text-blue-700 dark:text-blue-400">{charges.filter(c => !c.deletedAt && c.date?.startsWith(currentDate.toISOString().slice(0, 7))).length}</p>
                    </div>
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}