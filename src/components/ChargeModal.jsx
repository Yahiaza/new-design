// src/components/ChargeModal.jsx
import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { generateId } from '../utils/helpers';

export default function ChargeModal({ isOpen, onClose, onSave, state }) {
  const { tenants = [], properties = [] } = state;
  const [formData, setFormData] = useState({ tenantId: '', amount: '', date: '', description: '' });
  
  // حالات القائمة المنسدلة الذكية
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const activeTenants = tenants.filter(t => !t.deletedAt);

  useEffect(() => {
    if (isOpen) {
      setFormData({ tenantId: '', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
      setSearchQuery('');
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  // إغلاق القائمة عند الضغط في أي مكان براها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tenantId) {
        alert("يرجى اختيار المستأجر أولاً");
        return;
    }
    const tenant = tenants.find(t => t.id === formData.tenantId);
    onSave({ ...formData, id: generateId(), propertyId: tenant?.propertyId, createdAt: new Date().toISOString() });
  };

  // جلب العقار المربوط عشان يظهر جنب اسم المستأجر
  const getPropName = (propId) => {
    const prop = properties.find(p => p.id === propId);
    return prop ? prop.name : 'بدون عقار';
  };

  const filteredTenantsList = activeTenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    getPropName(t.propertyId).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTenantObj = activeTenants.find(t => t.id === formData.tenantId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إصدار فاتورة / مطالبة مالية (مدين)">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* القائمة المنسدلة الذكية (Custom Dropdown) */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">المستأجر *</label>
          
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white cursor-pointer flex justify-between items-center focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <span className={selectedTenantObj ? "font-bold text-blue-700 dark:text-blue-400" : "text-slate-400"}>
              {selectedTenantObj ? `${selectedTenantObj.name} - (${getPropName(selectedTenantObj.propertyId)})` : '-- اختر المستأجر --'}
            </span>
            <i className={`fas fa-chevron-down text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
          </div>

          {/* محتوى القائمة المنسدلة */}
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
              <div className="p-2 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#1E293B]">
                <div className="relative">
                  <i className="fas fa-search absolute right-3 top-2.5 text-slate-400 text-sm"></i>
                  <input 
                    type="text" 
                    placeholder="ابحث باسم المستأجر أو العقار..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-lg py-2 pr-9 pl-3 text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                    autoFocus
                  />
                </div>
              </div>
              <ul className="max-h-48 overflow-y-auto custom-scrollbar">
                {filteredTenantsList.length === 0 ? (
                  <li className="p-3 text-center text-slate-500 text-sm">لا يوجد مستأجر مطابق</li>
                ) : (
                  filteredTenantsList.map(t => (
                    <li 
                      key={t.id} 
                      onClick={() => { setFormData({ ...formData, tenantId: t.id }); setIsDropdownOpen(false); }}
                      className={`p-3 border-b border-slate-50 dark:border-white/5 cursor-pointer transition-colors flex justify-between items-center ${formData.tenantId === t.id ? 'bg-blue-50 dark:bg-blue-500/20' : 'hover:bg-slate-50 dark:hover:bg-[#1E293B]'}`}
                    >
                      <div>
                        <p className={`font-bold text-sm ${formData.tenantId === t.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{t.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5"><i className="fas fa-building mr-1 opacity-50"></i> {getPropName(t.propertyId)}</p>
                      </div>
                      {formData.tenantId === t.id && <i className="fas fa-check text-blue-600 dark:text-blue-400"></i>}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">المبلغ (المدين) *</label>
          <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white" placeholder="مثال: 5000" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">تاريخ الاستحقاق *</label>
          <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white cursor-pointer" />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">البيان / الوصف</label>
          <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white" placeholder="مثال: إيجار شهر يناير" />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10 mt-6">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors">إلغاء</button>
          <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-all">حفظ المطالبة</button>
        </div>
      </form>
    </Modal>
  );
}