// src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import { saveState } from '../utils/storage';

export default function Settings({ state, setAppState }) {
  const [profile, setProfile] = useState({
    name: '', cr: '', taxId: '', bankAccount: '', phone: '', align: 'center', logo: '', showPhone: true, printFontSize: 'medium', currency: 'ر.س'
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // جلب البيانات المحفوظة عند فتح الصفحة
  useEffect(() => {
    if (state.companyProfile) {
      setProfile({ currency: 'ر.س', ...state.companyProfile });
    }
  }, [state.companyProfile]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setProfile({ ...profile, [e.target.name]: value });
  };

  // تحويل الصورة (الشعار) إلى نص Base64 لحفظها في المتصفح
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('الشعار يجب أن يكون أقل من 5 ميجا');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => setProfile({ ...profile, logo: event.target.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const newState = { ...state, companyProfile: profile };
      setAppState(newState);
      await saveState(newState);
      alert('تم حفظ إعدادات المؤسسة بنجاح!');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl shadow-xl p-8 transition-colors animate-fadeIn">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-200/50 dark:border-white/10 pb-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shadow-inner">
          <i className="fas fa-building"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">بيانات المؤسسة</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">ستظهر هذه البيانات في ترويسة جميع المطبوعات والتقارير</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اسم المؤسسة *</label>
            <input required name="name" value={profile.name} onChange={handleChange} className="w-full bg-white/50 dark:bg-black/30 border border-gray-300/50 dark:border-white/20 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رقم الهاتف</label>
            <input name="phone" value={profile.phone} onChange={handleChange} dir="ltr" className="w-full bg-white/50 dark:bg-black/30 border border-gray-300/50 dark:border-white/20 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white text-right" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رقم السجل التجاري</label>
            <input name="cr" value={profile.cr} onChange={handleChange} className="w-full bg-white/50 dark:bg-black/30 border border-gray-300/50 dark:border-white/20 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white font-mono" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">الرقم الضريبي</label>
            <input name="taxId" value={profile.taxId} onChange={handleChange} className="w-full bg-white/50 dark:bg-black/30 border border-gray-300/50 dark:border-white/20 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رقم الحساب البنكي (الآيبان)</label>
            <input name="bankAccount" value={profile.bankAccount} onChange={handleChange} dir="ltr" className="w-full bg-white/50 dark:bg-black/30 border border-gray-300/50 dark:border-white/20 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white font-mono text-right" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">عملة النظام الافتراضية</label>
            <select name="currency" value={profile.currency} onChange={handleChange} className="w-full bg-white/50 dark:bg-black/30 border border-gray-300/50 dark:border-white/20 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white cursor-pointer">
              <option value="ر.س">ريال سعودي (ر.س)</option>
              <option value="ج.م">جنيه مصري (ج.م)</option>
              <option value="درهم">درهم إماراتي (درهم)</option>
              <option value="د.ك">دينار كويتي (د.ك)</option>
              <option value="$">دولار أمريكي ($)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200/50 dark:border-white/10">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">شعار المؤسسة (صورة)</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {profile.logo && <img src={profile.logo} alt="الشعار" className="mt-3 h-16 object-contain rounded border border-gray-200" />}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">ترتيب الترويسة في الطباعة</label>
            <select name="align" value={profile.align} onChange={handleChange} className="w-full bg-white/50 dark:bg-black/30 border border-gray-300/50 dark:border-white/20 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-white">
              <option value="right">الشعار يسار والنصوص يمين</option>
              <option value="center">توسيط الشعار والنصوص</option>
              <option value="left">الشعار يمين والنصوص يسار</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50/50 dark:bg-white/5 rounded-xl p-5 border border-gray-200/50 dark:border-white/10 mt-4">
          <h4 className="font-bold text-gray-800 dark:text-white mb-4"><i className="fas fa-print ml-2 text-blue-500"></i>إعدادات إضافية للطباعة</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <input type="checkbox" name="showPhone" checked={profile.showPhone} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded cursor-pointer" />
              <label className="font-bold text-sm text-gray-700 dark:text-gray-300 cursor-pointer">إظهار رقم الهاتف في المطبوعات</label>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">حجم خط المطبوعات الأساسي</label>
              <select name="printFontSize" value={profile.printFontSize} onChange={handleChange} className="w-full bg-white/50 dark:bg-black/30 border border-gray-300/50 dark:border-white/20 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-800 dark:text-white">
                <option value="small">صغير</option>
                <option value="medium">متوسط (الافتراضي)</option>
                <option value="large">كبير</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200/50 dark:border-white/10">
          <button type="submit" disabled={isSaving} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50">
            {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>
    </div>
  );
}