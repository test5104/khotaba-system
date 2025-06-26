document.addEventListener('DOMContentLoaded', function() {
    
    // SECTION 1: INITIAL DATA & HELPERS
    const hijriMonths = ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
    const preachersData = {
        "متعب بدر عبدالرحمن القوس": "1111111111",
        "فهد محيا سهل المهيدلي العتيبي": "2222222222",
        "سلطان معتق مفرح الروقي": "3333333333",
        "رشيد صالح سليمان العجمي": "4444444444",
        "عمر نائف عقاب الكسر العتيبي": "5555555555"
    };
    let lockedPrayerMonth = null, lockedPrayerYear = null, lockPrayerDateListener = null;

    function populateDays(select) { select.innerHTML = '<option value="" selected disabled>يوم</option>'; for (let i = 1; i <= 31; i++) select.add(new Option(i, i)); }
    function populateMonths(select) { select.innerHTML = '<option value="" selected disabled>شهر</option>'; hijriMonths.forEach((m, i) => select.add(new Option(m, i + 1))); }
    function populateYears(select, start = 1446, end = 1460) { select.innerHTML = '<option value="" selected disabled>سنة</option>'; for (let i = start; i <= end; i++) select.add(new Option(`${i}هـ`, i)); }
    function getDateFromGroup(group) {
        if (!group) return "";
        const d = group.querySelector('.day-select').value;
        const m = group.querySelector('.month-select').value;
        const y = group.querySelector('.year-select').value;
        return (d && m && y) ? `${y}/${m}/${d}` : "";
    }

    // SECTION 2: FORM & UI LOGIC
    const preacherNameSelect = document.getElementById('preacherName');
    const nationalIdInput = document.getElementById('nationalId');
    const monthPeriodSelect = document.getElementById('month-period-select');
    const yearPeriodSelect = document.getElementById('year-period-select');
    const addPrayerBtn = document.getElementById('addPrayerBtn');
    const prayersContainer = document.getElementById('prayersContainer');
    const prayerForm = document.getElementById('prayerForm');
    const periodStartGroup = document.getElementById('periodStart');
    const periodEndGroup = document.getElementById('periodEnd');
    const periodStartMonth = periodStartGroup.querySelector('.month-select');
    const periodStartYear = periodStartGroup.querySelector('.year-select');
    const periodEndMonth = periodEndGroup.querySelector('.month-select');
    const periodEndYear = periodEndGroup.querySelector('.year-select');

    const lockPeriodListener = () => {
        if (periodStartMonth.value && periodStartYear.value) {
            periodEndMonth.value = periodStartMonth.value;
            periodEndYear.value = periodStartYear.value;
        }
    };
    periodStartMonth.addEventListener('change', lockPeriodListener);
    periodStartYear.addEventListener('change', lockPeriodListener);

    preacherNameSelect.addEventListener('change', function() { nationalIdInput.value = preachersData[this.value] || ''; });
    populateMonths(monthPeriodSelect);
    populateYears(yearPeriodSelect);

    function addNewPrayerRow() {
        const entry = document.createElement('div');
        entry.className = 'row g-3 prayer-entry mb-3 align-items-center';
        entry.innerHTML = `
            <div class="col-12 col-md-5"><input type="text" class="form-control mosque-and-neighborhood" placeholder="اسم الجامع والحي"></div>
            <div class="col-12 col-md-6"><div class="d-flex date-select-group"><select class="form-select day-select"></select><select class="form-select month-select"></select><select class="form-select year-select"></select></div></div>
            <div class="col-12 col-md-1 text-center"><button type="button" class="btn btn-danger btn-sm remove-btn w-100">x</button></div>`;
        prayersContainer.appendChild(entry);
        const monthSelect = entry.querySelector('.month-select');
        const yearSelect = entry.querySelector('.year-select');
        populateDays(entry.querySelector('.day-select'));
        populateMonths(monthSelect);
        populateYears(yearSelect);
        if (lockedPrayerMonth && lockedPrayerYear) {
            monthSelect.value = lockedPrayerMonth;
            yearSelect.value = lockedPrayerYear;
            monthSelect.disabled = true;
            yearSelect.disabled = true;
        }
    }
    
    function attachLockListener() {
        const firstRow = prayersContainer.querySelector('.prayer-entry');
        if (firstRow) {
            const firstMonth = firstRow.querySelector('.month-select'), firstYear = firstRow.querySelector('.year-select');
            lockPrayerDateListener = () => {
                lockedPrayerMonth = (firstMonth.value && firstYear.value) ? firstMonth.value : null;
                lockedPrayerYear = (firstMonth.value && firstYear.value) ? firstYear.value : null;
            };
            firstMonth.addEventListener('change', lockPrayerDateListener);
            firstYear.addEventListener('change', lockPrayerDateListener);
        }
    }

    populateDays(periodStartGroup.querySelector('.day-select'));
    populateMonths(periodStartMonth);
    populateYears(periodStartYear);
    populateDays(periodEndGroup.querySelector('.day-select'));
    populateMonths(periodEndMonth);
    populateYears(periodEndYear);
    addNewPrayerRow();
    attachLockListener();

    addPrayerBtn.addEventListener('click', addNewPrayerRow);
    prayersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) { e.target.closest('.prayer-entry').remove(); }
    });
    
    // SECTION 3: ADMIN LOGIN & FORM SUBMISSION
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
        const closeModal = () => {
            passwordModal.classList.remove('active');
            passwordError.style.display = 'none';
            passwordInput.value = '';
        }
        closeModalBtn.addEventListener('click', closeModal);
        passwordModal.addEventListener('click', (e) => { if (e.target === passwordModal) closeModal(); });
        submitPasswordBtn.addEventListener('click', () => {
            if (passwordInput.value === ADMIN_PASSWORD) {
                window.location.href = '/admin.html';
            } else {
                passwordError.style.display = 'block';
            }
        });
    }

    if (prayerForm) {
        prayerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const isMonthValid = monthPeriodSelect.value && yearPeriodSelect.value;
            const isStartValid = getDateFromGroup(periodStartGroup);
            const isEndValid = periodEndGroup.querySelector('.day-select').value;
            if (!isMonthValid || !isStartValid || !isEndValid) {
                return showAlert('الرجاء تعبئة جميع الحقول التي تحتوي على علامة النجمة (*).', 'warning');
            }
            const monthText = monthPeriodSelect.options[monthPeriodSelect.selectedIndex]?.text || '', yearText = yearPeriodSelect.options[yearPeriodSelect.selectedIndex]?.text || '';
            const dataToSend = {
                preacherName: preacherNameSelect.value,
                nationalId: nationalIdInput.value,
                monthName: (monthText && yearText) ? `${monthText} لعام ${yearText}` : '',
                periodStart: getDateFromGroup(periodStartGroup),
                periodEnd: getDateFromGroup(periodEndGroup),
                prayers: Array.from(document.querySelectorAll('.prayer-entry')).map(entry => ({
                    mosqueAndNeighborhood: entry.querySelector('.mosque-and-neighborhood').value,
                    date: getDateFromGroup(entry.querySelector('.date-select-group'))
                })).filter(p => p.mosqueAndNeighborhood || p.date)
            };
            try {
                const res = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend) });
                if (!res.ok) throw new Error('حدث خطأ أثناء إرسال الطلب.');
                showAlert('تم إرسال الطلب بنجاح!', 'success');
                prayerForm.reset();
                nationalIdInput.value = '';
                prayersContainer.innerHTML = '';
                lockedPrayerMonth = null, lockedPrayerYear = null;
                addNewPrayerRow();
                attachLockListener();
                lockPeriodListener();
            } catch (err) {
                showAlert(err.message, 'danger');
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
