// src/components/PropertyModal.jsx
import { useState, useEffect } from 'react';
import Modal from './Modal';

export default function PropertyModal({ isOpen, onClose, onSave, editingProperty }) {
  const [formData, setFormData] = useState({ name: '', address: '', rent: '', rentPeriod: 'monthly', contractNumber: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProperty) { setFormData(editingProperty); } 
    else { setFormData({ name: '', address: '', rent: '', rentPeriod: 'monthly', contractNumber: '' }); }
    setError('');
  }, [editingProperty, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rent) {
      setError('يرجى تعبئة الحقول الأساسية (اسم العقار وقيمة الإيجار)');
      return;
    }
    onSave({ ...formData, id: editingProperty ? editingProperty.id : Date.now().toString(), rent: Number(formData.rent) });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingProperty ? 'تعديل العقار' : 'إضافة عقار جديد'}>
      {error && <div className="bg-red-100 dark:bg-red-500/10 border-r-4 border-red-500 text-red-700 dark:text-red-100 px-4 py-3 rounded-xl mb-4 text-sm font-bold">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label className="block text-sm font-bold mb-2 text-slate-500 dark:text-slate-400">اسم العقار (مثال: شقة 5 - عمارة الياسمين) <span className="text-red-500">*</span></label>
          <div className="relative">
            <i className="fas fa-building absolute right-4 top-3.5 text-slate-400"></i>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/10 rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-white shadow-inner" placeholder="اسم العقار أو الوصف" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-slate-500 dark:text-slate-400">العنوان التفصيلي</label>
          <div className="relative">
            <i className="fas fa-map-marker-alt absolute right-4 top-3.5 text-slate-400"></i>
            <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/10 rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-white shadow-inner" placeholder="الحي، الشارع..." />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-500 dark:text-slate-400">قيمة الإيجار <span className="text-red-500">*</span></label>
            <div className="relative">
              <i className="fas fa-money-bill-wave absolute right-4 top-3.5 text-slate-400"></i>
              <input type="number" value={formData.rent} onChange={(e) => setFormData({...formData, rent: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/10 rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-white shadow-inner" placeholder="المبلغ بالريال" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-500 dark:text-slate-400">فترة الإيجار <span className="text-red-500">*</span></label>
            <div className="relative">
              <i className="fas fa-calendar-alt absolute right-4 top-3.5 text-slate-400"></i>
              <select value={formData.rentPeriod} onChange={(e) => setFormData({...formData, rentPeriod: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/10 rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-white shadow-inner appearance-none">
                <option value="monthly" className="bg-slate-50 dark:bg-[#1E293B]">شهري</option>
                <option value="quarterly" className="bg-slate-50 dark:bg-[#1E293B]">ربع سنوي (كل 3 أشهر)</option>
                <option value="semi-annual" className="bg-slate-50 dark:bg-[#1E293B]">نصف سنوي (كل 6 أشهر)</option>
                <option value="annual" className="bg-slate-50 dark:bg-[#1E293B]">سنوي</option>
              </select>
              <i className="fas fa-chevron-down absolute left-4 top-4 text-slate-400"></i>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-slate-500 dark:text-slate-400">رقم العقد الإيجاري (اختياري)</label>
          <div className="relative">
            <i className="fas fa-file-contract absolute right-4 top-3.5 text-slate-400"></i>
            <input type="text" value={formData.contractNumber} onChange={(e) => setFormData({...formData, contractNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/10 rounded-2xl py-3.5 pr-12 pl-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 dark:text-white shadow-inner" placeholder="رقم العقد الموحد أو الداخلي" />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">إلغاء</button>
          <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600/90 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2">
            <i className="fas fa-check-circle"></i> {editingProperty ? 'حفظ التعديلات' : 'حفظ العقار'}
          </button>
        </div>
      </form>
    </Modal>
  );
}