// src/utils/storage.js
import localforage from 'localforage';

const STORAGE_KEY = 'realEstateApp_state_v10';

export const defaultState = {
    companyProfile: { 
        name: 'مؤسسة أنصاري المنزلاوي لإدارة الأملاك', 
        cr: '1010123456', 
        taxId: '300123456789003', 
        bankAccount: 'SA12 3456 7890 1234 5678 90', 
        phone: '0500000000', 
        align: 'center', 
        logo: '', 
        showPhone: true, 
        printFontSize: 'medium' 
    },
    properties: [], 
    tenants: [], 
    payments: [], 
    charges: []
};

// جلب البيانات
export const loadState = async () => {
    try {
        const data = await localforage.getItem(STORAGE_KEY);
        return data ? { ...defaultState, ...data } : defaultState;
    } catch (err) {
        console.error("Error loading state", err);
        return defaultState;
    }
};

// حفظ البيانات
export const saveState = async (state) => {
    try {
        await localforage.setItem(STORAGE_KEY, state);
    } catch (err) {
        console.error("Save error", err);
        throw err;
    }
};

// تفريغ البيانات
export const resetData = async () => {
    await localforage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    return defaultState;
};