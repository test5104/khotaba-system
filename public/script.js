document.addEventListener('DOMContentLoaded', function() {
    // --- متغيرات نموذج الإرسال ---
    const addPrayerBtn = document.getElementById('addPrayerBtn');
    const prayersContainer = document.getElementById('prayersContainer');
    const prayerForm = document.getElementById('prayerForm');
    const alertContainer = document.getElementById('alert-container');
    const API_URL = ''; 

    // --- متغيرات تسجيل دخول الإدارة ---
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const passwordModal = document.getElementById('passwordModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const submitPasswordBtn = document.getElementById('submitPasswordBtn');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const ADMIN_PASSWORD = "admin"; // يمكنك تغيير هذا الرمز السري

    // ===========================================
    // ||    منطق تسجيل دخول الإدارة           ||
    // ===========================================
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
            // إذا كان الرمز صحيحاً، انتقل إلى صفحة الإدارة
            window.location.href = '/admin.html';
        } else {
            // إذا كان الرمز خاطئاً، أظهر رسالة خطأ
            passwordError.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
    
    // للسماح بالدخول عند الضغط على زر Enter
    passwordInput.addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            submitPasswordBtn.click();
        }
    });


    // ===========================================
    // ||        منطق نموذج الإرسال            ||
    // ===========================================
    addPrayerBtn.addEventListener('click', () => {
        const prayerEntry = document.createElement('div');
        prayerEntry.className = 'row g-3 prayer-entry mb-3 align-items-center';
        prayerEntry.innerHTML = `
            <div class="col-md-6">
                <input type="text" class="form-control mosque-and-neighborhood" placeholder="اسم الجامع والحي">
            </div>
            <div class="col-md-5">
                <input type="text" class="form-control prayer-date" placeholder="تاريخ الصلاة (هجري)">
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-danger btn-sm remove-btn">x</button>
            </div>
        `;
        prayersContainer.appendChild(prayerEntry);
    });

    prayersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            e.target.closest('.prayer-entry').remove();
        }
    });

    prayerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
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
