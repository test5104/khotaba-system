document.addEventListener('DOMContentLoaded', function() {
    const addPrayerBtn = document.getElementById('addPrayerBtn');
    const prayersContainer = document.getElementById('prayersContainer');
    const prayerForm = document.getElementById('prayerForm');
    const alertContainer = document.getElementById('alert-container');

    // بما أن الواجهة الأمامية والخلفية على نفس الرابط، نترك هذا فارغاً
    const API_URL = ''; 

    addPrayerBtn.addEventListener('click', () => {
        const prayerEntry = document.createElement('div');
        prayerEntry.className = 'row prayer-entry mb-3 align-items-center';
        prayerEntry.innerHTML = `
            <div class="col-md-6">
                <label class="form-label">اسم الجامع:</label>
                <input type="text" class="form-control mosque-name" required>
            </div>
            <div class="col-md-5">
                <label class="form-label">تاريخ الصلاة:</label>
                <input type="date" class="form-control prayer-date" required>
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
        const prayerEntries = document.querySelectorAll('.prayer-entry');
        
        const prayers = [];
        prayerEntries.forEach(entry => {
            const mosque = entry.querySelector('.mosque-name').value;
            const date = entry.querySelector('.prayer-date').value;
            if (mosque && date) {
                prayers.push({ mosque, date });
            }
        });

        const eidMosque = document.getElementById('eidMosque').value;
        const eidDate = document.getElementById('eidDate').value;
        const eidPrayerData = (eidMosque && eidDate) ? { mosque: eidMosque, date: eidDate } : null;

        const dataToSend = {
            preacherName: preacherName,
            prayers: prayers,
            eidPrayer: eidPrayerData
        };
        
        try {
            const response = await fetch(`${API_URL}/api/requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || 'حدث خطأ أثناء إرسال الطلب.');
            }
            
            showAlert('تم إرسال الطلب بنجاح!', 'success');
            prayerForm.reset();
            prayersContainer.innerHTML = `
                <div class="row prayer-entry mb-3 align-items-center">
                    <div class="col-md-6"><label class="form-label">اسم الجامع:</label><input type="text" class="form-control mosque-name" required></div>
                    <div class="col-md-5"><label class="form-label">تاريخ الصلاة:</label><input type="date" class="form-control prayer-date" required></div>
                </div>
            `;

        } catch (error) {
            showAlert(error.message, 'danger');
        }
    });

    function showAlert(message, type) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="alert alert-${type} alert-dismissible" role="alert">
               ${message}
               <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        alertContainer.innerHTML = ''; // مسح التنبيهات القديمة
        alertContainer.append(wrapper);
    }
});