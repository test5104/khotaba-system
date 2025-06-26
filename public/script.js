document.addEventListener('DOMContentLoaded', function() {
    // ===========================================
    // ||    إعدادات وقوائم التاريخ الهجري        ||
    // ===========================================
    const hijriMonths = ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
    
    // دالة لإنشاء خيارات الأيام (1-30)
    function populateDays(selectElement) {
        selectElement.innerHTML = '<option value="" selected disabled>يوم</option>';
        for (let i = 1; i <= 30; i++) {
            const option = document.createElement('option');
            option.value = option.textContent = i;
            selectElement.appendChild(option);
        }
    }

    // دالة لإنشاء خيارات الشهور
    function populateMonths(selectElement) {
        selectElement.innerHTML = '<option value="" selected disabled>شهر</option>';
        hijriMonths.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index + 1; // نخزن رقم الشهر
            option.textContent = month;
            selectElement.appendChild(option);
        });
    }

    // دالة لإنشاء خيارات السنوات (من العام الحالي إلى 1460)
    function populateYears(selectElement) {
        selectElement.innerHTML = '<option value="" selected disabled>سنة</option>';
        const currentHijriYear = 1446; // يمكنك تحديث هذا سنوياً أو حسابة
        for (let i = currentHijriYear; i <= 1460; i++) {
            const option = document.createElement('option');
            option.value = option.textContent = i;
            selectElement.appendChild(option);
        }
    }

    // دالة لجمع التاريخ من 3 قوائم
    function getDateFromGroup(groupElement) {
        const day = groupElement.querySelector('.day-select').value;
        const month = groupElement.querySelector('.month-select').value;
        const year = groupElement.querySelector('.year-select').value;
        if (day && month && year) {
            return `${year}/${month}/${day}`;
        }
        return ""; // إرجاع نص فارغ إذا لم يتم تحديد التاريخ كاملاً
    }

    // ===========================================
    // ||           منطق النموذج               ||
    // ===========================================
    const addPrayerBtn = document.getElementById('addPrayerBtn');
    const prayersContainer = document.getElementById('prayersContainer');
    const prayerForm = document.getElementById('prayerForm');

    // دالة لإضافة صف صلاة جديد
    function addNewPrayerRow() {
        const prayerEntry = document.createElement('div');
        prayerEntry.className = 'row g-3 prayer-entry mb-3 align-items-center';
        prayerEntry.innerHTML = `
            <div class="col-md-5">
                <input type="text" class="form-control mosque-and-neighborhood" placeholder="اسم الجامع والحي">
            </div>
            <div class="col-md-6 d-flex date-select-group">
                <select class="form-select day-select"></select>
                <select class="form-select month-select"></select>
                <select class="form-select year-select"></select>
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-danger btn-sm remove-btn">x</button>
            </div>
        `;
        prayersContainer.appendChild(prayerEntry);
        // تفعيل قوائم التاريخ للصف الجديد
        populateDays(prayerEntry.querySelector('.day-select'));
        populateMonths(prayerEntry.querySelector('.month-select'));
        populateYears(prayerEntry.querySelector('.year-select'));
    }

    // تفعيل قوائم التاريخ الرئيسية
    populateDays(document.querySelector('#periodStart .day-select'));
    populateMonths(document.querySelector('#periodStart .month-select'));
    populateYears(document.querySelector('#periodStart .year-select'));
    populateDays(document.querySelector('#periodEnd .day-select'));
    populateMonths(document.querySelector('#periodEnd .month-select'));
    populateYears(document.querySelector('#periodEnd .year-select'));
    
    // إضافة صف صلاة أول عند تحميل الصفحة
    addNewPrayerRow();

    addPrayerBtn.addEventListener('click', addNewPrayerRow);
    
    // (الكود المتبقي لمنطق الدخول والإرسال كما هو بدون تغيير جوهري)
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    // ... باقي الكود من الرسائل السابقة ...

    prayerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const dataToSend = {
            preacherName: document.getElementById('preacherName').value,
            nationalId: document.getElementById('nationalId').value,
            periodStart: getDateFromGroup(document.getElementById('periodStart')),
            periodEnd: getDateFromGroup(document.getElementById('periodEnd')),
            prayers: Array.from(document.querySelectorAll('.prayer-entry')).map(entry => ({
                mosqueAndNeighborhood: entry.querySelector('.mosque-and-neighborhood').value,
                date: getDateFromGroup(entry)
            })).filter(p => p.mosqueAndNeighborhood || p.date) // فقط الصلوات التي بها بيانات
        };
        
        // ... باقي كود الإرسال ...
        const alertContainer = document.getElementById('alert-container');
        try {
            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });
            if (!response.ok) throw new Error('حدث خطأ أثناء إرسال الطلب.');
            
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `<div class="alert alert-success alert-dismissible" role="alert">تم إرسال الطلب بنجاح!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
            alertContainer.innerHTML = '';
            alertContainer.append(wrapper);
            prayerForm.reset();
            prayersContainer.innerHTML = '';
            addNewPrayerRow(); // إعادة إضافة صف فارغ

        } catch (error) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = `<div class="alert alert-danger alert-dismissible" role="alert">${error.message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
            alertContainer.innerHTML = '';
            alertContainer.append(wrapper);
        }
    });
});
