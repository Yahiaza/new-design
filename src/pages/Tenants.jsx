// src/pages/Tenants.jsx
import { useState } from 'react';
import TenantModal from '../components/TenantModal';
import TenantInfoCard from '../components/TenantInfoCard';
import { saveState } from '../utils/storage';
import { printTenantsList } from '../utils/print';

export default function Tenants({ state, setAppState, showToast }) {
  const { tenants = [], properties = [] } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [viewingTenant, setViewingTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('tenantsViewMode') || 'grid');

  const changeViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('tenantsViewMode', mode);
  };

  const activeTenants = tenants.filter(t => !t.deletedAt);
  const todayStr = new Date().toISOString().split('T')[0];

  let activeContractsCount = 0;
  let expiredContractsCount = 0;
  
  activeTenants.forEach(t => {
    if (t.endDate && t.endDate < todayStr) {
      expiredContractsCount++;
    } else {
      activeContractsCount++;
    }
  });
  
  const filteredTenants = activeTenants.filter(t => {
    const prop = properties.find(p => p.id === t.propertyId);
    const term = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(term) || 
      t.phone.toLowerCase().includes(term) || 
      t.idNumber.toLowerCase().includes(term) ||
      (prop && prop.name.toLowerCase().includes(term))
    );
  });

  const handleSaveTenant = async (newTenant) => {
    let updatedTenants;
    if (editingTenant) {
      updatedTenants = tenants.map(t => t.id === newTenant.id ? newTenant : t);
      if(showToast) showToast('تم تحديث بيانات المستأجر بنجاح');
    } else {
      updatedTenants = [...tenants, newTenant];
      if(showToast) showToast('تم إضافة المستأجر بنجاح');
    }
    const newState = { ...state, tenants: updatedTenants };
    setAppState(newState); await saveState(newState);
    setIsModalOpen(false); setEditingTenant(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستأجر؟")) {
      const updatedTenants = tenants.map(t => t.id === id ? { ...t, deletedAt: new Date().toISOString() } : t);
      const newState = { ...state, tenants: updatedTenants };
      setAppState(newState); await saveState(newState);
      if(showToast) showToast('تم حذف المستأجر', 'error');
    }
  };

  const openEdit = (tenant) => { setEditingTenant(tenant); setIsModalOpen(true); };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100/50 dark:border-white/5 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-950 dark:text-white flex items-center gap-3">
            <i className="fas fa-users text-blue-600 dark:text-blue-500"></i> إدارة المستأجرين
          </h2>
          <p className="text-slate-500 mt-2 text-sm">بيانات المستأجرين، جهات الاتصال، وتفاصيل العقود</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button onClick={() => printTenantsList(activeTenants, properties, state.companyProfile)} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2">
            <i className="fas fa-print"></i> طباعة
          </button>
          <button onClick={() => { setEditingTenant(null); setIsModalOpen(true); }} className="bg-blue-600/90 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2">
            <i className="fas fa-user-plus"></i> إضافة مستأجر
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] border border-blue-100 dark:border-blue-500/20 rounded-3xl p-5 shadow-sm flex justify-between items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
           <div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-1">إجمالي المستأجرين</p>
             <h4 className="text-3xl font-black text-slate-900 dark:text-white">{activeTenants.length} <span className="text-sm text-slate-500 font-normal">مستأجر</span></h4>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl">
             <i className="fas fa-users"></i>
           </div>
        </div>
        <div className="bg-emerald-600 text-white rounded-3xl p-5 shadow-lg shadow-emerald-600/20 flex justify-between items-center relative overflow-hidden">
           <div className="relative z-10">
             <p className="text-emerald-100 font-bold text-sm mb-1">العقود السارية والمفعلة</p>
             <h4 className="text-3xl font-black">{activeContractsCount} <span className="text-sm text-emerald-200 font-normal">عقد نشط</span></h4>
           </div>
           <i className="fas fa-file-signature text-6xl text-white/10 absolute -left-2 -bottom-2"></i>
        </div>
        <div className="bg-red-600 text-white rounded-3xl p-5 shadow-lg shadow-red-600/20 flex justify-between items-center relative overflow-hidden">
           <div className="relative z-10">
             <p className="text-red-100 font-bold text-sm mb-1">العقود المنتهية (تحتاج تجديد)</p>
             <h4 className="text-3xl font-black">{expiredContractsCount} <span className="text-sm text-red-200 font-normal">عقد منتهي</span></h4>
           </div>
           <i className="fas fa-file-excel text-6xl text-white/10 absolute -left-2 -bottom-2"></i>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <input type="text" placeholder="ابحث باسم المستأجر، العقار، أو الهاتف..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-2xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-white shadow-sm" />
          <i className="fas fa-search absolute right-4 top-4 text-slate-400"></i>
        </div>
        <div className="flex bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm shrink-0 p-1">
          <button onClick={() => changeViewMode('grid')} className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}><i className="fas fa-th-large"></i></button>
          <button onClick={() => changeViewMode('list')} className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}><i className="fas fa-list"></i></button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTenants.map(tenant => {
            const prop = properties.find(p => p.id === tenant.propertyId);
            const isExpired = tenant.endDate && tenant.endDate < todayStr;
            return (
              <div 
                key={tenant.id} 
                onDoubleClick={() => setViewingTenant(tenant)}
                title="انقر مرتين لعرض التفاصيل والملف المالي"
                className="bg-white dark:bg-[#1E293B] border border-gray-100/50 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group cursor-pointer select-none"
              >
                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(tenant); }} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center transition-colors"><i className="fas fa-edit"></i></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(tenant.id); }} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400 flex items-center justify-center transition-colors"><i className="fas fa-trash"></i></button>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl text-blue-600 dark:text-blue-400 shrink-0 border border-slate-100 dark:border-slate-700">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900 dark:text-white mb-1">{tenant.name}</h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-bold">
                      <i className="fas fa-building"></i> {prop ? prop.name : 'غير محدد'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <div className="col-span-2 flex items-center gap-3 text-slate-600 dark:text-slate-300"><div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0"><i className="fas fa-phone"></i></div><span dir="ltr" className="font-mono">{tenant.phone}</span></div>
                  <div className="col-span-2 flex items-center gap-3 text-slate-600 dark:text-slate-300"><div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0"><i className="fas fa-id-card"></i></div><span className="font-mono">{tenant.idNumber}</span></div>
                  
                  <div className="col-span-2 flex items-center justify-between gap-3 text-slate-600 dark:text-slate-300 mt-1 pt-1 border-t border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0"><i className="fas fa-calendar-check"></i></div>
                      <span className="font-bold text-[11px] sm:text-xs text-slate-700 dark:text-slate-300">{tenant.startDate} إلی {tenant.endDate}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold shrink-0 shadow-sm ${isExpired ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'}`}>
                      {isExpired ? 'منتهي' : 'ساري'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E293B] border border-gray-100/50 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto p-2">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="p-4 rounded-r-2xl w-16 text-center">#</th>
                  <th className="p-4">المستأجر</th>
                  <th className="p-4">الهاتف</th>
                  <th className="p-4">العقار المؤجر</th>
                  <th className="p-4">فترة العقد</th>
                  <th className="p-4 text-center">حالة العقد</th>
                  <th className="p-4 text-center rounded-l-2xl">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredTenants.map((tenant, index) => {
                  const prop = properties.find(p => p.id === tenant.propertyId);
                  const isExpired = tenant.endDate && tenant.endDate < todayStr;
                  return (
                    /* إضافة Double Click وعلامة الـ Pointer هنا */
                    <tr key={tenant.id} onDoubleClick={() => setViewingTenant(tenant)} title="انقر مرتين لعرض التفاصيل" className="transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group cursor-pointer">
                      <td className="p-4 text-center font-black text-slate-400 dark:text-slate-500">{index + 1}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-500 shrink-0"><i className="fas fa-user"></i></div>
                        {tenant.name}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-mono" dir="ltr">{tenant.phone}</td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{prop ? prop.name : '-'}</td>
                      <td className="p-4 text-xs text-slate-500 whitespace-nowrap">من <span dir="ltr" className="inline-block">{tenant.startDate}</span> <br/> إلى <span dir="ltr" className="inline-block">{tenant.endDate}</span></td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block shadow-sm ${isExpired ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                          {isExpired ? 'منتهي' : 'ساري'}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); openEdit(tenant); }} className="text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-500/10 px-3 py-2 rounded-xl"><i className="fas fa-edit"></i></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(tenant.id); }} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-xl"><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {filteredTenants.length === 0 && <div className="text-center py-16 text-slate-500 bg-white dark:bg-[#1E293B] rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">لا يوجد مستأجرين.</div>}
      
      <TenantModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTenant(null); }} onSave={handleSaveTenant} editingTenant={editingTenant} properties={properties} tenants={tenants} />
      
      <TenantInfoCard 
        isOpen={!!viewingTenant} 
        onClose={() => setViewingTenant(null)} 
        tenant={viewingTenant} 
        property={properties.find(p => p && viewingTenant && p.id === viewingTenant.propertyId)}
        state={state}
      />
    </div>
  );
}