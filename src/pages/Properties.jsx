// src/pages/Properties.jsx
import { useState } from 'react';
import PropertyModal from '../components/PropertyModal';
import PropertyInfoCard from '../components/PropertyInfoCard';
import { saveState } from '../utils/storage';
import { printPropertiesList } from '../utils/print';

export default function Properties({ state, setAppState, showToast }) {
  const { properties = [], tenants = [] } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('propertiesViewMode') || 'grid');
  
  // حالة الترتيب (الشاغر الأول أو المؤجر الأول)
  const [statusSort, setStatusSort] = useState('default'); // 'default', 'vacant', 'rented'

  const currency = state.companyProfile?.currency || 'ر.س';

  const changeViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('propertiesViewMode', mode);
  };

  const activeProperties = properties.filter(p => !p.deletedAt);
  const activeTenants = tenants.filter(t => !t.deletedAt);
  const todayStr = new Date().toISOString().split('T')[0];

  let rentedCount = 0; let rentedValue = 0;
  let vacantCount = 0; let vacantValue = 0;

  activeProperties.forEach(p => {
    const isRented = activeTenants.some(t => t.propertyId === p.id && t.endDate >= todayStr);
    if (isRented) { rentedCount++; rentedValue += Number(p.rent || 0); }
    else { vacantCount++; vacantValue += Number(p.rent || 0); }
  });

  // الفلترة والترتيب الذكي
  let displayedProperties = activeProperties.filter(p => {
    const propTenants = activeTenants.filter(t => t.propertyId === p.id);
    const hasMatch = propTenants.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) || 
      (p.address && p.address.toLowerCase().includes(term)) || 
      hasMatch
    );
  });

  if (statusSort === 'vacant') {
    displayedProperties.sort((a, b) => {
      const aRented = activeTenants.some(t => t.propertyId === a.id && t.endDate >= todayStr);
      const bRented = activeTenants.some(t => t.propertyId === b.id && t.endDate >= todayStr);
      return (aRented === bRented) ? 0 : aRented ? 1 : -1; // الشاغر (false) ييجي الأول
    });
  } else if (statusSort === 'rented') {
    displayedProperties.sort((a, b) => {
      const aRented = activeTenants.some(t => t.propertyId === a.id && t.endDate >= todayStr);
      const bRented = activeTenants.some(t => t.propertyId === b.id && t.endDate >= todayStr);
      return (aRented === bRented) ? 0 : aRented ? -1 : 1; // المؤجر (true) ييجي الأول
    });
  }

  const handleStatusSortClick = () => {
    setStatusSort(prev => prev === 'default' ? 'vacant' : prev === 'vacant' ? 'rented' : 'default');
  };

  const handleSaveProperty = async (newProperty) => {
    let updatedProperties;
    if (editingProperty) {
      updatedProperties = properties.map(p => p.id === newProperty.id ? newProperty : p);
      if(showToast) showToast('تم تحديث بيانات العقار بنجاح');
    } else {
      updatedProperties = [...properties, newProperty];
      if(showToast) showToast('تم إضافة العقار بنجاح');
    }
    const newState = { ...state, properties: updatedProperties };
    setAppState(newState); await saveState(newState);
    setIsModalOpen(false); setEditingProperty(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من نقل هذا العقار إلى سلة المحذوفات؟")) {
      const isRented = activeTenants.some(t => t.propertyId === id && t.endDate >= todayStr);
      if (isRented) { alert("لا يمكن حذف عقار مؤجر حالياً. قم بإنهاء عقد المستأجر أولاً."); return; }
      const updatedProperties = properties.map(p => p.id === id ? { ...p, deletedAt: new Date().toISOString() } : p);
      const newState = { ...state, properties: updatedProperties };
      setAppState(newState); await saveState(newState);
      if(showToast) showToast('تم حذف العقار', 'error');
    }
  };

  const openEdit = (property) => { setEditingProperty(property); setIsModalOpen(true); };

  const handleRenewTenant = async (tenantId, newEndDate) => {
    const tenant = state.tenants.find(t => t.id === tenantId);
    if(!tenant) return;
    
    if(newEndDate && newEndDate !== tenant.endDate) {
        const updatedTenants = state.tenants.map(t => t.id === tenantId ? { ...t, endDate: newEndDate } : t);
        const newState = { ...state, tenants: updatedTenants };
        setAppState(newState);
        await saveState(newState);
        if(showToast) showToast('تم تجديد العقد وتحديث حالة العقار بنجاح! 🚀');
        setViewingProperty(null);
    }
  };

  let displayTenantForModal = null;
  let isExpiredForModal = false;
  if (viewingProperty) {
     const propTenants = activeTenants.filter(t => t.propertyId === viewingProperty.id);
     const current = propTenants.find(t => t.endDate >= todayStr);
     if (current) {
        displayTenantForModal = current;
     } else {
        const expired = propTenants.filter(t => t.endDate < todayStr).sort((a,b) => new Date(b.endDate) - new Date(a.endDate));
        if (expired.length > 0) {
           displayTenantForModal = expired[0];
           isExpiredForModal = true;
        }
     }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100/50 dark:border-white/5 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-950 dark:text-white flex items-center gap-3">
            <i className="fas fa-building text-blue-600 dark:text-blue-500"></i> إدارة العقارات
          </h2>
          <p className="text-slate-500 mt-2 text-sm">أضف، عدل، وتابع حالة العقارات الخاصة بك</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button onClick={() => printPropertiesList(activeProperties, activeTenants, state.companyProfile)} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2">
            <i className="fas fa-print"></i> طباعة
          </button>
          <button onClick={() => { setEditingProperty(null); setIsModalOpen(true); }} className="bg-blue-600/90 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2">
            <i className="fas fa-plus"></i> إضافة عقار
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1E293B] border border-red-100 dark:border-red-500/20 rounded-3xl p-5 shadow-sm flex justify-between items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
           <div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-1">إجمالي المؤجر (المشغول)</p>
             <h4 className="text-3xl font-black text-slate-900 dark:text-white">{rentedCount} <span className="text-sm font-normal text-slate-500">عقارات</span></h4>
             <p className="text-xs text-red-600 font-bold mt-1">بإيراد: {rentedValue.toLocaleString()} {currency}</p>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center text-2xl"><i className="fas fa-key"></i></div>
        </div>
        <div className="bg-white dark:bg-[#1E293B] border border-emerald-100 dark:border-emerald-500/20 rounded-3xl p-5 shadow-sm flex justify-between items-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
           <div>
             <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-1">إجمالي الشاغر (المتاح)</p>
             <h4 className="text-3xl font-black text-slate-900 dark:text-white">{vacantCount} <span className="text-sm font-normal text-slate-500">عقارات</span></h4>
             <p className="text-xs text-emerald-600 font-bold mt-1">قيمة مقدرة: {vacantValue.toLocaleString()} {currency}</p>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl"><i className="fas fa-door-open"></i></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <input type="text" placeholder="ابحث باسم العقار أو المستأجر..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-2xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-white shadow-sm" />
          <i className="fas fa-search absolute right-4 top-4 text-slate-400"></i>
        </div>
        <div className="flex bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm shrink-0 p-1">
          <button onClick={() => changeViewMode('grid')} className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}><i className="fas fa-th-large"></i></button>
          <button onClick={() => changeViewMode('list')} className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}><i className="fas fa-list"></i></button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayedProperties.map(property => {
            const propTenants = activeTenants.filter(t => t.propertyId === property.id);
            const currentTenant = propTenants.find(t => t.endDate >= todayStr);
            const expiredTenants = propTenants.filter(t => t.endDate < todayStr).sort((a,b) => new Date(b.endDate) - new Date(a.endDate));
            const lastTenant = expiredTenants.length > 0 ? expiredTenants[0] : null;

            return (
              <div key={property.id} onDoubleClick={() => setViewingProperty(property)} title="انقر مرتين لعرض التفاصيل" className="bg-white dark:bg-[#1E293B] border border-gray-100/50 dark:border-white/5 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden cursor-pointer select-none">
                <div className={`absolute top-0 right-0 h-full w-1.5 ${currentTenant ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(property); }} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center transition-colors"><i className="fas fa-edit"></i></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(property.id); }} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400 flex items-center justify-center transition-colors"><i className="fas fa-trash"></i></button>
                </div>
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${currentTenant ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}><i className={`fas ${currentTenant ? 'fa-home' : 'fa-door-open'}`}></i></div>
                  <div className="pt-1">
                    <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight">{property.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{property.address || 'بدون عنوان'}</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <div className="flex justify-between items-center"><span className="text-slate-500">قيمة الإيجار</span><span className="font-bold text-blue-600 dark:text-blue-400">{property.rent.toLocaleString()} {currency}</span></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">المستأجر</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {currentTenant ? currentTenant.name : (lastTenant ? <span className="text-slate-400 text-xs">سابقاً: {lastTenant.name}</span> : '-')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">الحالة</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentTenant ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                      {currentTenant ? 'مؤجر' : 'شاغر (متاح)'}
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
                  <th className="p-4">العقار</th>
                  <th className="p-4">العنوان</th>
                  <th className="p-4">الإيجار</th>
                  <th className="p-4">المستأجر</th>
                  {/* جعلنا عمود الحالة قابل للضغط مع سهم توضيحي */}
                  <th onClick={handleStatusSortClick} className="p-4 text-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors select-none group" title="اضغط لترتيب العقارات حسب الحالة">
                    الحالة
                    <span className="inline-block ml-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      {statusSort === 'vacant' ? <i className="fas fa-sort-up text-emerald-500 translate-y-1"></i> : statusSort === 'rented' ? <i className="fas fa-sort-down text-red-500 -translate-y-1"></i> : <i className="fas fa-sort text-slate-400"></i>}
                    </span>
                  </th>
                  <th className="p-4 text-center rounded-l-2xl">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {displayedProperties.map((property, index) => {
                  const propTenants = activeTenants.filter(t => t.propertyId === property.id);
                  const currentTenant = propTenants.find(t => t.endDate >= todayStr);
                  const expiredTenants = propTenants.filter(t => t.endDate < todayStr).sort((a,b) => new Date(b.endDate) - new Date(a.endDate));
                  const lastTenant = expiredTenants.length > 0 ? expiredTenants[0] : null;

                  return (
                    /* إضافة Double Click وعلامة الـ Pointer هنا */
                    <tr key={property.id} onDoubleClick={() => setViewingProperty(property)} title="انقر مرتين لعرض التفاصيل" className="transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group cursor-pointer">
                      <td className="p-4 text-center font-black text-slate-400 dark:text-slate-500">{index + 1}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${currentTenant ? 'bg-red-100 text-red-600 dark:bg-red-500/20' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20'}`}><i className="fas fa-building"></i></div>{property.name}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{property.address || '-'}</td>
                      <td className="p-4 font-bold text-blue-600 dark:text-blue-400">{property.rent.toLocaleString()} {currency}</td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                        {currentTenant ? currentTenant.name : (lastTenant ? <span className="text-slate-400 text-xs">سابقاً: {lastTenant.name}</span> : '-')}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block shadow-sm ${currentTenant ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                          {currentTenant ? 'مؤجر' : 'شاغر (متاح)'}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-2 space-x-reverse opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); openEdit(property); }} className="text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-500/10 px-3 py-2 rounded-xl"><i className="fas fa-edit"></i></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(property.id); }} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-xl"><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {displayedProperties.length === 0 && <div className="text-center py-16 text-slate-500 bg-white dark:bg-[#1E293B] rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">لا توجد عقارات مطابقة للبحث.</div>}
      
      <PropertyModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingProperty(null); }} onSave={handleSaveProperty} editingProperty={editingProperty} />
      
      <PropertyInfoCard 
        isOpen={!!viewingProperty} 
        onClose={() => setViewingProperty(null)} 
        property={viewingProperty} 
        tenant={displayTenantForModal} 
        isExpired={isExpiredForModal}
        onRenew={handleRenewTenant}
        state={state} 
      />
    </div>
  );
}