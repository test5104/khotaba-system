document.addEventListener('DOMContentLoaded', function() {
    
    // =================================================================
    // ||             SECTION 1: INITIAL DATA & HELPERS             ||
    // =================================================================

    // بيانات ثابتة للمساعدة في ملء القوائم
    const hijriMonths = ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
    const preachersData = {
        "متعب بدر عبدالرحمن القوس": "1111111111",
        "فهد محيا سهل المهيدلي العتيبي": "2222222222",
        "سلطان معتق مفرح الروقي": "3333333333",
        "رشيد صالح سليمان العجمي": "4444444444",
        "عمر نائف عقاب الكسر العتيبي": "5555555555"
    };

    // دالة لمسح وملء قائمة الأيام (1-31)
    function populateDays(selectElement) {
        selectElement.innerHTML = '<option value="" selected disabled>يوم</option>';
        for (let i = 1; i <= 31; i++) {
            selectElement.add(new Option(i, i));
        }
    }

    // دالة لمسح وملء قائمة الشهور الهجرية
    function populateMonths(selectElement) {
        selectElement.innerHTML = '<option value="" selected disabled>شهر</option>';
        hijriMonths.forEach((month, index) => {
            selectElement.add(new Option(month, index + 1));
        });
    }

    // دالة لمسح وملء قائمة السنوات (من 1446 إلى 1460)
    function populateYears(selectElement, startYear = 1446, endYear = 1460) {
        selectElement.innerHTML = '<option value="" selected disabled>سنة</option>';
        for (let i = startYear; i <= endYear; i++) {
            selectElement.add(new Option(`${i}هـ`, i));
        }
    }

    // دالة لجمع التاريخ من 3 قوائم منسدلة
    function getDateFromGroup(groupElement) {
        if (!groupElement) return "";
        const day = groupElement.querySelector('.day-select').value;
        const month = groupElement.querySelector('.month-select').value;
        const year = groupElement.querySelector('.year-select').value;
        return (day && month && year) ? `${year}/${month}/${day}` : "";
    }
    
    // =================================================================
    // ||              SECTION 2: FORM & UI LOGIC                   ||
    // =================================================================

    // جلب كل عناصر الصفحة التي سنتعامل معها
    const preacherNameSelect = document.getElementById('preacherName');
    const nationalIdInput = document.getElementById('nationalId');
    const monthPeriodSelect = document.getElementById('month-period-select');
    const yearPeriodSelect = document.getElementById('year-period-select');
    const addPrayerBtn = document.getElementById('addPrayerBtn');
    const prayersContainer = document.getElementById('prayersContainer');
    const prayerForm = document.getElementById('prayerForm');

    // تفعيل ربط اسم الخطيب بالهوية
    preacherNameSelect.addEventListener('change', function() {
        const selectedPreacher = this.value;
        nationalIdInput.value = preachersData[selectedPreacher] || '';
    });

    // ملء قوائم "لفترة شهر" الرئيسية
    populateMonths(monthPeriodSelect);
    populateYears(yearPeriodSelect);

    // دالة لإضافة صف صلاة جديد
    function addNewPrayerRow() {
        const prayerEntry = document.createElement('div');
        prayerEntry.className = 'row g-3 prayer-entry mb-3 align-items-center';
        prayerEntry.innerHTML = `
            <div class="col-12 col-md-5">
                <input type="text" class="form-control mosque-and-neighborhood" placeholder="اسم الجامع والحي">
            </div>
            <div class="col-12 col-md-6">
                 <div class="d-flex date-select-group">
                    <select class="form-select day-select"></select>
                    <select class="form-select month-select"></select>
                    <select class="form-select year-select"></select>
                </div>
            </div>
            <div class="col-12 col-md-1 text-center">
                <button type="button" class="btn btn-danger btn-sm remove-btn w-100">x</button>
            </div>
        `;
        prayersContainer.appendChild(prayerEntry);
        // تفعيل قوائم التاريخ للصف الجديد
        populateDays(prayerEntry.querySelector('.day-select'));
        populateMonths(prayerEntry.querySelector('.month-select'));
        populateYears(prayerEntry.querySelector('.year-select'));
    }

    // تفعيل قوائم "من تاريخ" و "إلى تاريخ"
    populateDays(document.querySelector('#periodStart .day-select'));
    populateMonths(document.querySelector('#periodStart .month-select'));
    populateYears(document.querySelector('#periodStart .year-select'));
    populateDays(document.querySelector('#periodEnd .day-select'));
    populateMonths(document.querySelector('#periodEnd .month-select'));
    populateYears(document.querySelector('#periodEnd .year-select'));
    
    // إضافة صف صلاة فارغ عند تحميل الصفحة
    addNewPrayerRow();

    // ربط زر "إضافة صلاة" بالدالة الخاصة به
    addPrayerBtn.addEventListener('click', addNewPrayerRow);

    // ربط زر الحذف بالدالة الخاصة به
    prayersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            e.target.closest('.prayer-entry').remove();
        }
    });
    
    // =================================================================
    // ||          SECTION 3: ADMIN LOGIN & FORM SUBMISSION         ||
    // =================================================================
    
    // جلب عناصر نافذة تسجيل الدخول
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const passwordModal = document.getElementById('passwordModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const submitPasswordBtn = document.getElementById('submitPasswordBtn');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const ADMIN_PASSWORD = "admin";

    // منطق نافذة تسجيل الدخول كاملاً
    if (adminLoginBtn && passwordModal) {
        adminLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            passwordModal.classList.add('active');
            passwordInput.focus();
        });

        closeModalBtn.addEventListener('click', () => {
            passwordModal.classList.remove('active');
        });
        
        passwordModal.addEventListener('click', (e) => {
            if (e.target === passwordModal) {
                passwordModal.classList.remove('active');
            }
        });

        submitPasswordBtn.addEventListener('click', () => {
            if (passwordInput.value === ADMIN_PASSWORD) {
                window.location.href = '/admin.html';
            } else {
                passwordError.style.display = 'block';
            }
        });
    }

    // منطق إرسال النموذج كاملاً
    if (prayerForm) {
        prayerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // بناء حقل "لفترة شهر" من القوائم المنسدلة
            const monthText = monthPeriodSelect.options[monthPeriodSelect.selectedIndex]?.text || '';
            const yearText = yearPeriodSelect.options[yearPeriodSelect.selectedIndex]?.text || '';
            const fullMonthName = (monthText && yearText) ? `${monthText} لعام ${yearText}` : '';
            
            // تجميع كل البيانات في كائن واحد
            const dataToSend = {
                preacherName: preacherNameSelect.value,
                nationalId: nationalIdInput.value,
                monthName: fullMonthName,
                periodStart: getDateFromGroup(document.getElementById('periodStart')),
                periodEnd: getDateFromGroup(document.getElementById('periodEnd')),
                prayers: Array.from(document.querySelectorAll('.prayer-entry')).map(entry => ({
                    mosqueAndNeighborhood: entry.querySelector('.mosque-and-neighborhood').value,
                    date: getDateFromGroup(entry.querySelector('.date-select-group'))
                })).filter(p => p.mosqueAndNeighborhood || p.date)
            };
            
            // إرسال البيانات إلى الخادم
            try {
                const response = await fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSend)
                });
                if (!response.ok) throw new Error('حدث خطأ أثناء إرسال الطلب.');
                showAlert('تم إرسال الطلب بنجاح!', 'success');
                prayerForm.reset(); // إعادة تعيين النموذج
                nationalIdInput.value = ''; // مسح الهوية الوطنية يدوياً
                prayersContainer.innerHTML = ''; // مسح الصلوات القديمة
                addNewPrayerRow(); // إضافة صف فارغ جديد
            } catch (error) {
                showAlert(error.message, 'danger');
            }
        });
    }

    // دالة لإظهار رسائل التنبيه للمستخدم
    function showAlert(message, type) {
        const alertContainer = document.getElementById('alert-container');
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        alertContainer.innerHTML = '';
        alertContainer.append(wrapper);
    }
});
