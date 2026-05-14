// src/pages/Dashboard.jsx
import { useMemo, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import ChargeModal from '../components/ChargeModal';
import { getTenantLedgerBalance, formatCurrency } from '../utils/helpers';
import { printDashboardSummary, printDueAlerts, printTenantsList } from '../utils/print';
import { saveState } from '../utils/storage';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export default function Dashboard({ state, setAppState }) {
  const { properties = [], tenants = [], payments = [], charges = [] } = state;
  const [expandedDueId, setExpandedDueId] = useState(null);
  const [viewingContractsType, setViewingContractsType] = useState(null);
  
  const [isChargeOpen, setIsChargeOpen] = useState(false);

  // حالات الإصدار السريع المدمج (Inline)
  const [quickChargeEdit, setQuickChargeEdit] = useState(null); 
  const [quickChargeAmount, setQuickChargeAmount] = useState('');

  const currency = state.companyProfile?.currency || 'ر.س';

  const stats = useMemo(() => {
    const activeProps = properties.filter(p => !p.deletedAt);
    const activeTenants = tenants.filter(t => !t.deletedAt);
    const activePayments = payments.filter(p => !p.deletedAt);
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date();

    let actualRentedRev = 0, potentialVacantRev = 0; 
    let rentedPropsCount = 0, vacantPropsCount = 0;

    activeProps.forEach(prop => {
      const isRented = activeTenants.some(t => t.propertyId === prop.id && t.endDate >= todayStr);
      if (isRented) { rentedPropsCount++; actualRentedRev += Number(prop.rent || 0); } 
      else { vacantPropsCount++; potentialVacantRev += Number(prop.rent || 0); }
    });

    let activeContractsCount = 0, expiredContractsCount = 0;
    let lateAlerts = [];
    let dueAlerts = [];

    activeTenants.forEach(tenant => {
      if (tenant.endDate && tenant.endDate < todayStr) expiredContractsCount++;
      else activeContractsCount++;

      const bal = getTenantLedgerBalance(tenant.id, charges, payments);
      if (bal.balance > 0) lateAlerts.push({ id: tenant.id, name: tenant.name, balance: bal.balance });

      const prop = properties.find(p => p.id === tenant.propertyId);
      if (prop) {
        let monthsToAdd = 12; let periodLabel = 'سنة';
        if (prop.rentPeriod === 'monthly') { monthsToAdd = 1; periodLabel = 'شهر'; }
        else if (prop.rentPeriod === 'quarterly') { monthsToAdd = 3; periodLabel = 'ربع سنة'; }
        else if (prop.rentPeriod === 'semi-annual') { monthsToAdd = 6; periodLabel = 'نصف سنة'; }

        let current = new Date(tenant.startDate);
        const endD = tenant.endDate ? new Date(tenant.endDate) : today;
        let expectedPeriods = [];
        let pNum = 1;

        while (current <= today && current <= endD) {
           expectedPeriods.push({ num: pNum, date: current.toISOString().split('T')[0] });
           current = new Date(current.setMonth(current.getMonth() + monthsToAdd));
           pNum++;
        }

        const tenantCharges = charges.filter(c => c.tenantId === tenant.id && !c.deletedAt);
        const unbilledCount = expectedPeriods.length - tenantCharges.length;

        if (unbilledCount > 0) {
           dueAlerts.push({
              id: tenant.id, name: tenant.name, propName: prop.name,
              propRent: prop.rent, // جبنا الإيجار هنا عشان نستخدمه في الإصدار السريع
              unbilledCount: unbilledCount, periodLabel: periodLabel,
              duePeriods: expectedPeriods.slice(tenantCharges.length)
           });
        }
      }
    });

    return {
      totalProps: activeProps.length, rentedProps: rentedPropsCount, vacantProps: vacantPropsCount,
      actualRentedRev, potentialVacantRev, activeContractsCount, expiredContractsCount,
      lateAlerts, dueAlerts, donutData: [rentedPropsCount, vacantPropsCount],
    };
  }, [properties, tenants, payments, charges]);

  const donutConfig = {
    labels: ['مؤجر', 'شاغر'],
    datasets: [{ data: stats.donutData, backgroundColor: ['#10b981', '#64748b'], borderWidth: 0, hoverOffset: 10 }]
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData && importedData.properties) { setAppState(importedData); alert("تم استيراد النسخة الاحتياطية بنجاح! 🚀"); } 
        else alert("عذراً، ملف النسخة الاحتياطية غير صالح.");
      } catch (error) { alert("حدث خطأ أثناء قراءة الملف."); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  const handleSaveCharge = async (newCharge) => {
    const newState = { ...state, charges: [...charges, newCharge] };
    setAppState(newState);
    await saveState(newState);
    setIsChargeOpen(false);
  };

  // تأكيد الإصدار السريع (بدون النوافذ المزعجة)
  const confirmQuickCharge = async (tenantId, periodDate, periodNum) => {
    if (!quickChargeAmount || isNaN(quickChargeAmount)) return;
    
    const tenant = tenants.find(t => t.id === tenantId);
    
    const newCharge = {
      id: Math.random().toString(36).substr(2, 9),
      tenantId: tenant.id,
      propertyId: tenant.propertyId,
      amount: Number(quickChargeAmount),
      date: new Date().toISOString().split('T')[0],
      description: `استحقاق إيجار - دفعة رقم ${periodNum} (${periodDate})`,
      createdAt: new Date().toISOString()
    };

    const updatedCharges = [...charges, newCharge];
    const newState = { ...state, charges: updatedCharges };
    setAppState(newState);
    await saveState(newState);
    
    setQuickChargeEdit(null); // قفل المربع بعد الحفظ
    setQuickChargeAmount('');
  };

  const todayStrForModal = new Date().toISOString().split('T')[0];
  const activeTenantsForModal = tenants.filter(t => !t.deletedAt);
  const filteredModalTenants = viewingContractsType === 'active' 
      ? activeTenantsForModal.filter(t => !(t.endDate && t.endDate < todayStrForModal))
      : activeTenantsForModal.filter(t => t.endDate && t.endDate < todayStrForModal);

  return (
    <div className="section-view active animate-fadeIn space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100/50 dark:border-white/5 shadow-sm gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-950 dark:text-white">نظرة عامة على المحفظة</h2>
          <p className="text-slate-500 mt-1">آخر تحديث: {new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer text-sm flex items-center gap-2">
            <i className="fas fa-file-import"></i> استيراد
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
          <button onClick={handleExportJSON} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-3 rounded-xl font-bold transition-colors text-sm flex items-center gap-2">
            <i className="fas fa-file-export"></i> نسخة احتياطية
          </button>
          <button onClick={() => printDashboardSummary(stats, state.companyProfile)} className="bg-blue-600/90 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 text-sm flex items-center gap-2 border border-blue-500/30">
            <i className="fas fa-print"></i> تقرير الإشغال
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] border border-blue-100 dark:border-blue-500/20 rounded-3xl p-5 shadow-sm flex justify-between items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
           <div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-1">إجمالي المحفظة العقارية</p>
             <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalProps} <span className="text-sm text-slate-500 font-normal">وحدة</span></h4>
             <p className="text-lg text-blue-600 dark:text-blue-400 font-bold mt-2">بقيمة {(stats.actualRentedRev + stats.potentialVacantRev).toLocaleString()} {currency}</p>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl"><i className="fas fa-building"></i></div>
        </div>
        <div className="bg-white dark:bg-[#1E293B] border border-emerald-100 dark:border-emerald-500/20 rounded-3xl p-5 shadow-sm flex justify-between items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
           <div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-1">إجمالي المؤجر ({stats.rentedProps} وحدة)</p>
             <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.actualRentedRev.toLocaleString()} <span className="text-sm text-slate-500 font-normal">{currency}</span></h4>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl"><i className="fas fa-key"></i></div>
        </div>
        <div className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-500/20 rounded-3xl p-5 shadow-sm flex justify-between items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-2 h-full bg-slate-400"></div>
           <div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-1">إجمالي الشاغر ({stats.vacantProps} وحدة)</p>
             <h4 className="text-3xl font-black text-slate-900 dark:text-white">{stats.potentialVacantRev.toLocaleString()} <span className="text-sm text-slate-500 font-normal">{currency}</span></h4>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-2xl"><i className="fas fa-door-open"></i></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div onDoubleClick={() => setViewingContractsType('active')} title="انقر مرتين لعرض القائمة" className="bg-emerald-600 text-white rounded-3xl p-5 shadow-lg shadow-emerald-600/20 flex justify-between items-center relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform select-none group">
           <div className="relative z-10">
             <p className="text-emerald-100 font-bold text-sm mb-1">العقود السارية والمفعلة</p>
             <h4 className="text-3xl font-black">{stats.activeContractsCount} <span className="text-sm text-emerald-200 font-normal">عقد نشط</span></h4>
           </div>
           <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-sm"><i className="fas fa-hand-pointer"></i> عرض</div>
           <i className="fas fa-file-signature text-6xl text-white/10 absolute -left-2 -bottom-2"></i>
        </div>
         <div onDoubleClick={() => setViewingContractsType('expired')} title="انقر مرتين لعرض القائمة" className="bg-red-600 text-white rounded-3xl p-5 shadow-lg shadow-red-600/20 flex justify-between items-center relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform select-none group">
           <div className="relative z-10">
             <p className="text-red-100 font-bold text-sm mb-1">العقود المنتهية (تحتاج تجديد)</p>
             <h4 className="text-3xl font-black">{stats.expiredContractsCount} <span className="text-sm text-red-200 font-normal">عقد منتهي</span></h4>
           </div>
           <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-sm"><i className="fas fa-hand-pointer"></i> عرض</div>
           <i className="fas fa-file-excel text-6xl text-white/10 absolute -left-2 -bottom-2"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100/50 dark:border-white/5 shadow-sm flex flex-col items-center">
          <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white text-center">توزيع الإشغال</h3>
          <div className="relative h-56 flex items-center justify-center w-full">
            <Doughnut data={donutConfig} options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom', labels: { font: { family: 'Cairo' }, color: '#94a3b8' } } } }} />
            <div className="absolute text-center mt-[-20px]">
              <p className="text-xs text-gray-500 dark:text-gray-400">نسبة الإشغال</p>
              <p className="text-4xl font-black text-emerald-600">{Math.round((stats.rentedProps/stats.totalProps)*100) || 0}%</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100/50 dark:border-white/5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
             <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
               <i className="fas fa-calendar-check text-blue-600"></i> تنبيهات الاستحقاق
             </h3>
             <div className="flex gap-2">
               <button onClick={() => setIsChargeOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm" title="إصدار مطالبة مخصصة">
                 <i className="fas fa-plus"></i> مطالبة
               </button>
               <button onClick={() => printDueAlerts(stats.dueAlerts, state.companyProfile)} className="bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1" title="طباعة كشف الاستحقاقات">
                 <i className="fas fa-print"></i> كشف
               </button>
             </div>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 flex-1 custom-scrollbar">
             {stats.dueAlerts.length === 0 ? (
               <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed">لا عقود تستحق الفوترة حالياً.</div>
             ) : (
               stats.dueAlerts.map(alert => (
                 <div key={alert.id} className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-2xl overflow-hidden transition-all shadow-sm">
                    <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-500/10" onClick={() => setExpandedDueId(expandedDueId === alert.id ? null : alert.id)}>
                       <div>
                         <p className="font-bold text-slate-800 dark:text-white text-sm">{alert.name}</p>
                         <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 bg-white dark:bg-[#1E293B] inline-block px-2 py-0.5 rounded shadow-sm border border-blue-100 dark:border-white/5">
                           مستحق {alert.unbilledCount} {alert.periodLabel}
                         </p>
                       </div>
                       <i className={`fas fa-chevron-down text-slate-400 transition-transform ${expandedDueId === alert.id ? 'rotate-180' : ''}`}></i>
                    </div>
                    {expandedDueId === alert.id && (
                       <div className="px-3 pb-3 pt-2 bg-white dark:bg-black/20 border-t border-blue-100/50 dark:border-white/5">
                          <p className="text-[10px] text-slate-400 mb-2 font-bold px-1">تواريخ الاستحقاق المعلقة:</p>
                          <ul className="space-y-2">
                             {alert.duePeriods.map((p, idx) => {
                                const isEditingThis = quickChargeEdit?.alertId === alert.id && quickChargeEdit?.num === p.num;
                                
                                return (
                                <li key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-white/5 group h-10">
                                   <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                      <span><i className="fas fa-clock text-slate-300"></i> دفعة {p.num}</span>
                                      {!isEditingThis && <span className="font-mono text-blue-600 dark:text-blue-400">{p.date}</span>}
                                   </div>
                                   
                                   {/* الواجهة المدمجة للإصدار السريع */}
                                   {isEditingThis ? (
                                      <div className="flex items-center gap-1 animate-fadeIn">
                                        <input 
                                          type="number" 
                                          value={quickChargeAmount} 
                                          onChange={(e) => setQuickChargeAmount(e.target.value)} 
                                          className="w-20 px-2 py-1 text-xs font-bold text-center bg-white dark:bg-[#1E293B] border border-blue-200 dark:border-blue-500/30 rounded outline-none text-slate-800 dark:text-white"
                                          placeholder="المبلغ"
                                          autoFocus
                                        />
                                        <button onClick={(e) => { e.stopPropagation(); confirmQuickCharge(alert.id, p.date, p.num); }} className="w-6 h-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded flex items-center justify-center transition-colors">
                                          <i className="fas fa-check text-[10px]"></i>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setQuickChargeEdit(null); }} className="w-6 h-6 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-white rounded flex items-center justify-center transition-colors">
                                          <i className="fas fa-times text-[10px]"></i>
                                        </button>
                                      </div>
                                   ) : (
                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          setQuickChargeEdit({ alertId: alert.id, num: p.num });
                                          setQuickChargeAmount(alert.propRent);
                                        }}
                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 px-2 py-1 rounded text-[10px] font-black transition-colors shadow-sm border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1"
                                        title="إصدار فاتورة لهذه الدفعة فوراً"
                                      >
                                        <i className="fas fa-bolt text-amber-500"></i> إصدار سريع
                                      </button>
                                   )}
                                </li>
                                );
                             })}
                          </ul>
                       </div>
                    )}
                 </div>
               ))
             )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100/50 dark:border-white/5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-red-600"></i> المتأخرات المالية
            </h3>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1 flex-1 custom-scrollbar">
             {stats.lateAlerts.length === 0 ? (
               <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed">لا توجد متأخرات مالية حالياً.</div>
             ) : (
               stats.lateAlerts.sort((a,b) => b.balance - a.balance).map(alert => (
                 <div key={alert.id} className="p-4 bg-red-50/80 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-900 dark:text-red-100 shadow-sm flex justify-between items-center transition-all hover:bg-red-100/80">
                   <div>
                     <p className="font-bold text-sm">{alert.name}</p>
                     <p className="text-[10px] text-red-600 dark:text-red-300 font-bold mt-1">مبالغ مستحقة السداد</p>
                   </div>
                   <div className="text-lg font-black" dir="ltr">{formatCurrency(alert.balance, currency)}</div>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>

      <div className="bg-white/60 dark:bg-[#1E293B]/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden p-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">أحدث الحركات المالية</h3>
          <button onClick={() => setAppState(prev => ({...prev, currentView: 'rentals'}))} className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline transition-all">عرض سجل المالية</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm border-separate border-spacing-y-1">
            <thead className="bg-gray-50/50 dark:bg-black/20 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="p-4 rounded-r-xl w-16 text-center">#</th>
                <th className="p-4">المستأجر</th>
                <th className="p-4 text-center">المبلغ</th>
                <th className="p-4 text-center">التاريخ</th>
                <th className="p-4 text-center rounded-l-xl">نوع الحركة</th>
              </tr>
            </thead>
            <tbody>
              {[...payments, ...charges]
                .filter(a => !a.deletedAt)
                .sort((a,b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
                .map((activity, index) => {
                  const isPayment = !!activity.method;
                  return (
                  <tr key={activity.id} className="transition-all duration-300 hover:scale-[1.01] hover:shadow-sm hover:bg-white dark:hover:bg-slate-800 relative z-0 hover:z-10 group">
                    <td className="p-4 text-center font-black text-slate-400 dark:text-slate-500 bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent rounded-r-xl">{index + 1}</td>
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200 bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent">
                      {tenants.find(t => t.id === activity.tenantId)?.name || '-'}
                    </td>
                    <td className="p-4 font-black text-center bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent" dir="ltr">
                      <span className={isPayment ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {formatCurrency(activity.amount, currency)}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-center text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent">{activity.date}</td>
                    <td className="p-4 text-center bg-gray-50/30 dark:bg-white/5 group-hover:bg-transparent rounded-l-xl">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${isPayment ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                         {isPayment ? <><i className="fas fa-arrow-down"></i> سداد نقدي</> : <><i className="fas fa-arrow-up"></i> مطالبة إيجار</>}
                      </span>
                    </td>
                  </tr>
                )})}
                {([...payments, ...charges].filter(a => !a.deletedAt).length === 0) && (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">لا توجد حركات مالية مسجلة بعد.</td></tr>
                )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={!!viewingContractsType} 
        onClose={() => setViewingContractsType(null)} 
        title={viewingContractsType === 'active' ? 'تفاصيل العقود السارية والمفعلة' : 'تفاصيل العقود المنتهية'}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              إجمالي العدد: <span className="text-blue-600">{filteredModalTenants.length}</span> عقد
            </p>
            <button 
              onClick={() => printTenantsList(filteredModalTenants, properties, state.companyProfile)} 
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
            >
              <i className="fas fa-print"></i> طباعة القائمة
            </button>
          </div>
          
          <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-gray-100 dark:border-white/5">
                <tr>
                  <th className="p-4 text-center w-12">#</th>
                  <th className="p-4">المستأجر</th>
                  <th className="p-4">العقار</th>
                  <th className="p-4">تاريخ الانتهاء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredModalTenants.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-bold">لا توجد عقود مطابقة.</td></tr>
                ) : (
                  filteredModalTenants.map((t, idx) => {
                    const prop = properties.find(p => p.id === t.propertyId);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-4 font-bold text-slate-800 dark:text-white">{t.name}</td>
                        <td className="p-4 text-blue-600 dark:text-blue-400 font-bold">{prop ? prop.name : '-'}</td>
                        <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{t.endDate || 'غير محدد'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      <ChargeModal isOpen={isChargeOpen} onClose={() => setIsChargeOpen(false)} onSave={handleSaveCharge} state={state} />
    </div>
  );
}