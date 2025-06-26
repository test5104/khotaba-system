document.addEventListener('DOMContentLoaded', function() {
    
    // =================================================================
    // ||             SECTION 1: INITIAL DATA & HELPERS             ||
    // =================================================================

    const hijriMonths = ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
    const preachersData = {
        "متعب بدر عبدالرحمن القوس": "1111111111",
        "فهد محيا سهل المهيدلي العتيبي": "2222222222",
        "سلطان معتق مفرح الروقي": "3333333333",
        "رشيد صالح سليمان العجمي": "4444444444",
        "عمر نائف عقاب الكسر العتيبي": "5555555555"
    };
    
    // === متغيرات لتثبيت التاريخ ===
    let lockedMonth = null;
    let lockedYear = null;
    let lockDateListener = null; // سيتم تعريف الدالة لاحقاً

    function populateDays(selectElement) {
        selectElement.innerHTML = '<option value="" selected disabled>يوم</option>';
        for (let i = 1; i <= 31; i++) {
            selectElement.add(new Option(i, i));
        }
    }

    function populateMonths(selectElement) {
        selectElement.innerHTML = '<option value="" selected disabled>شهر</option>';
        hijriMonths.forEach((month, index) => {
            selectElement.add(new Option(month, index + 1));
        });
    }

    function populateYears(selectElement, startYear = 1446, endYear = 1460) {
        selectElement.innerHTML = '<option value="" selected disabled>سنة</option>';
        for (let i = startYear; i <= endYear; i++) {
            selectElement.add(new Option(`${i}هـ`, i));
        }
    }

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

    const preacherNameSelect = document.getElementById('preacherName');
    const nationalIdInput = document.getElementById('nationalId');
    const monthPeriodSelect = document.getElementById('month-period-select');
    const yearPeriodSelect = document.getElementById('year-period-select');
    const addPrayerBtn = document.getElementById('addPrayerBtn');
    const prayersContainer = document.getElementById('prayersContainer');
    const prayerForm = document.getElementById('prayerForm');

    preacherNameSelect.addEventListener('change', function() {
        nationalIdInput.value = preachersData[this.value] || '';
    });

    populateMonths(monthPeriodSelect);
    populateYears(yearPeriodSelect);

    // دالة لإضافة صف صلاة جديد مع المنطق الجديد لتثبيت التاريخ
    function addNewPrayerRow() {
        const prayerEntry = document.createElement('div');
        prayerEntry.className = 'row g-3 prayer-entry mb-3 align-items-center';
        prayerEntry.innerHTML = `
            <div class="col-12 col-md-5"><input type="text" class="form-control mosque-and-neighborhood" placeholder="اسم الجامع والحي"></div>
            <div class="col-12 col-md-6"><div class="d-flex date-select-group"><select class="form-select day-select"></select><select class="form-select month-select"></select><select class="form-select year-select"></select></div></div>
            <div class="col-12 col-md-1 text-center"><button type="button" class="btn btn-danger btn-sm remove-btn w-100">x</button></div>`;
        
        prayersContainer.appendChild(prayerEntry);
        
        const daySelect = prayerEntry.querySelector('.day-select');
        const monthSelect = prayerEntry.querySelector('.month-select');
        const yearSelect = prayerEntry.querySelector('.year-select');

        populateDays(daySelect);
        populateMonths(monthSelect);
        populateYears(yearSelect);

        // إذا كان هناك شهر وسنة مثبتان، قم بتطبيقهما على الصف الجديد
        if (lockedMonth && lockedYear) {
            monthSelect.value = lockedMonth;
            yearSelect.value = lockedYear;
            monthSelect.disabled = true;
            yearSelect.disabled = true;
        }
    }
    
    // دالة لربط حدث تثبيت التاريخ بأول صف صلاة
    function attachLockListener() {
        const firstPrayerRow = prayersContainer.querySelector('.prayer-entry');
        if (firstPrayerRow) {
            const firstMonthSelect = firstPrayerRow.querySelector('.month-select');
            const firstYearSelect = firstPrayerRow.querySelector('.year-select');
            
            // تعريف الدالة التي سيتم استدعاؤها عند التغيير
            lockDateListener = () => {
                if (firstMonthSelect.value && firstYearSelect.value) {
                    lockedMonth = firstMonthSelect.value;
                    lockedYear = firstYearSelect.value;
                } else {
                    lockedMonth = null;
                    lockedYear = null;
                }
            };
            
            firstMonthSelect.addEventListener('change', lockDateListener);
            firstYearSelect.addEventListener('change', lockDateListener);
        }
    }

    // تفعيل قوائم التاريخ الرئيسية
    populateDays(document.querySelector('#periodStart .day-select'));
    populateMonths(document.querySelector('#periodStart .month-select'));
    populateYears(document.querySelector('#periodStart .year-select'));
    populateDays(document.querySelector('#periodEnd .day-select'));
    populateMonths(document.querySelector('#periodEnd .month-select'));
    populateYears(document.querySelector('#periodEnd .year-select'));
    
    addNewPrayerRow(); // إضافة أول صف صلاة
    attachLockListener(); // ربط حدث التثبيت بأول صف

    addPrayerBtn.addEventListener('click', addNewPrayerRow);

    prayersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            e.target.closest('.prayer-entry').remove();
        }
    });
    
    // =================================================================
    // ||          SECTION 3: ADMIN LOGIN & FORM SUBMISSION         ||
    // =================================================================
    
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const passwordModal = document.getElementById('passwordModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const submitPasswordBtn = document.getElementById('submitPasswordBtn');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const ADMIN_PASSWORD = "admin";

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

    if(prayerForm) {
        prayerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const monthText = monthPeriodSelect.options[monthPeriodSelect.selectedIndex]?.text || '';
            const yearText = yearPeriodSelect.options[yearPeriodSelect.selectedIndex]?.text || '';
            const fullMonthName = (monthText && yearText) ? `${monthText} لعام ${yearText}` : '';
            
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
            
            try {
                const response = await fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSend)
                });
                if (!response.ok) throw new Error('حدث خطأ أثناء إرسال الطلب.');
                showAlert('تم إرسال الطلب بنجاح!', 'success');
                
                // إعادة تعيين كل شيء للحالة الأولية
                prayerForm.reset();
                nationalIdInput.value = '';
                prayersContainer.innerHTML = '';
                lockedMonth = null;
                lockedYear = null;
                addNewPrayerRow();
                attachLockListener();

            } catch (error) {
                showAlert(error.message, 'danger');
            }
        });
    }

    function showAlert(message, type) {
        const alertContainer = document.getElementById('alert-container');
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        alertContainer.innerHTML = '';
        alertContainer.append(wrapper);
    }
});
