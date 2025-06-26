document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('requestsTableBody');
    // بما أن الواجهة الأمامية والخلفية على نفس الرابط، نترك هذا فارغاً
    const API_URL = '';

    async function fetchRequests() {
        try {
            const response = await fetch(`${API_URL}/api/requests`);
            if (!response.ok) {
                throw new Error('فشل في جلب البيانات من الخادم');
            }
            const requests = await response.json();
            renderTable(requests);
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger p-4">${error.message}</td></tr>`;
        }
    }

    function renderTable(requests) {
        tableBody.innerHTML = '';
        if (requests.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center p-4">لا توجد طلبات حالياً.</td></tr>`;
            return;
        }

        requests.forEach(req => {
            const tr = document.createElement('tr');
            
            const formattedPrayers = req.prayers.map(p => 
                `<li><strong>${p.mosque}</strong> - ${new Date(p.date).toLocaleDateString('ar-EG')}`
            ).join('');

            const eidPrayerInfo = (req.eidPrayer && req.eidPrayer.mosque) 
                ? `<strong>${req.eidPrayer.mosque}</strong> - ${new Date(req.eidPrayer.date).toLocaleDateString('ar-EG')}`
                : '<span class="text-muted">لا يوجد</span>';

            const statusClass = req.status === 'pending' ? 'status-pending' : 'status-approved';
            const statusText = req.status === 'pending' ? 'قيد المراجعة' : 'تمت الموافقة';
            
            tr.innerHTML = `
                <td>${req.preacherName}</td>
                <td>${new Date(req.createdAt).toLocaleString('ar-EG')}</td>
                <td><ul class="list-unstyled mb-0">${formattedPrayers}</ul></td>
                <td>${eidPrayerInfo}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>
                    ${req.status === 'pending' ? 
                    `<button class="btn btn-sm btn-success approve-btn" data-id="${req._id}">موافقة</button>` : 
                    `<button class="btn btn-sm btn-secondary" disabled>تم</button>`}
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    tableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('approve-btn')) {
            const button = e.target;
            const requestId = button.dataset.id;
            
            button.disabled = true;
            button.textContent = 'جاري...';

            try {
                const response = await fetch(`${API_URL}/api/requests/${requestId}/approve`, {
                    method: 'PATCH'
                });
                if (!response.ok) {
                    throw new Error('فشل في عملية الموافقة');
                }
                // إعادة تحميل البيانات لتحديث الواجهة فوراً
                fetchRequests();
            } catch (error) {
                alert(error.message);
                button.disabled = false;
                button.textContent = 'موافقة';
            }
        }
    });

    // جلب البيانات عند تحميل الصفحة لأول مرة
    fetchRequests();
});