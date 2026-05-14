// src/components/TenantInfoCard.jsx
import Modal from './Modal';
import { getTenantLedgerBalance, formatCurrency } from '../utils/helpers';

export default function TenantInfoCard({ isOpen, onClose, tenant, property, state }) {
  if (!tenant) return null;

  // سحب العملة من الإعدادات
  const currency = state?.companyProfile?.currency || 'ر.س';

  // حساب الرصيد المالي للمستأجر
  const bal = getTenantLedgerBalance(tenant.id, state.charges || [], state.payments || []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="الملف الشخصي والمالي للمستأجر">
      <div className="space-y-6 py-2">
        
        {/* الهيدر */}
        <div className="flex flex-col items-center text-center space-y-3 mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-4xl shadow-xl border-4 border-white dark:border-[#1E293B]">
            <i className="fas fa-user-tie"></i>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{tenant.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold">{property?.name || 'لم يتم تحديد عقار'}</p>
          </div>
        </div>

        {/* شبكة المعلومات */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-xs text-slate-400 mb-1">رقم الهاتف</p>
            <p className="font-bold text-slate-800 dark:text-white font-mono" dir="ltr">{tenant.phone}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-xs text-slate-400 mb-1">رقم الهوية / الإقامة</p>
            <p className="font-bold text-slate-800 dark:text-white font-mono">{tenant.idNumber || '-'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-xs text-slate-400 mb-1">بداية العقد</p>
            <p className="font-bold text-slate-800 dark:text-white">{tenant.startDate}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
            <p className="text-xs text-slate-400 mb-1">نهاية العقد</p>
            <p className="font-bold text-slate-800 dark:text-white">{tenant.endDate || '-'}</p>
          </div>
        </div>

        {/* كارت الرصيد المالي */}
        <div className={`p-6 rounded-3xl shadow-lg flex justify-between items-center overflow-hidden relative ${bal.balance > 0 ? 'bg-red-600' : bal.balance < 0 ? 'bg-emerald-600' : 'bg-blue-600'} text-white`}>
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-bold mb-1">الرصيد المالي للمستأجر</p>
            <h4 className="text-3xl font-black">{formatCurrency(Math.abs(bal.balance), currency)}</h4>
            <p className="text-xs text-white/90 mt-1">{bal.balance > 0 ? 'مبلغ مستحق (عليه متأخرات)' : bal.balance < 0 ? 'رصيد دائن (له مبلغ زائد)' : 'الحساب متزن تماماً'}</p>
          </div>
          <i className="fas fa-wallet text-6xl text-white/10 absolute -left-2 -bottom-2"></i>
        </div>

        <div className="flex justify-center pt-2">
          <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 px-6 py-2 rounded-xl font-bold transition-colors">إغلاق النافذة</button>
        </div>
      </div>
    </Modal>
  );
}