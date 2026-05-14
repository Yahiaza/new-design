// src/pages/Rentals.jsx
import { useState } from 'react';
import ChargeModal from '../components/ChargeModal';
import PaymentModal from '../components/PaymentModal';
import StatementModal from '../components/StatementModal';
import { getTenantLedgerBalance, getTenantLedgerTransactions, formatCurrency } from '../utils/helpers';
import { saveState } from '../utils/storage';
import { printReceipt } from '../utils/print';


export default function Rentals({ state, setAppState, showToast }) {
  const { tenants = [], properties = [], charges = [], payments = [] } = state;
  const [activeTab, setActiveTab] = useState('overview');
  
  const [isChargeOpen, setIsChargeOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [statementTenant, setStatementTenant] = useState(null);

  // سحب العملة من الإعدادات
  const currency = state.companyProfile?.currency || 'ر.س';

  const activeTenants = tenants.filter(t => !t.deletedAt);
  const activeCharges = charges.filter(c => !c.deletedAt);
  const activePayments = payments.filter(p => !p.deletedAt);

  const totalChargesAmount = activeCharges.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const totalPaymentsAmount = activePayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const handleSaveCharge = async (newCharge) => {
    const newState = { ...state, charges: [...charges, newCharge] };
    setAppState(newState); await saveState(newState); setIsChargeOpen(false);
    if(showToast) showToast('تم إصدار المطالبة بنجاح');
  };

  const handleSavePayment = async (newPayment) => {
    const newState = { ...state, payments: [...payments, newPayment] };
    setAppState(newState); await saveState(newState); setIsPaymentOpen(false);
    if(showToast) showToast('تم تسجيل السداد بنجاح');
  };

  const handleDeleteTransaction = async (type, id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الحركة؟')) return;
    const key = type === 'charge' ? 'charges' : 'payments';
    const updatedList = state[key].map(item => item.id === id ? { ...item, deletedAt: new Date().toISOString() } : item);
    const newState = { ...state, [key]: updatedList };
    setAppState(newState); await saveState(newState);
    if(showToast) showToast('تم نقل الحركة لسجل المحذوفات', 'error');
  };

  return (
    <div className="section-view active animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-200 dark:border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white"><i className="fas fa-file-invoice-dollar text-blue-600 dark:text-blue-400 ml-2"></i> المالية والمطالبات</h2>
        <div className="flex gap-2">
          <button onClick={() => setIsPaymentOpen(true)} className="bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm"><i className="fas fa-hand-holding-usd ml-1"></i> تسجيل سداد</button>
          <button onClick={() => setIsChargeOpen(true)} className="bg-red-600/90 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-sm"><i className="fas fa-file-invoice ml-1"></i> إصدار مطالبة</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-[#1E293B] border border-red-100 dark:border-red-500/20 rounded-3xl p-5 shadow-sm flex justify-between items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
           <div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-1">إجمالي المطالبات المستحقة</p>
             <h4 className="text-3xl font-black text-slate-900 dark:text-white">{totalChargesAmount.toLocaleString()} <span className="text-sm text-slate-500">{currency}</span></h4>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center text-2xl">
             <i className="fas fa-file-invoice-dollar"></i>
           </div>
        </div>
        <div className="bg-white dark:bg-[#1E293B] border border-blue-100 dark:border-blue-500/20 rounded-3xl p-5 shadow-sm flex justify-between items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
           <div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-1">إجمالي المبالغ المحصلة (المسددة)</p>
             <h4 className="text-3xl font-black text-slate-900 dark:text-white">{totalPaymentsAmount.toLocaleString()} <span className="text-sm text-slate-500">{currency}</span></h4>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl">
             <i className="fas fa-hand-holding-usd"></i>
           </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-white/10 pb-2">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === 'overview' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}>الأرصدة الحالية</button>
        <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === 'history' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}>سجل الحركات</button>
      </div>

      {activeTab === 'overview' && (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-xl shadow-md overflow-hidden p-2">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm border-separate border-spacing-y-1">
              <thead className="bg-gray-50/50 dark:bg-black/20 text-gray-600 dark:text-gray-300">
                <tr><th className="p-4 rounded-r-xl">المستأجر</th><th className="p-4">العقار</th><th className="p-4">إجمالي المطالبات</th><th className="p-4">إجمالي المسدد</th><th className="p-4">الرصيد المتبقي</th><th className="p-4 text-center rounded-l-xl">إجراءات</th></tr>
              </thead>
              <tbody>
                {activeTenants.map(tenant => {
                  const prop = properties.find(p => p.id === tenant.propertyId);
                  const bal = getTenantLedgerBalance(tenant.id, activeCharges, activePayments);
                  return (
                    <tr key={tenant.id} className="transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:bg-emerald-50 dark:hover:bg-emerald-500/10 relative z-0 hover:z-10 group">
                      <td className="p-4 font-bold bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent rounded-r-xl">{tenant.name}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400 bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent">{prop ? prop.name : '-'}</td>
                      <td className="p-4 font-bold text-red-600 bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent">{formatCurrency(bal.debit, currency)}</td>
                      <td className="p-4 font-bold text-emerald-600 bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent">{formatCurrency(bal.credit, currency)}</td>
                      <td className="p-4 font-bold bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent" dir="ltr">
                        <span className={`px-3 py-1 rounded-full text-xs ${bal.balance > 0 ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : bal.balance < 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'}`}>
                          {bal.balance > 0 ? `عليه ${formatCurrency(bal.balance, currency)}` : bal.balance < 0 ? `له ${formatCurrency(Math.abs(bal.balance), currency)}` : `0 ${currency}`}
                        </span>
                      </td>
                      <td className="p-4 text-center bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent rounded-l-xl">
                        <button onClick={() => setStatementTenant(tenant)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                          <i className="fas fa-file-invoice"></i> كشف حساب
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {activeTenants.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-500">لا يوجد مستأجرين لعرض أرصدتهم</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-xl shadow-md overflow-hidden p-2">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm border-separate border-spacing-y-1">
              <thead className="bg-gray-50/50 dark:bg-black/20 text-gray-600 dark:text-gray-300">
                <tr><th className="p-4 rounded-r-xl">نوع الحركة</th><th className="p-4">التاريخ</th><th className="p-4">المستأجر</th><th className="p-4">المبلغ</th><th className="p-4">البيان</th><th className="p-4 text-center rounded-l-xl">إجراءات</th></tr>
              </thead>
              <tbody>
                {[...activePayments, ...activeCharges]
                  .sort((a,b) => new Date(b.date) - new Date(a.date))
                  .map(activity => {
                    const isPayment = !!activity.method;
                    const t = activeTenants.find(x => x.id === activity.tenantId);
                    const p = properties.find(x => x.id === activity.propertyId);
                    
                    return (
                      <tr key={activity.id} className="transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:bg-emerald-50 dark:hover:bg-emerald-500/10 relative z-0 hover:z-10 group">
                        <td className="p-4 font-bold bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent rounded-r-xl">
                          {isPayment ? <span className="text-emerald-600 dark:text-emerald-400"><i className="fas fa-arrow-down ml-1"></i> سداد ({activity.method})</span> : <span className="text-red-600 dark:text-red-400"><i className="fas fa-arrow-up ml-1"></i> مطالبة استحقاق</span>}
                        </td>
                        <td className="p-4 font-mono bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent">{activity.date}</td>
                        <td className="p-4 bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent">{t ? t.name : '-'}</td>
                        <td className="p-4 font-bold bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent" dir="ltr">{formatCurrency(activity.amount, currency)}</td>
                        <td className="p-4 text-gray-600 dark:text-gray-400 bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent">{activity.description}</td>
                        <td className="p-4 text-center space-x-2 space-x-reverse bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent rounded-l-xl">
                          {isPayment && (
                            <button onClick={() => printReceipt(activity, t, p, state.companyProfile)} className="text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-500/10 p-2 rounded-lg" title="طباعة سند قبض">
                              <i className="fas fa-print"></i>
                            </button>
                          )}
                          <button onClick={() => handleDeleteTransaction(isPayment ? 'payment' : 'charge', activity.id)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-500/10 p-2 rounded-lg" title="حذف">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ChargeModal isOpen={isChargeOpen} onClose={() => setIsChargeOpen(false)} onSave={handleSaveCharge} state={state} />
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onSave={handleSavePayment} state={state} />
      <StatementModal isOpen={!!statementTenant} onClose={() => setStatementTenant(null)} tenant={statementTenant} properties={properties} charges={activeCharges} payments={activePayments} companyProfile={state.companyProfile} />
    </div>
  );
}