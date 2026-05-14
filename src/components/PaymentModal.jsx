// src/components/PaymentModal.jsx
import { useState, useEffect } from 'react';
import Modal from './Modal';
import { generateId, getTenantLedgerBalance } from '../utils/helpers';

export default function PaymentModal({ isOpen, onClose, onSave, state }) {
  const { tenants = [], properties = [], charges = [], payments = [] } = state;
  const [formData, setFormData] = useState({ 
    tenantId: '', amount: '', date: new Date().toISOString().split('T')[0], method: 'كاش' 
  });

  const activeTenants = tenants.filter(t => !t.deletedAt);

  const handleTenantChange = (e) => {
    const tId = e.target.value;
    const tenant = tenants.find(t => t.id === tId);
    if (tenant) {
      const bal = getTenantLedgerBalance(tenant.id, charges, payments);
      setFormData({ ...formData, tenantId: tId, amount: Math.max(0, bal.balance) });
    } else {
      setFormData({ ...formData, tenantId: tId, amount: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tenant = tenants.find(t => t.id === formData.tenantId);
    const newPayment = {
      ...formData,
      id: generateId(),
      propertyId: tenant.propertyId,
      amount: Number(formData.amount)
    };
    onSave(newPayment);
  };

  useEffect(() => {
    if (isOpen) setFormData({ tenantId: '', amount: '', date: new Date().toISOString().split('T')[0], method: 'كاش' });
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تسجيل سداد (دائن)">
      <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 dark:text-gray-200">
        <div>
          <label className="block text-sm font-medium mb-1">المستأجر *</label>
          <select required name="tenantId" value={formData.tenantId} onChange={handleTenantChange} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-300/50 dark:border-white/20 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">-- اختر المستأجر --</option>
            {activeTenants.map(t => {
              const p = properties.find(x => x.id === t.propertyId);
              const bal = getTenantLedgerBalance(t.id, charges, payments);
              return <option key={t.id} value={t.id}>{t.name} - {p ? p.name : ''} (المطلوب: {Math.max(0, bal.balance)})</option>;
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">المبلغ المسدد *</label>
          <input required type="number" min="1" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-300/50 dark:border-white/20 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">التاريخ *</label>
            <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-300/50 dark:border-white/20 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:light] dark:[color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">الطريقة *</label>
            <select required value={formData.method} onChange={(e) => setFormData({...formData, method: e.target.value})} className="w-full bg-gray-50 dark:bg-black/30 border border-gray-300/50 dark:border-white/20 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="كاش">نقدي (كاش)</option>
              <option value="تحويل بنكي">تحويل بنكي</option>
              <option value="شيك">شيك</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-200/80 dark:bg-white/10 text-gray-700 dark:text-white rounded-xl transition-colors hover:bg-gray-300 dark:hover:bg-white/20">إلغاء</button>
          <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-colors">تأكيد السداد</button>
        </div>
      </form>
    </Modal>
  );
}