// src/utils/print.js

/**
 * --------------------------------------------------------------------------
 * 1. دالة بناء الترويسة الموحدة (الهيدر) لكل المطبوعات
 * --------------------------------------------------------------------------
 */
const getHeaderHTML = (title, cp) => `
  <div class="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-8">
    <div class="flex items-center gap-4">
      ${cp?.logo 
        ? `<img src="${cp.logo}" class="w-16 h-16 object-contain rounded-lg border border-slate-100 p-1 shadow-sm" />` 
        : `<div class="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center text-3xl font-black shadow-sm">${cp?.name ? cp.name.charAt(0) : 'م'}</div>`
      }
      <div>
        <h1 class="text-2xl font-black text-slate-900">${cp?.name || 'مؤسسة إدارة الأملاك'}</h1>
        ${cp?.address ? `<p class="text-slate-500 text-sm mt-1">${cp.address}</p>` : ''}
        <div class="flex gap-2 mt-2">
          ${cp?.taxNumber ? `<span class="text-slate-600 text-xs bg-slate-100 px-2 py-1 rounded font-bold">الرقم الضريبي: ${cp.taxNumber}</span>` : ''}
          ${cp?.phone ? `<span class="text-slate-600 text-xs bg-slate-100 px-2 py-1 rounded font-bold">هاتف: ${cp.phone}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="text-left">
      <h2 class="text-2xl font-bold text-blue-700 mb-2">${title}</h2>
      <p class="text-sm text-slate-500 font-mono">تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')}</p>
    </div>
  </div>
`;

/**
 * --------------------------------------------------------------------------
 * 2. دالة الغلاف الأساسي للصفحة (Tailwind + Fonts)
 * --------------------------------------------------------------------------
 */
const getBaseHTML = (title, content) => `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Cairo', sans-serif; padding: 40px; color: #0f172a; background: white; }
      table { page-break-inside: auto; }
      tr    { page-break-inside: avoid; page-break-after: auto; }
      @media print {
        body { padding: 0; margin: 20px; }
        .no-print { display: none; }
      }
    </style>
  </head>
  <body>
    ${content}
    <script>
      window.onload = () => { setTimeout(() => { window.print(); }, 800); }
    </script>
  </body>
  </html>
`;

/**
 * --------------------------------------------------------------------------
 * 3. طباعة التقرير المالي والإشغال (الداشبورد) 
 * --------------------------------------------------------------------------
 */
export const printDashboardSummary = (stats, cp) => {
  const currency = cp?.currency || 'ر.س';
  const content = `
    ${getHeaderHTML('التقرير المالي وإحصائيات الإشغال', cp)}
    
    <div class="grid grid-cols-2 gap-6 mb-8">
        <div class="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-200 shadow-sm relative overflow-hidden">
            <div class="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
            <h3 class="font-bold text-emerald-800 mb-2 text-lg">المؤجر فعلياً</h3>
            <p class="text-4xl font-black text-slate-900 mb-6">${stats.rentedProps} <span class="text-sm text-slate-500 font-normal">وحدة</span></p>
            <div class="pt-4 border-t border-emerald-200/60">
                <p class="text-sm text-emerald-700 font-bold mb-1">إجمالي الإيرادات المؤكدة</p>
                <p class="text-2xl font-black text-emerald-600" dir="ltr">${stats.actualRentedRev.toLocaleString()} <span class="text-sm">${currency}</span></p>
            </div>
        </div>

        <div class="p-6 bg-slate-50/50 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div class="absolute top-0 right-0 w-2 h-full bg-slate-400"></div>
            <h3 class="font-bold text-slate-800 mb-2 text-lg">الشاغر الحالي</h3>
            <p class="text-4xl font-black text-slate-900 mb-6">${stats.vacantProps} <span class="text-sm text-slate-500 font-normal">وحدة</span></p>
            <div class="pt-4 border-t border-slate-200">
                <p class="text-sm text-slate-600 font-bold mb-1">الفرصة الضائعة (قيمة الشاغر)</p>
                <p class="text-2xl font-black text-slate-600" dir="ltr">${stats.potentialVacantRev.toLocaleString()} <span class="text-sm">${currency}</span></p>
            </div>
        </div>
    </div>

    <div class="bg-blue-50/50 border border-blue-200 rounded-2xl p-6 flex justify-between items-center relative overflow-hidden">
        <div class="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
        <div>
            <h3 class="text-blue-800 font-bold text-lg mb-1">إجمالي المحفظة العقارية</h3>
            <p class="text-blue-600 font-black text-2xl">${stats.totalProps} <span class="text-base font-normal">وحدة</span></p>
        </div>
        <div class="text-left">
            <h3 class="text-blue-800 font-bold text-lg mb-1">القيمة الإجمالية للمحفظة</h3>
            <p class="text-blue-600 font-black text-2xl" dir="ltr">${(stats.actualRentedRev + stats.potentialVacantRev).toLocaleString()} <span class="text-base font-normal">${currency}</span></p>
        </div>
    </div>
  `;
  
  const w = window.open('', '_blank'); w.document.write(getBaseHTML('تقرير الإشغال', content)); w.document.close();
};

/**
 * --------------------------------------------------------------------------
 * 4. طباعة كشف حساب مستأجر
 * --------------------------------------------------------------------------
 */
export const printStatement = (tenant, property, transactions, cp, filterDates = { from: '', to: '' }) => {
  const currency = cp?.currency || 'ر.س';
  const sorted = [...transactions].sort((a,b) => new Date(a.date) - new Date(b.date));
  let bal = 0; let totalDebit = 0; let totalCredit = 0;
  
  const rows = sorted.map((tx, index) => {
      if (tx.type === 'charge') { bal += tx.debit; totalDebit += tx.debit; } 
      else { bal -= tx.credit; totalCredit += tx.credit; }
      
      const desc = tx.description || (tx.type === 'charge' ? 'مطالبة إيجار' : `سداد دفعة (${tx.method || 'نقدي'})`);
      const isCharge = tx.type === 'charge';
      
      return `
      <tr class="border-b border-slate-100">
          <td class="p-3 text-center text-slate-400 text-xs">${index + 1}</td>
          <td class="p-3 text-sm text-center font-mono text-slate-600" dir="ltr">${tx.date}</td>
          <td class="p-3 font-bold text-slate-800"><span class="inline-block w-2 h-2 rounded-full mr-2 ml-1 ${isCharge ? 'bg-red-500' : 'bg-emerald-500'}"></span>${desc}</td>
          <td class="p-3 font-bold text-center ${isCharge ? 'text-red-600' : 'text-slate-400'}">${tx.debit > 0 ? Number(tx.debit).toLocaleString() : '-'}</td>
          <td class="p-3 font-bold text-center ${!isCharge ? 'text-emerald-600' : 'text-slate-400'}">${tx.credit > 0 ? Number(tx.credit).toLocaleString() : '-'}</td>
          <td class="p-3 font-black bg-slate-50 text-center text-slate-900" dir="ltr">${bal.toLocaleString()}</td>
      </tr>`;
  }).join('');

  const content = `
      ${getHeaderHTML('كشف حساب مستأجر', cp)}
      
      <div class="grid grid-cols-3 gap-6 mb-8">
          <div class="col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div><p class="text-xs text-slate-400 mb-1">اسم المستأجر</p><p class="font-black text-slate-800 text-lg">${tenant.name}</p></div>
              <div><p class="text-xs text-slate-400 mb-1">العقار المؤجر</p><p class="font-bold text-blue-700 text-lg">${property?.name || 'غير محدد'}</p></div>
          </div>
          <div class="col-span-1 flex flex-col justify-center bg-blue-50/50 p-5 rounded-2xl border border-blue-100 text-center relative overflow-hidden">
              <div class="absolute top-0 right-0 w-1.5 h-full ${bal > 0 ? 'bg-red-500' : bal < 0 ? 'bg-emerald-500' : 'bg-slate-400'}"></div>
              <p class="text-xs text-blue-800 font-bold mb-1">الرصيد النهائي</p>
              <h3 class="text-2xl font-black ${bal > 0 ? 'text-red-600' : bal < 0 ? 'text-emerald-600' : 'text-slate-600'} mb-1" dir="ltr">${Math.abs(bal).toLocaleString()} <span class="text-sm">${currency}</span></h3>
              <span class="text-xs font-bold">${bal > 0 ? 'مستحق السداد' : bal < 0 ? 'رصيد دائن' : 'رصيد صفري'}</span>
          </div>
      </div>

      <div class="rounded-2xl border border-slate-200 overflow-hidden">
        <table class="w-full text-right text-sm">
            <thead class="bg-slate-100 border-b border-slate-200">
                <tr>
                    <th class="p-4 text-center w-12 text-slate-500 font-bold">#</th>
                    <th class="p-4 text-center font-bold text-slate-700">التاريخ</th>
                    <th class="p-4 font-bold text-slate-700">البيان / نوع الحركة</th>
                    <th class="p-4 text-center font-bold text-slate-700">مدين (مطالبات)</th>
                    <th class="p-4 text-center font-bold text-slate-700">دائن (مسدد)</th>
                    <th class="p-4 text-center font-bold text-slate-700">الرصيد التراكمي</th>
                </tr>
            </thead>
            <tbody>${rows.length > 0 ? rows : '<tr><td colspan="6" class="p-8 text-center text-slate-400 font-bold">لا توجد حركات مالية مسجلة.</td></tr>'}</tbody>
            ${rows.length > 0 ? `
            <tfoot class="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                    <td colspan="3" class="p-4 font-black text-slate-700 text-left">إجمالي الحركات:</td>
                    <td class="p-4 text-center font-black text-red-600">${totalDebit.toLocaleString()}</td>
                    <td class="p-4 text-center font-black text-emerald-600">${totalCredit.toLocaleString()}</td>
                    <td class="p-4 text-center font-black ${bal > 0 ? 'text-red-600' : 'text-emerald-600'}">${Math.abs(bal).toLocaleString()}</td>
                </tr>
            </tfoot>` : ''}
        </table>
      </div>
  `;
  const w = window.open('', '_blank'); w.document.write(getBaseHTML('كشف حساب', content)); w.document.close();
};

/**
 * --------------------------------------------------------------------------
 * 5. طباعة قائمة المستأجرين
 * --------------------------------------------------------------------------
 */
export const printTenantsList = (tenants, properties, cp) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const rows = tenants.map((t, i) => {
    const prop = properties.find(p => p.id === t.propertyId);
    const isExpired = t.endDate && t.endDate < todayStr;
    return `
      <tr class="border-b border-slate-100">
        <td class="p-4 text-center font-bold text-slate-400">${i + 1}</td>
        <td class="p-4"><strong>${t.name}</strong><br><span class="text-xs text-slate-500">هوية: ${t.idNumber || '-'}</span></td>
        <td class="p-4 font-mono text-center" dir="ltr">${t.phone}</td>
        <td class="p-4 font-bold text-blue-700">${prop ? prop.name : '-'}</td>
        <td class="p-4 text-sm whitespace-nowrap"><span class="text-slate-500">بداية:</span> <span dir="ltr" class="inline-block">${t.startDate}</span><br><span class="text-slate-500">نهاية:</span> <span dir="ltr" class="inline-block">${t.endDate || '-'}</span></td>
        <td class="p-4 text-center"><span class="px-2 py-1 rounded text-xs font-bold ${isExpired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}">${isExpired ? 'منتهي' : 'ساري'}</span></td>
      </tr>`;
  }).join('');

  const content = `
      ${getHeaderHTML('تقرير قائمة المستأجرين الشامل', cp)}
      <div class="rounded-2xl border border-slate-200 overflow-hidden">
        <table class="w-full text-right text-sm">
            <thead class="bg-slate-100 border-b border-slate-200">
                <tr>
                    <th class="p-4 text-center w-12 text-slate-500 font-bold">#</th>
                    <th class="p-4 font-bold text-slate-700">المستأجر</th>
                    <th class="p-4 text-center font-bold text-slate-700">الهاتف</th>
                    <th class="p-4 font-bold text-slate-700">العقار</th>
                    <th class="p-4 font-bold text-slate-700">فترة العقد</th>
                    <th class="p-4 text-center font-bold text-slate-700">الحالة</th>
                </tr>
            </thead>
            <tbody>${rows.length > 0 ? rows : '<tr><td colspan="6" class="p-8 text-center text-slate-400 font-bold">لا توجد بيانات.</td></tr>'}</tbody>
        </table>
      </div>
  `;
  const w = window.open('', '_blank'); w.document.write(getBaseHTML('المستأجرين', content)); w.document.close();
};

/**
 * --------------------------------------------------------------------------
 * 6. طباعة قائمة العقارات
 * --------------------------------------------------------------------------
 */
export const printPropertiesList = (properties, tenants, cp) => {
  const currency = cp?.currency || 'ر.س';
  const todayStr = new Date().toISOString().split('T')[0];
  const rows = properties.map((p, i) => {
    const tenant = tenants.find(t => t.propertyId === p.id && t.endDate >= todayStr);
    return `
      <tr class="border-b border-slate-100">
        <td class="p-4 text-center font-bold text-slate-400">${i + 1}</td>
        <td class="p-4"><strong>${p.name}</strong><br><span class="text-xs text-slate-500">${p.address || '-'}</span></td>
        <td class="p-4 font-bold text-center text-blue-700" dir="ltr">${Number(p.rent).toLocaleString()} ${currency}</td>
        <td class="p-4 font-bold">${tenant ? tenant.name : '-'}</td>
        <td class="p-4 text-center"><span class="px-2 py-1 rounded text-xs font-bold ${tenant ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}">${tenant ? 'مؤجر' : 'شاغر'}</span></td>
      </tr>`;
  }).join('');

  const content = `
      ${getHeaderHTML('تقرير حالة العقارات الشامل', cp)}
      <div class="rounded-2xl border border-slate-200 overflow-hidden">
        <table class="w-full text-right text-sm">
            <thead class="bg-slate-100 border-b border-slate-200">
                <tr>
                    <th class="p-4 text-center w-12 text-slate-500 font-bold">#</th>
                    <th class="p-4 font-bold text-slate-700">العقار</th>
                    <th class="p-4 text-center font-bold text-slate-700">قيمة الإيجار</th>
                    <th class="p-4 font-bold text-slate-700">المستأجر الحالي</th>
                    <th class="p-4 text-center font-bold text-slate-700">الحالة</th>
                </tr>
            </thead>
            <tbody>${rows.length > 0 ? rows : '<tr><td colspan="5" class="p-8 text-center text-slate-400 font-bold">لا توجد بيانات.</td></tr>'}</tbody>
        </table>
      </div>
  `;
  const w = window.open('', '_blank'); w.document.write(getBaseHTML('العقارات', content)); w.document.close();
};

/**
 * --------------------------------------------------------------------------
 * 7. طباعة سند قبض (تصميم رسمي)
 * --------------------------------------------------------------------------
 */
export const printReceipt = (payment, tenant, property, cp) => {
  const currency = cp?.currency || 'ر.س';
  const content = `
    ${getHeaderHTML('سند قبض (إيصال استلام)', cp)}
    
    <div class="bg-slate-50 p-8 rounded-3xl border border-slate-200 mb-12 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 right-0 w-3 h-full bg-blue-600"></div>
        <div class="grid grid-cols-2 gap-8 mb-8">
            <div>
                <p class="text-sm text-slate-500 mb-1 font-bold">استلمنا من المكرم / السادة:</p>
                <p class="text-2xl font-black text-slate-900">${tenant?.name || 'غير محدد'}</p>
            </div>
            <div class="text-left border-r-2 border-slate-200 pr-8">
                <p class="text-sm text-slate-500 mb-1 font-bold">مبلغاً وقدره:</p>
                <p class="text-3xl font-black text-blue-600" dir="ltr">${Number(payment.amount).toLocaleString()} <span class="text-lg text-blue-800">${currency}</span></p>
            </div>
        </div>
        <div class="mb-10 bg-white p-4 rounded-xl border border-slate-100">
            <p class="text-sm text-slate-500 mb-1 font-bold">وذلك عن (البيان):</p>
            <p class="text-xl font-bold text-slate-800">${payment.description || 'سداد دفعة إيجارية'}</p>
        </div>
        
        <div class="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center mt-12">
            <div>
                <p class="font-bold text-slate-700 mb-12">توقيع المستلم (المحاسب)</p>
                <p class="text-slate-300">_____________________</p>
            </div>
            <div>
                <p class="font-bold text-slate-700 mb-12">الختم الرسمي للمؤسسة</p>
                <p class="text-slate-300">_____________________</p>
            </div>
        </div>
    </div>
    
    <div class="text-center text-xs text-slate-400 mt-8">
      <p>هذا السند معتمد ومستخرج آلياً من نظام إدارة الأملاك، ويعد وثيقة رسمية باستلام المبلغ المذكور أعلاه.</p>
    </div>
  `;
  const w = window.open('', '_blank'); w.document.write(getBaseHTML('سند قبض', content)); w.document.close();
};

/**
 * --------------------------------------------------------------------------
 * 8. طباعة تنبيهات الاستحقاق والفوترة
 * --------------------------------------------------------------------------
 */
export const printDueAlerts = (dueAlerts, cp) => {
  const rows = dueAlerts.map((alert, i) => {
     const periodsHTML = alert.duePeriods.map(p => 
       `<span class="inline-block bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-md m-1 text-xs font-mono shadow-sm" dir="ltr">${p.date} <span class="text-[10px] text-slate-400 pr-1">(دفعة ${p.num})</span></span>`
     ).join('');
     
     return `
       <tr class="border-b border-slate-100">
         <td class="p-4 text-center font-bold text-slate-400">${i + 1}</td>
         <td class="p-4">
            <strong>${alert.name}</strong><br>
            <span class="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block"><i class="fas fa-building text-[10px]"></i> ${alert.propName}</span>
         </td>
         <td class="p-4 font-black text-center text-red-600 text-lg">${alert.unbilledCount} <span class="text-sm font-normal text-slate-500">${alert.periodLabel}</span></td>
         <td class="p-4">${periodsHTML}</td>
       </tr>
     `;
  }).join('');

  const content = `
      ${getHeaderHTML('تقرير استحقاقات الفوترة', cp)}
      
      <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
         <p class="text-sm text-blue-800 font-bold"><i class="fas fa-info-circle"></i> هذا التقرير يوضح قائمة المستأجرين الذين حان موعد استحقاق دفعاتهم الإيجارية (حسب العقد) ولم يتم إصدار مطالبات مالية لهم حتى تاريخه.</p>
      </div>

      <div class="rounded-2xl border border-slate-200 overflow-hidden">
        <table class="w-full text-right text-sm">
            <thead class="bg-slate-100 border-b border-slate-200">
                <tr>
                    <th class="p-4 text-center w-12 text-slate-500 font-bold">#</th>
                    <th class="p-4 font-bold text-slate-700">المستأجر / العقار</th>
                    <th class="p-4 text-center font-bold text-slate-700">عدد المدد المستحقة</th>
                    <th class="p-4 font-bold text-slate-700">تفاصيل وتواريخ الاستحقاق</th>
                </tr>
            </thead>
            <tbody>${rows.length > 0 ? rows : '<tr><td colspan="4" class="p-8 text-center text-slate-400 font-bold">لا توجد استحقاقات أو متأخرات فوترة حالياً.</td></tr>'}</tbody>
        </table>
      </div>
  `;
  const w = window.open('', '_blank'); w.document.write(getBaseHTML('تنبيهات الاستحقاق', content)); w.document.close();
};