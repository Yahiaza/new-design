// src/App.jsx
import { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Rentals from './pages/Rentals';
import Settings from './pages/Settings';
import Toast from './components/Toast';
import Trash from './pages/Trash';
import Calendar from './pages/Calendar'; // استيراد التقويم الجديد
import { loadState, saveState } from './utils/storage';

function App() {
  const [state, setAppState] = useState({
    properties: [], tenants: [], rentals: [], charges: [], payments: [], currentView: 'dashboard', companyProfile: {}
  });
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [toast, setToast] = useState(null);
  
  // المتغير للتحكم في القائمة على الموبايل
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      const savedData = await loadState();
      if (savedData) setAppState(savedData);
      setIsDataLoaded(true);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isDataLoaded) saveState(state);
  }, [state, isDataLoaded]);

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const currentView = useMemo(() => {
    if (!isDataLoaded) return <div className="flex items-center justify-center h-full text-xl font-bold text-slate-500"><i className="fas fa-spinner fa-spin ml-2"></i> جاري تحميل البيانات...</div>;
    
    switch (state.currentView) {
      case 'properties': return <Properties state={state} setAppState={setAppState} showToast={showToast} />;
      case 'tenants': return <Tenants state={state} setAppState={setAppState} showToast={showToast} />;
      case 'rentals': return <Rentals state={state} setAppState={setAppState} showToast={showToast} />;
      case 'calendar': return <Calendar state={state} />; // توجيه مسار التقويم
      case 'profile': 
      case 'settings': return <Settings state={state} setAppState={setAppState} showToast={showToast} />;
      case 'trash': return <Trash state={state} setAppState={setAppState} showToast={showToast} />;
      default: return <Dashboard state={state} setAppState={setAppState} />;
    }
  }, [state.currentView, state, isDataLoaded]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-cairo transition-colors duration-300 overflow-hidden relative">
        
        {/* تمرير حالة القائمة للسيدبار */}
        <Sidebar currentView={state.currentView} setAppState={setAppState} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* تمرير دالة الفتح للهيدر */}
          <Header darkMode={darkMode} setDarkMode={setDarkMode} setAppState={setAppState} companyProfile={state.companyProfile} setIsSidebarOpen={setIsSidebarOpen} />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="container mx-auto h-full max-w-full">
              {currentView}
            </div>
          </main>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}

export default App;