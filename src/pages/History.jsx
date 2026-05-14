// src/pages/History.jsx
import { saveState } from '../utils/storage';
import { formatCurrency } from '../utils/helpers';

export default function History({ state, setAppState }) {
  const deletedProps = (state.properties || []).filter(p => p.deletedAt);
  const deletedTenants = (state.tenants || []).filter(t => t.deletedAt);
  const deletedPayments = [
    ...(state.payments || []).filter(p => p.deletedAt).map(p => ({ ...p, type: 'سداد' })),
    ...(state.charges || []).filter(c => c.deletedAt).map(c => ({ ...c, type: 'مطالبة' }))
  ].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

  // دالة الاستعادة الذكية
  const restoreItem = async (collection, id) => {
    if (window.confirm('هل تريد استعادة هذا العنصر؟')) {
      const updatedCollection = state[collection].map(item => item.id === id ? { ...item, deletedAt: null } : item);
      const newState = { ...state, [collection]: updatedCollection };
      setAppState(newState);
      await saveState(newState);
    }
  };

  return (
    <div className="space-y-8">
      {/* العقارات المحذوفة */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-xl shadow-md p-6 transition-colors">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 border-gray-200/50 dark:border-white/10">
          <i className="fas fa-building text-gray-500 dark:text-gray-400 ml-2"></i> العقارات المحذوفة
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-100/50 dark:bg-black/20 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="p-3">اسم العقار</th>
                <th className="p-3">الإيجار</th>
                <th className="p-3">تاريخ الحذف</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-white/5">
              {deletedProps.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center text-gray-500">لا توجد عقارات محذوفة</td></tr>
              ) : (
                deletedProps.map(p => (
                  <tr key={p.id}>
                    <td className="p-3 font-bold">{p.name}</td>
                    <td className="p-3 text-blue-600">{formatCurrency(p.rent)}</td>
                    <td className="p-3">{new Date(p.deletedAt).toLocaleDateString('ar-SA')}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => restoreItem('properties', p.id)} className="text-emerald-500 hover:text-emerald-700 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg">
                        <i className="fas fa-undo ml-1"></i> استعادة
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* المستأجرين المحذوفين */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-xl shadow-md p-6 transition-colors">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 border-gray-200/50 dark:border-white/10">
          <i className="fas fa-users text-gray-500 dark:text-gray-400 ml-2"></i> المستأجرين المحذوفين
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-100/50 dark:bg-black/20 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="p-3">اسم المستأجر</th>
                <th className="p-3">العقار</th>
                <th className="p-3">تاريخ الحذف</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-white/5">
              {deletedTenants.length === 0 ? (
                <tr><td colSpan="4" className="p-4 text-center text-gray-500">لا يوجد مستأجرين محذوفين</td></tr>
              ) : (
                deletedTenants.map(t => {
                  const prop = state.properties.find(p => p.id === t.propertyId);
                  return (
                    <tr key={t.id}>
                      <td className="p-3 font-bold">{t.name}</td>
                      <td className="p-3">{prop ? prop.name : '-'}</td>
                      <td className="p-3">{new Date(t.deletedAt).toLocaleDateString('ar-SA')}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => restoreItem('tenants', t.id)} className="text-emerald-500 hover:text-emerald-700 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg">
                          <i className="fas fa-undo ml-1"></i> استعادة
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* الحركات المالية الملغاة */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-xl shadow-md p-6 transition-colors">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 border-b pb-3 border-gray-200/50 dark:border-white/10">
          <i className="fas fa-money-bill-wave text-gray-500 dark:text-gray-400 ml-2"></i> الحركات المالية الملغاة
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-100/50 dark:bg-black/20 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="p-3">نوع الحركة</th>
                <th className="p-3">المستأجر</th>
                <th className="p-3">المبلغ</th>
                <th className="p-3">تاريخ الإلغاء</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-white/5">
              {deletedPayments.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-gray-500">لا توجد حركات ملغاة</td></tr>
              ) : (
                deletedPayments.map(p => {
                  const tenant = state.tenants.find(t => t.id === p.tenantId);
                  const collection = p.type === 'سداد' ? 'payments' : 'charges';
                  return (
                    <tr key={p.id}>
                      <td className={`p-3 font-bold ${p.type === 'سداد' ? 'text-emerald-600' : 'text-red-600'}`}>{p.type}</td>
                      <td className="p-3">{tenant ? tenant.name : '-'}</td>
                      <td className="p-3 font-bold">{formatCurrency(p.amount)}</td>
                      <td className="p-3">{new Date(p.deletedAt).toLocaleDateString('ar-SA')}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => restoreItem(collection, p.id)} className="text-emerald-500 hover:text-emerald-700 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg">
                          <i className="fas fa-undo ml-1"></i> استعادة
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}