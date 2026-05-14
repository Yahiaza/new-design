// src/components/TenantModal.jsx
import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { generateId } from '../utils/helpers';

export default function TenantModal({ isOpen, onClose, onSave, editingTenant, properties = [] }) {
  const [formData, setFormData] = useState({
    name: '', phone: '', idNumber: '', propertyId: '', startDate: '', endDate: ''
  });

  // حالات القائمة المنسدلة الذكية
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingTenant) {
        setFormData(editingTenant);
      } else {
        setFormData({ name: '', phone: '', idNumber: '', propertyId: '', startDate: '', endDate: '' });
      }
      setSearchQuery('');
      setIsDropdownOpen(false);
    }
  }, [isOpen, editingTenant]);

  // إغلاق القائمة عند الضغط خارجها
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
    onSave({ ...formData, id: editingTenant ? editingTenant.id : generateId() });
  };

  // فلترة العقارات للبحث
  const activeProperties = properties.filter(p => !p.deletedAt);
  const filteredPropsList = activeProperties.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedPropObj = activeProperties.find(p => p.id === formData.propertyId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingTenant ? "تعديل بيانات المستأجر" : "إضافة مستأجر جديد"}>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* الاسم (صف كامل) */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">اسم المستأجر (الرباعي) *</label>
          <div className="relative">
            <i className="fas fa-user absolute right-4 top-3.5 text-slate-400"></i>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white transition-all" placeholder="مثال: أحمد محمد عبد الله" />
          </div>
        </div>

        {/* الهاتف ورقم الهوية (عمودين لتوسيع الكارت) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">رقم الهاتف *</label>
            <div className="relative">
              <i className="fas fa-phone absolute right-4 top-3.5 text-slate-400"></i>
              <input required type="text" dir="ltr" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full text-right bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white font-mono transition-all" placeholder="05XXXXXXXX" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">رقم الهوية / الإقامة *</label>
            <div className="relative">
              <i className="fas fa-id-card absolute right-4 top-3.5 text-slate-400"></i>
              <input required type="text" dir="ltr" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} className="w-full text-right bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white font-mono transition-all" placeholder="10XXXXXXXX" />
            </div>
          </div>
        </div>

        {/* القائمة المنسدلة الذكية للعقارات (مربوطة بـ z-index عالي) */}
        <div className="relative z-50" ref={dropdownRef}>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">العقار المؤجر *</label>
          
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white cursor-pointer flex justify-between items-center focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <div className="flex items-center gap-3">
               <i className="fas fa-building text-slate-400"></i>
               <span className={selectedPropObj ? "font-bold text-blue-700 dark:text-blue-400" : "text-slate-400"}>
                 {selectedPropObj ? selectedPropObj.name : '-- اختر العقار من القائمة --'}
               </span>
            </div>
            <i className={`fas fa-chevron-down text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
          </div>

          {/* محتوى القائمة المنسدلة (بيطفو فوق العناصر الأخرى) */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 z-[100] mt-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
              <div className="p-2 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#1E293B]">
                <div className="relative">
                  <i className="fas fa-search absolute right-3 top-2.5 text-slate-400 text-sm"></i>
                  <input 
                    type="text" 
                    placeholder="ابحث باسم العقار أو العنوان..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 rounded-lg py-2 pr-9 pl-3 text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                    autoFocus
                  />
                </div>
              </div>
              <ul className="max-h-48 overflow-y-auto custom-scrollbar">
                {filteredPropsList.length === 0 ? (
                  <li className="p-3 text-center text-slate-500 text-sm">لا يوجد عقار مطابق للبحث</li>
                ) : (
                  filteredPropsList.map(p => (
                    <li 
                      key={p.id} 
                      onClick={() => { setFormData({ ...formData, propertyId: p.id }); setIsDropdownOpen(false); }}
                      className={`p-3 border-b border-slate-50 dark:border-white/5 cursor-pointer transition-colors flex justify-between items-center ${formData.propertyId === p.id ? 'bg-blue-50 dark:bg-blue-500/20' : 'hover:bg-slate-50 dark:hover:bg-[#1E293B]'}`}
                    >
                      <div>
                        <p className={`font-bold text-sm ${formData.propertyId === p.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>{p.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5"><i className="fas fa-map-marker-alt mr-1 opacity-50"></i> {p.address || 'بدون عنوان'}</p>
                      </div>
                      {formData.propertyId === p.id && <i className="fas fa-check text-blue-600 dark:text-blue-400"></i>}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* تواريخ العقد (عمودين لتوسيع الكارت) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-0">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">بداية العقد *</label>
            <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white cursor-pointer transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-gray-300 mb-2">نهاية العقد</label>
            <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white cursor-pointer transition-all" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/10 mt-6 relative z-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors">إلغاء</button>
          <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all">حفظ البيانات</button>
        </div>
      </form>
    </Modal>
  );
}