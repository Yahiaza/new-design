// src/utils/helpers.js

export const formatCurrency = (num, currencySymbol = null) => {
    let currency = currencySymbol;
    if (!currency) {
      try {
        // محاولة جلب العملة من التخزين لو متمش تمريرها
        const storedKeys = Object.keys(localStorage);
        const stateKey = storedKeys.find(k => localStorage.getItem(k).includes('companyProfile'));
        if (stateKey) {
            const storedState = JSON.parse(localStorage.getItem(stateKey));
            currency = storedState?.companyProfile?.currency || 'ر.س';
        } else {
            currency = 'ر.س';
        }
      } catch(e) {
        currency = 'ر.س';
      }
    }
    return new Intl.NumberFormat('ar-SA').format(num) + ' ' + currency;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const tafqeet = (num) => {
    if (num === 0) return 'صفر';
    const a = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
    const b = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
    const c = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
    
    const convertHundreds = (n) => {
        let res = "";
        if (n > 99) { res += c[Math.floor(n / 100)]; n %= 100; if(n>0) res += " و "; }
        if (n > 0 && n < 20) { res += a[n]; }
        else if (n >= 20) {
            if (n % 10 > 0) { res += a[n % 10] + " و " + b[Math.floor(n / 10)]; }
            else { res += b[Math.floor(n / 10)]; }
        }
        return res;
    };
    
    let result = "";
    if (num >= 1000000) {
        let m = Math.floor(num / 1000000);
        if (m === 1) result += "مليون";
        else if (m === 2) result += "مليونان";
        else if (m >= 3 && m <= 10) result += convertHundreds(m) + " ملايين";
        else result += convertHundreds(m) + " مليون";
        num %= 1000000;
        if(num>0) result += " و ";
    }
    if (num >= 1000) {
        let th = Math.floor(num / 1000);
        if (th === 1) result += "ألف";
        else if (th === 2) result += "ألفان";
        else if (th >= 3 && th <= 10) result += convertHundreds(th) + " آلاف";
        else result += convertHundreds(th) + " ألف";
        num %= 1000;
        if(num>0) result += " و ";
    }
    if (num > 0) {
        result += convertHundreds(num);
    }
    return result.trim() + " ريال فقط لا غير"; // تقدر تعدلها لاحقاً لو حابب التفقيط يقرأ العملة كمان
};

// دوال محاسبية لمعرفة حالة المستأجر
export const getTenantLedgerTransactions = (tenantId, charges, payments) => {
    let transactions = [];
    const customCharges = (charges || []).filter(charge => charge.tenantId === tenantId && !charge.deletedAt);
    customCharges.forEach(charge => {
        transactions.push({ id: charge.id, date: charge.date, description: charge.description || 'فاتورة/مطالبة', debit: Number(charge.amount), credit: 0, type: 'charge' });
    });
    const activePayments = (payments || []).filter(payment => payment.tenantId === tenantId && !payment.deletedAt);
    activePayments.forEach(payment => {
        transactions.push({ id: payment.id, date: payment.date, description: `سداد إيصال #${payment.id.toUpperCase()} - ${payment.method}`, debit: 0, credit: Number(payment.amount), type: 'payment', rawPayment: payment });
    });
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    return transactions;
};

export const getTenantLedgerBalance = (tenantId, charges, payments) => {
    const txs = getTenantLedgerTransactions(tenantId, charges, payments);
    let debit = 0, credit = 0;
    txs.forEach(transaction => { debit += transaction.debit; credit += transaction.credit; });
    return { debit, credit, balance: debit - credit }; 
};