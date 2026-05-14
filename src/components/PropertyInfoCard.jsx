// src/components/PropertyInfoCard.jsx
import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function PropertyInfoCard({ isOpen, onClose, property, tenant, isExpired, onRenew, state }) {
  const [isRenewing, setIsRenewing] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');

  // إعادة ضبط الحالة لما النافذة تفتح أو تقفل
  useEffect(() => {
    if (!isOpen) {
      setIsRenewing(false);
      setNewEndDate('');
    }
  }, [isOpen]);

  if (!property) return null;

  const currency = state?.companyProfile?.currency || 'ر.س';

  let collectionRate = 0;
  let totalCharges = 0;
  let totalPayments = 0;

  if (tenant && state) {
    const tenantCharges = (state.charges || []).filter(c => c.tenantId === tenant.id && !c.deletedAt);
    const tenantPayments = (state.payments || []).filter(p => p.tenantId === tenant.id && !p.deletedAt);

    totalCharges = tenantCharges.reduce((sum, c) => sum + Number(c.amount), 0);
    totalPayments = tenantPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    if (totalCharges > 0) {
      collectionRate = Math.round((totalPayments / totalCharges) * 100);
      if (collectionRate > 100) collectionRate = 100; 
    }
  }

  const progressColor = collectionRate >= 80 ? (isExpired ? 'bg-emerald-400' : 'bg-emerald-500 shadow-emerald-500/50') 
                      : collectionRate >= 50 ? (isExpired ? 'bg-amber-400' : 'bg-amber-500 shadow-amber-500/50') 
                      : (isExpired ? 'bg-red-400' : 'bg-red-500 shadow-red-500/50');

  // تشغيل واجهة التجديد واقتراح تاريخ بعد سنة
  const handleStartRenew = () => {
    const currentEnd = new Date(tenant.endDate);
    const suggestedEnd = new Date(currentEnd.setFullYear(currentEnd.getFullYear() + 1)).toISOString().split('T')[0];
    setNewEndDate(suggestedEnd);
    setIsRenewing(true);
  };

  // تأكيد التجديد وإرسال التاريخ الجديد
  const handleConfirmRenew = () => {
    if(newEndDate) {
      onRenew(tenant.id, newEndDate);
      setIsRenewing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="الملف التفصيلي للعقار">
      <div className="space-y-6 py-2">
        
        <div className="flex flex-col items-center text-center space-y-3 mb-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white flex items-center justify-center text-4xl shadow-xl border-4 border-white dark:border-[#1E293B]">
            <i className="fas fa-building"></i>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{property.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold">{property.address || 'بدون عنوان'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-xs text-slate-400 mb-1">قيمة الإيجار</p>
            <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">{property.rent.toLocaleString()} {currency}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-xs text-slate-400 mb-1">فترة الإيجار</p>
            <p className="font-bold text-slate-800 dark:text-white">
              {property.rentPeriod === 'monthly' ? 'شهري' : property.rentPeriod === 'quarterly' ? 'ربع سنوي' : property.rentPeriod === 'semi-annual' ? 'نصف سنوي' : 'سنوي'}
            </p>
          </div>
          
          <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-xs text-slate-400 mb-1">حالة العقار الحالية</p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
              <div className="flex items-center gap-3">
                {tenant ? (
                  isExpired ? (
                    <>
                      <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        شاغر حالياً <span className="text-orange-600 dark:text-orange-400 text-sm">(مؤجر سابقاً لـ: {tenant.name})</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-lg shadow-red-500/50"></span>
                      <span className="font-bold text-slate-800 dark:text-white">مؤجر لـ: <span className="text-red-600 dark:text-red-400">{tenant.name}</span></span>
                    </>
                  )
                ) : (
                  <>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
                    <span className="font-bold text-slate-600 dark:text-slate-400">شاغر (متاح للتأجير فوراً)</span>
                  </>
                )}
              </div>

              {/* واجهة التجديد المدمجة (Inline Renew Form) */}
              {tenant && isExpired && (
                 isRenewing ? (
                   <div className="flex items-center gap-2 mt-2 sm:mt-0 bg-white dark:bg-[#1E293B] p-1.5 rounded-xl border border-blue-200 dark:border-blue-500/30 shadow-inner w-full sm:w-auto">
                     <input
                       type="date"
                       value={newEndDate}
                       onChange={(e) => setNewEndDate(e.target.value)}
                       className="bg-transparent border-none outline-none text-sm font-bold text-slate-700 dark:text-slate-300 w-32 px-1 cursor-pointer"
                     />
                     <button onClick={handleConfirmRenew} title="تأكيد التجديد" className="bg-emerald-500 hover:bg-emerald-600 text-white w-8 h-8 flex items-center justify-center rounded-lg transition-colors shadow-sm">
                       <i className="fas fa-check"></i>
                     </button>
                     <button onClick={() => setIsRenewing(false)} title="إلغاء" className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 w-8 h-8 flex items-center justify-center rounded-lg transition-colors shadow-sm">
                       <i className="fas fa-times"></i>
                     </button>
                   </div>
                 ) : (
                   <button onClick={handleStartRenew} className="bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:text-blue-300 px-4 py-2 rounded-xl text-xs font-black transition-colors shadow-sm shrink-0 border border-blue-200 dark:border-blue-500/30 mt-2 sm:mt-0">
                     <i className="fas fa-sync-alt ml-1"></i> تجديد العقد الحالي
                   </button>
                 )
              )}
            </div>
          </div>
        </div>

        <div className="mt-2 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-line"></i> {isExpired ? 'مؤشر التحصيل المالي (للعقد السابق)' : 'مؤشر التحصيل المالي'}
          </h4>
          
          {tenant ? (
            <div className={isExpired ? 'opacity-80' : ''}>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-3xl font-black text-slate-800 dark:text-white leading-none">{collectionRate}%</p>
                  <p className="text-xs text-slate-400 mt-1">تم تحصيل {totalPayments.toLocaleString()} من أصل {totalCharges.toLocaleString()} {currency}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-bold text-white shadow-lg ${progressColor}`}>
                  {collectionRate >= 80 ? 'ممتاز' : collectionRate >= 50 ? 'متوسط' : 'ضعيف'}
                </div>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-900 rounded-full h-3.5 mb-1 overflow-hidden shadow-inner relative">
                <div className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${progressColor}`} style={{ width: `${collectionRate}%` }}>
                  {!isExpired && <div className="absolute top-0 left-0 w-full h-full bg-white/20" style={{ transform: 'skewX(-20deg) translateX(-100%)', animation: 'shimmer 2s infinite' }}></div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 opacity-70">
              <i className="fas fa-folder-open text-3xl text-slate-300 dark:text-slate-600 mb-2"></i>
              <span className="text-slate-500 text-sm font-bold">العقار شاغر حالياً، لا توجد بيانات مالية.</span>
            </div>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 px-6 py-2 rounded-xl font-bold transition-colors">إغلاق النافذة</button>
        </div>
      </div>
    </Modal>
  );
}