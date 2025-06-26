document.addEventListener('DOMContentLoaded', function() {
    const pendingContainer = document.getElementById('pending-requests-container');
    const archiveAccordion = document.getElementById('archive-accordion');
    const noPendingMsg = document.getElementById('no-pending-msg');
    const noArchiveMsg = document.getElementById('no-archive-msg');
    const API_URL = '';

    async function fetchAndRenderAll() {
        try {
            const response = await fetch(`${API_URL}/api/requests`);
            if (!response.ok) throw new Error('فشل في جلب البيانات');
            const requests = await response.json();

            // فصل الطلبات إلى معلقة ومؤرشفة
            const pendingRequests = requests.filter(r => r.status === 'pending');
            const approvedRequests = requests.filter(r => r.status === 'approved');

            renderPendingRequests(pendingRequests);
            renderArchive(approvedRequests);

        } catch (error) {
            pendingContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    }

    // دالة لرسم الطلبات المعلقة على شكل تقارير
    function renderPendingRequests(pending) {
        pendingContainer.innerHTML = ''; // مسح المحتوى القديم
        if (pending.length === 0) {
            pendingContainer.appendChild(noPendingMsg);
            noPendingMsg.style.display = 'block';
            return;
        }
        noPendingMsg.style.display = 'none';

        pending.forEach(req => {
            const reportCard = document.createElement('div');
            reportCard.className = 'report-card shadow-sm';
            
            let prayersHtml = '';
            req.prayers.forEach((prayer, index) => {
                prayersHtml += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${prayer.date || 'غير محدد'}</td>
                        <td>${prayer.mosqueAndNeighborhood || 'غير محدد'}</td>
                    </tr>
                `;
            });

            reportCard.innerHTML = `
                <div class="report-header">
                    <h5>طلب مستحقات خطيب متعاون</h5>
                    <h6>لفترة شهر: ${req.monthName || 'غير محدد'}</h6>
                </div>
                <div class="report-body">
                    <table class="report-table mb-3">
                        <tr>
                            <th>الاسم</th>
                            <td colspan="2">${req.preacherName || 'غير محدد'}</td>
                            <th>من</th>
                            <td>${req.periodStart || 'غير محدد'}</td>
                        </tr>
                        <tr>
                            <th>الهوية الوطنية</th>
                            <td colspan="2">${req.nationalId || 'غير محدد'}</td>
                            <th>إلى</th>
                            <td>${req.periodEnd || 'غير محدد'}</td>
                        </tr>
                    </table>
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th style="width: 10%;">م</th>
                                <th style="width: 30%;">التاريخ</th>
                                <th>اسم الجامع والحي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${prayersHtml || '<tr><td colspan="3">لا توجد صلوات مسجلة</td></tr>'}
                        </tbody>
                    </table>
                </div>
                <div class="card-footer bg-transparent border-0 text-center p-3">
                    <button class="btn btn-success approve-btn" data-id="${req._id}">اعتماد وأرشفة الطلب</button>
                </div>
            `;
            pendingContainer.appendChild(reportCard);
        });
    }

    // دالة لرسم الأرشيف مجمعاً حسب الخطيب
    function renderArchive(approved) {
        archiveAccordion.innerHTML = '';
        if (approved.length === 0) {
            archiveAccordion.appendChild(noArchiveMsg);
            noArchiveMsg.style.display = 'block';
            return;
        }
        noArchiveMsg.style.display = 'none';

        // تجميع الطلبات حسب اسم الخطيب
        const groupedByPreacher = approved.reduce((acc, req) => {
            const key = req.preacherName || 'غير معروف';
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(req);
            return acc;
        }, {});

        Object.keys(groupedByPreacher).forEach((preacherName, index) => {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';
            const preacherId = `preacher-${index}`;
            
            let reportsHtml = '<ul class="list-group list-group-flush">';
            groupedByPreacher[preacherName].forEach(req => {
                reportsHtml += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        تقرير شهر: ${req.monthName || new Date(req.createdAt).toLocaleDateString('ar-SA', {month: 'long', year: 'numeric'})}
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${req._id}">حذف</button>
                    </li>
                `;
            });
            reportsHtml += '</ul>';

            accordionItem.innerHTML = `
                <h2 class="accordion-header" id="heading-${preacherId}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${preacherId}">
                        ${preacherName} (${groupedByPreacher[preacherName].length} تقارير)
                    </button>
                </h2>
                <div id="collapse-${preacherId}" class="accordion-collapse collapse" data-bs-parent="#archive-accordion">
                    <div class="accordion-body">
                        ${reportsHtml}
                    </div>
                </div>
            `;
            archiveAccordion.appendChild(accordionItem);
        });
    }
    
    // التعامل مع الأحداث (الضغط على الأزرار)
    document.body.addEventListener('click', async (e) => {
        // زر الموافقة والأرشفة
        if (e.target.classList.contains('approve-btn')) {
            const button = e.target;
            const id = button.dataset.id;
            button.disabled = true;
            button.textContent = 'جاري الأرشفة...';
            try {
                await fetch(`${API_URL}/api/requests/${id}/approve`, { method: 'PATCH' });
                fetchAndRenderAll(); // إعادة تحميل كل شيء
            } catch (error) {
                alert('فشلت عملية الأرشفة');
                button.disabled = false;
                button.textContent = 'اعتماد وأرشفة الطلب';
            }
        }
        // زر الحذف من الأرشيف
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('هل أنت متأكد من حذف هذا التقرير نهائياً؟')) {
                const button = e.target;
                const id = button.dataset.id;
                button.disabled = true;
                try {
                    await fetch(`${API_URL}/api/requests/${id}`, { method: 'DELETE' });
                    fetchAndRenderAll(); // إعادة تحميل كل شيء
                } catch (error) {
                    alert('فشلت عملية الحذف');
                    button.disabled = false;
                }
            }
        }
    });

    // استيراد مكتبة Bootstrap JS لتشغيل الأكورديون
    const bootstrapScript = document.createElement('script');
    bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
    document.body.appendChild(bootstrapScript);
    
    // تحميل البيانات عند فتح الصفحة
    fetchAndRenderAll();
});
