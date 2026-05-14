// src/components/DueDetailsModal.jsx
import Modal from './Modal';

export default function DueDetailsModal({ isOpen, onClose, tenant, property, missedDates, onIssueCharge }) {
  if (!tenant || !property || !missedDates) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`استحقاقات غير مفوترة: ${tenant.name}`}>
      <div className="p-2 max-h-[60vh] overflow-y-auto">
        {missedDates.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">لا توجد استحقاقات.</p>
        ) : (
          <div className="space-y-3">
            {missedDates.map(dateStr => (
              <div key={dateStr} className="flex justify-between items-center bg-gray-50/50 dark:bg-black/20 border border-gray-200/50 dark:border-white/10 p-3 rounded-xl shadow-sm">
                <span className="font-mono text-gray-700 dark:text-gray-300 font-bold">{dateStr}</span>
                <button 
                  onClick={() => { onClose(); onIssueCharge(dateStr, property.rent); }} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors"
                >
                  إصدار مطالبة
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}