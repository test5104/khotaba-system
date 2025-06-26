document.addEventListener('DOMContentLoaded', function() {
    const hijriMonths = ["محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
    
    function populateDays(selectElement) {
        selectElement.innerHTML = '<option value="" selected disabled>يوم</option>';
        for (let i = 1; i <= 30; i++) { selectElement.add(new Option(i, i)); }
    }

    function populateMonths(selectElement) {
        selectElement.innerHTML = '<option value="" selected disabled>شهر</option>';
        hijriMonths.forEach((month, index) => { selectElement.add(new Option(month, index + 1)); });
    }

    function populateYears(selectElement) {
        selectElement.innerHTML = '<option value="" selected disabled>سنة</option>';
        const currentHijriYear = 1446;
        for (let i = currentHijriYear; i <= 1460; i++) { selectElement.add(new Option(i, i)); }
    }

    function getDateFromGroup(groupElement) {
        if (!groupElement) return "";
        const day = groupElement.querySelector('.day-select').value;
        const month = groupElement.querySelector('.month-select').value;
        const year = groupElement.querySelector('.year-select').value;
        return (day && month && year) ? `${year}/${month}/${day}` : "";
    }
    
    const addPrayerBtn = document.getElementById('addPrayerBtn');
    const prayersContainer = document.getElementById('prayersContainer');
    const prayerForm = document.getElementById('prayerForm');

    function addNewPrayerRow() {
        const prayerEntry = document.createElement('div');
        prayerEntry.className = 'row g-3 prayer-entry mb-3 align-items-center';
        prayerEntry.innerHTML = `
            <div class="col-md-5"><input type="text" class="form-control mosque-and-neighborhood" placeholder="اسم الجامع والحي"></div>
            <div class="col-md-6 d-flex date-select-group"><select class="form-select day-select"></select><select class="form-select month-select"></select><select class="form-select year-select"></select></div>
            <div class="col-md-1"><button type="button" class="btn btn-danger btn-sm remove-btn">x</button></div>`;
        prayersContainer.appendChild(prayerEntry);
        populateDays(prayerEntry.querySelector('.day-select'));
        populateMonths(prayerEntry.querySelector('.month-select'));
        populateYears(prayerEntry.querySelector('.year-select'));
    }

    populateDays(document.querySelector('#periodStart .day-select'));
    populateMonths(document.querySelector('#periodStart .month-select'));
    populateYears(document.querySelector('#periodStart .year-select'));
    populateDays(document.querySelector('#periodEnd .day-select'));
    populateMonths(document.querySelector('#periodEnd .month-select'));
    populateYears(document.querySelector('#periodEnd .year-select'));
    addNewPrayerRow();

    addPrayerBtn.addEventListener('click', addNewPrayerRow);

    prayersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            e.target.closest('.prayer-entry').remove();
        }
    });
    
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const passwordModal = document.getElementById('passwordModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const submitPasswordBtn = document.getElementById('submitPasswordBtn');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const ADMIN_PASSWORD = "admin";

    if(adminLoginBtn) {
        adminLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            passwordModal.style.display = 'flex';
            passwordInput.focus();
        });
    }

    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            passwordModal.style.display = 'none';
        });
    }

    if(submitPasswordBtn) {
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
            const dataToSend = {
                preacherName: document.getElementById('preacherName').value,
                nationalId: document.getElementById('nationalId').value,
                monthName: document.getElementById('monthName').value,
                periodStart: getDateFromGroup(document.getElementById('periodStart')),
                periodEnd: getDateFromGroup(document.getElementById('periodEnd')),
                prayers: Array.from(document.querySelectorAll('.prayer-entry')).map(entry => ({
                    mosqueAndNeighborhood: entry.querySelector('.mosque-and-neighborhood').value,
                    date: getDateFromGroup(entry)
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
                prayerForm.reset();
                prayersContainer.innerHTML = '';
                addNewPrayerRow();
            } catch (error) {
                showAlert(error.message, 'danger');
            }
        });
    }

    function showAlert(message, type) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        const alertContainer = document.getElementById('alert-container');
        alertContainer.innerHTML = '';
        alertContainer.append(wrapper);
    }
});