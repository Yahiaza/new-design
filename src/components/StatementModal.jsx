// src/components/StatementModal.jsx
import { useState } from 'react';
import Modal from './Modal';
import { getTenantLedgerTransactions } from '../utils/helpers';
import { printStatement } from '../utils/print';

export default function StatementModal({ isOpen, onClose, tenant, properties, charges, payments, companyProfile }) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  if (!tenant) return null;

  const handlePrint = () => {
    const allTxs = getTenantLedgerTransactions(tenant.id, charges, payments);
    // فلترة الحركات حسب التاريخ اللي اختاره المحاسب
    const filteredTxs = allTxs.filter(tx => {
      if (!dateFrom && !dateTo) return true;
      const txDate = tx.date;
      return (!dateFrom || txDate >= dateFrom) && (!dateTo || txDate <= dateTo);
    });

    const property = properties.find(p => p.id === tenant.propertyId);
    printStatement(tenant, property, filteredTxs, companyProfile, { from: dateFrom, to: dateTo });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`كشف حساب: ${tenant.name}`}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">من تاريخ</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full p-2 rounded-lg border border-gray-300 dark:bg-black/30 dark:border-white/20 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">إلى تاريخ</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full p-2 rounded-lg border border-gray-300 dark:bg-black/30 dark:border-white/20 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        
        <div className="flex justify-center pt-4">
          <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-colors">
            <i className="fas fa-print"></i> عرض وطباعة الكشف
          </button>
        </div>
      </div>
    </Modal>
  );
}