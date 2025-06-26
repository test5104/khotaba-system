// ننتظر حتى يتم تحميل كل محتويات الصفحة بالكامل
document.addEventListener('DOMContentLoaded', function() {
    
    // ===========================================
    // ||    الحل النهائي لتشغيل التقويم الهجري  ||
    // ===========================================
    // هذه الدالة تقوم بتفعيل التقويم لكل حقول التواريخ
    function initializeHijriPickers() {
        // ابحث عن كل حقول الإدخال التي تحتوي على هذه الخاصية
        const datePickerElements = document.querySelectorAll('[data-hijri-date-picker]');
        
        // قم بتشغيل التقويم لكل حقل منها
        datePickerElements.forEach(element => {
            new HijriDatePicker(element, {
                // هنا يمكن إضافة إعدادات إضافية في المستقبل
            });
        });
        console.log(`تم العثور على ${datePickerElements.length} حقل تاريخ وتفعيل التقويم لها.`);
    }

    // قم بتشغيل الدالة بعد فترة قصيرة جداً لضمان أن كل شيء قد تم تحميله
    // هذا يحل مشكلة "السباق التقني"
    setTimeout(initializeHijriPickers, 200);


    // ===========================================
    // ||    منطق تسجيل دخول الإدارة           ||
    // ===========================================
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const passwordModal = document.getElementById('passwordModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const submitPasswordBtn = document.getElementById('submitPasswordBtn');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const ADMIN_PASSWORD = "admin";

    adminLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        passwordModal.style.display = 'flex';
        passwordInput.focus();
    });

    closeModalBtn.addEventListener('click', () => {
        passwordModal.style.display = 'none';
        passwordError.style.display = 'none';
        passwordInput.value = '';
    });

    submitPasswordBtn.addEventListener('click', () => {
        if (passwordInput.value === ADMIN_PASSWORD) {
            window.location.href = '/admin.html';
        } else {
            passwordError.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
    
    passwordInput.addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            submitPasswordBtn.click();
        }
    });


    // ===========================================
    // ||        منطق نموذج الإرسال            ||
    // ===========================================
    const addPrayerBtn = document.getElementById('addPrayerBtn');
    const prayersContainer = document.getElementById('prayersContainer');
    const prayerForm = document.getElementById('prayerForm');
    const alertContainer = document.getElementById('alert-container');
    const API_URL = ''; 

    addPrayerBtn.addEventListener('click', () => {
        const prayerEntry = document.createElement('div');
        prayerEntry.className = 'row g-3 prayer-entry mb-3 align-items-center';
        // نضيف الخاصية هنا أيضاً للحقول الجديدة
        prayerEntry.innerHTML = `
            <div class="col-md-6">
                <input type="text" class="form-control mosque-and-neighborhood" placeholder="اسم الجامع والحي">
            </div>
            <div class="col-md-5">
                <input type="text" class="form-control prayer-date" placeholder="تاريخ الصلاة (هجري)" data-hijri-date-picker>
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-danger btn-sm remove-btn">x</button>
            </div>
        `;
        prayersContainer.appendChild(prayerEntry);
        // يجب أن نقوم بتفعيل التقويم مرة أخرى للحقل الجديد الذي تم إضافته
        initializeHijriPickers();
    });

    prayersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            e.target.closest('.prayer-entry').remove();
        }
    });

    prayerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        // (باقي كود الإرسال لم يتغير)
        const preacherName = document.getElementById('preacherName').value;
        const nationalId = document.getElementById('nationalId').value;
        const periodStart = document.getElementById('periodStart').value;
        const periodEnd = document.getElementById('periodEnd').value;
        const prayerEntries = document.querySelectorAll('.prayer-entry');
        const prayers = [];
        prayerEntries.forEach(entry => {
            const mosqueAndNeighborhood = entry.querySelector('.mosque-and-neighborhood').value;
            const date = entry.querySelector('.prayer-date').value;
            if (mosqueAndNeighborhood || date) {
                prayers.push({ mosqueAndNeighborhood, date });
            }
        });
        const dataToSend = { preacherName, nationalId, periodStart, periodEnd, prayers };
        
        try {
            const response = await fetch(`${API_URL}/api/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });
            if (!response.ok) throw new Error('حدث خطأ أثناء إرسال الطلب.');
            showAlert('تم إرسال الطلب بنجاح!', 'success');
            prayerForm.reset();
        } catch (error) {
            showAlert(error.message, 'danger');
        }
    });

    function showAlert(message, type) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        alertContainer.innerHTML = '';
        alertContainer.append(wrapper);
    }
});
