// src/pages/Trash.jsx
import { useState } from 'react';
import { saveState } from '../utils/storage';
import { formatCurrency } from '../utils/helpers';

export default function Trash({ state, setAppState, showToast }) {
  const [activeTab, setActiveTab] = useState('properties');

  const { properties = [], tenants = [], charges = [], payments = [] } = state;
  const currency = state.companyProfile?.currency || 'ر.س';

  // تصفية العناصر المحذوفة فقط
  const deletedProperties = properties.filter(p => p.deletedAt);
  const deletedTenants = tenants.filter(t => t.deletedAt);
  const deletedCharges = charges.filter(c => c.deletedAt);
  const deletedPayments = payments.filter(p => p.deletedAt);
  
  const deletedFinancials = [...deletedCharges.map(c => ({...c, _type: 'charge'})), ...deletedPayments.map(p => ({...p, _type: 'payment'}))]
                            .sort((a,b) => new Date(b.deletedAt) - new Date(a.deletedAt));

  // دالة الاستعادة (إزالة تاريخ الحذف)
  const handleRestore = async (type, id) => {
    const listName = type; 
    const updatedList = state[listName].map(item => {
      if (item.id === id) {
        const { deletedAt, ...rest } = item; // شيلنا الـ deletedAt عشان يرجع للحياة
        return rest;
      }
      return item;
    });

    const newState = { ...state, [listName]: updatedList };
    setAppState(newState);
    await saveState(newState);
    if(showToast) showToast('تمت استعادة العنصر بنجاح! ♻️');
  };

  // دالة الحذف النهائي (لا يمكن التراجع)
  const handlePermanentDelete = async (type, id) => {
    if (!window.confirm("⚠️ تحذير: سيتم حذف هذا العنصر نهائياً ولن تتمكن من استعادته. هل أنت متأكد؟")) return;
    
    const listName = type;
    const updatedList = state[listName].filter(item => item.id !== id);
    
    const newState = { ...state, [listName]: updatedList };
    setAppState(newState);
    await saveState(newState);
    if(showToast) showToast('تم الحذف نهائياً 🗑️', 'error');
  };

  return (
    <div className="section-view active animate-fadeIn space-y-6">
      
      {/* الهيدر */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100/50 dark:border-white/5 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-950 dark:text-white flex items-center gap-3">
            <i className="fas fa-trash-restore text-red-600 dark:text-red-500"></i> سجل المحذوفات
          </h2>
          <p className="text-slate-500 mt-2 text-sm">استعادة العناصر المحذوفة عن طريق الخطأ أو التخلص منها نهائياً</p>
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-white/10 pb-4">
        <button onClick={() => setActiveTab('properties')} className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'properties' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
          <i className="fas fa-building"></i> العقارات ({deletedProperties.length})
        </button>
        <button onClick={() => setActiveTab('tenants')} className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'tenants' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
          <i className="fas fa-users"></i> المستأجرين ({deletedTenants.length})
        </button>
        <button onClick={() => setActiveTab('financials')} className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'financials' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
          <i className="fas fa-file-invoice-dollar"></i> المالية والمطالبات ({deletedFinancials.length})
        </button>
      </div>

      {/* محتوى التبويبات */}
      <div className="bg-white dark:bg-[#1E293B] border border-gray-100/50 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto p-2">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
              <tr>
                <th className="p-4 rounded-r-2xl w-16 text-center">#</th>
                <th className="p-4">البيان / الاسم</th>
                <th className="p-4">تاريخ الحذف</th>
                <th className="p-4">تفاصيل إضافية</th>
                <th className="p-4 text-center rounded-l-2xl w-32">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              
              {/* عرض العقارات المحذوفة */}
              {activeTab === 'properties' && (
                deletedProperties.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-slate-500">سلة العقارات فارغة</td></tr> :
                deletedProperties.map((p, i) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-center text-slate-400">{i + 1}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-white"><i className="fas fa-building text-slate-400 mr-2 ml-2"></i> {p.name}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{new Date(p.deletedAt).toLocaleString('ar-SA')}</td>
                    <td className="p-4 text-slate-500">{p.rent.toLocaleString()} {currency}</td>
                    <td className="p-4 text-center space-x-2 space-x-reverse">
                      <button onClick={() => handleRestore('properties', p.id)} title="استعادة" className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 p-2 rounded-lg transition-colors"><i className="fas fa-undo"></i></button>
                      <button onClick={() => handlePermanentDelete('properties', p.id)} title="حذف نهائي" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors"><i className="fas fa-trash-alt"></i></button>
                    </td>
                  </tr>
                ))
              )}

              {/* عرض المستأجرين المحذوفين */}
              {activeTab === 'tenants' && (
                deletedTenants.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-slate-500">سلة المستأجرين فارغة</td></tr> :
                deletedTenants.map((t, i) => {
                  const prop = state.properties.find(x => x.id === t.propertyId);
                  return (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-center text-slate-400">{i + 1}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-white"><i className="fas fa-user text-slate-400 mr-2 ml-2"></i> {t.name}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{new Date(t.deletedAt).toLocaleString('ar-SA')}</td>
                    <td className="p-4 text-slate-500">{prop ? prop.name : 'بدون عقار'} | هاتف: <span dir="ltr">{t.phone}</span></td>
                    <td className="p-4 text-center space-x-2 space-x-reverse">
                      <button onClick={() => handleRestore('tenants', t.id)} title="استعادة" className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 p-2 rounded-lg transition-colors"><i className="fas fa-undo"></i></button>
                      <button onClick={() => handlePermanentDelete('tenants', t.id)} title="حذف نهائي" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors"><i className="fas fa-trash-alt"></i></button>
                    </td>
                  </tr>
                )})
              )}

              {/* عرض المالية المحذوفة */}
              {activeTab === 'financials' && (
                deletedFinancials.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-slate-500">سلة المالية فارغة</td></tr> :
                deletedFinancials.map((f, i) => {
                  const t = state.tenants.find(x => x.id === f.tenantId);
                  const isCharge = f._type === 'charge';
                  return (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-center text-slate-400">{i + 1}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-white">
                      {isCharge ? <span className="text-red-500"><i className="fas fa-arrow-up ml-1"></i> مطالبة إيجار</span> : <span className="text-emerald-500"><i className="fas fa-arrow-down ml-1"></i> سداد نقدي</span>}
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{new Date(f.deletedAt).toLocaleString('ar-SA')}</td>
                    <td className="p-4 text-slate-500">مبلغ: <span className="font-bold">{formatCurrency(f.amount, currency)}</span> | {t ? t.name : 'مجهول'}</td>
                    <td className="p-4 text-center space-x-2 space-x-reverse">
                      <button onClick={() => handleRestore(isCharge ? 'charges' : 'payments', f.id)} title="استعادة" className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 p-2 rounded-lg transition-colors"><i className="fas fa-undo"></i></button>
                      <button onClick={() => handlePermanentDelete(isCharge ? 'charges' : 'payments', f.id)} title="حذف نهائي" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors"><i className="fas fa-trash-alt"></i></button>
                    </td>
                  </tr>
                )})
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}