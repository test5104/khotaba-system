// This file should only contain code that runs in the browser.
// No 'require' statements are allowed here.

document.addEventListener('DOMContentLoaded', function() {
    const pendingContainer = document.getElementById('pending-requests-container');
    const archiveAccordion = document.getElementById('archive-accordion');
    const noPendingMsg = document.getElementById('no-pending-msg');
    const noArchiveMsg = document.getElementById('no-archive-msg');
    
    // متغيرات نوافذ العرض
    const reportModal = document.getElementById('report-modal');
    const reportModalContent = document.getElementById('report-modal-content');
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

    let allRequests = []; // لتخزين كل الطلبات محلياً
    let deleteTargetId = null; // لتخزين ID الطلب المراد حذفه

    // دالة رئيسية لجلب وعرض كل شيء
    async function fetchAndRenderAll() {
        try {
            const response = await fetch('/api/requests');
            if (!response.ok) throw new Error('فشل في جلب البيانات');
            allRequests = await response.json();

            const pendingRequests = allRequests.filter(r => r.status === 'pending');
            const approvedRequests = allRequests.filter(r => r.status === 'approved');

            renderPendingRequests(pendingRequests);
            renderArchive(approvedRequests);
        } catch (error) {
            pendingContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    }

    // دالة لرسم الطلبات المعلقة
    function renderPendingRequests(pending) {
        pendingContainer.innerHTML = '';
        if (pending.length === 0) {
            pendingContainer.appendChild(noPendingMsg);
            noPendingMsg.style.display = 'block';
        } else {
            noPendingMsg.style.display = 'none';
            pending.forEach(req => pendingContainer.appendChild(createReportCard(req, true)));
        }
    }

    // دالة لرسم الأرشيف
    function renderArchive(approved) {
        archiveAccordion.innerHTML = '';
        if (approved.length === 0) {
            archiveAccordion.appendChild(noArchiveMsg);
            noArchiveMsg.style.display = 'block';
        } else {
            noArchiveMsg.style.display = 'none';
            const groupedByPreacher = approved.reduce((acc, req) => {
                const key = req.preacherName || 'غير معروف';
                if (!acc[key]) acc[key] = [];
                acc[key].push(req);
                return acc;
            }, {});

            Object.keys(groupedByPreacher).forEach((preacherName, index) => {
                const accordionItem = createAccordionItem(preacherName, groupedByPreacher[preacherName], index);
                archiveAccordion.appendChild(accordionItem);
            });
        }
    }

    // دالة لإنشاء كرت تقرير (تستخدم للطلبات المعلقة وللعرض في النافذة)
    function createReportCard(req, isPending = false) {
        const card = document.createElement('div');
        card.className = isPending ? 'report-card shadow-sm' : '';
        
        let prayersHtml = req.prayers.map((prayer, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${prayer.date || 'غير محدد'}</td>
                <td>${prayer.mosqueAndNeighborhood || 'غير محدد'}</td>
            </tr>
        `).join('');

        card.innerHTML = `
            <div class="report-header">
                <h5>طلب مستحقات خطيب متعاون</h5>
                <h6>لفترة شهر: ${req.monthName || 'غير محدد'}</h6>
            </div>
            <div class="report-body">
                <table class="report-table mb-3">
                    <tr><th>الاسم</th><td colspan="2">${req.preacherName || 'غير محدد'}</td><th>من</th><td>${req.periodStart || 'غير محدد'}</td></tr>
                    <tr><th>الهوية الوطنية</th><td colspan="2">${req.nationalId || 'غير محدد'}</td><th>إلى</th><td>${req.periodEnd || 'غير محدد'}</td></tr>
                </table>
                <table class="report-table">
                    <thead><tr><th style="width: 10%;">م</th><th style="width: 30%;">التاريخ</th><th>اسم الجامع والحي</th></tr></thead>
                    <tbody>${prayersHtml || '<tr><td colspan="3">لا توجد صلوات مسجلة</td></tr>'}</tbody>
                </table>
            </div>
            ${isPending ? `<div class="card-footer bg-transparent border-0 text-center p-3"><button class="btn btn-success approve-btn" data-id="${req._id}">اعتماد وأرشفة الطلب</button></div>` : ''}
        `;
        return card;
    }

    // دالة لإنشاء عنصر في الأرشيف
    function createAccordionItem(preacherName, requests, index) {
        const item = document.createElement('div');
        item.className = 'accordion-item';
        const id = `preacher-${index}`;
        
        let reportsHtml = '<ul class="list-group list-group-flush">';
        requests.forEach(req => {
            reportsHtml += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <a href="#" class="archive-item-link" data-id="${req._id}">تقرير شهر: ${req.monthName || new Date(req.createdAt).toLocaleDateString('ar-SA', {month: 'long', year: 'numeric'})}</a>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${req._id}">حذف</button>
                </li>
            `;
        });
        reportsHtml += '</ul>';

        item.innerHTML = `
            <h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${id}">${preacherName} (${requests.length} تقارير)</button></h2>
            <div id="collapse-${id}" class="accordion-collapse collapse" data-bs-parent="#archive-accordion"><div class="accordion-body">${reportsHtml}</div></div>
        `;
        return item;
    }

    // === التعامل مع كل الأحداث ===
    document.body.addEventListener('click', async (e) => {
        e.preventDefault(); // منع السلوك الافتراضي للروابط

        // 1. زر الموافقة والأرشفة
        if (e.target.classList.contains('approve-btn')) {
            const btn = e.target;
            btn.disabled = true;
            btn.textContent = 'جاري الأرشفة...';
            await fetch(`/api/requests/${btn.dataset.id}/approve`, { method: 'PATCH' });
            fetchAndRenderAll();
        }

        // 2. زر الحذف (يفتح نافذة التأكيد)
        if (e.target.classList.contains('delete-btn')) {
            deleteTargetId = e.target.dataset.id;
            deleteConfirmModal.style.display = 'flex';
        }

        // 3. رابط عرض التقرير من الأرشيف
        if (e.target.classList.contains('archive-item-link')) {
            const report = allRequests.find(r => r._id === e.target.dataset.id);
            if (report) {
                reportModalContent.innerHTML = '';
                reportModalContent.appendChild(createReportCard(report, false));
                reportModal.style.display = 'flex';
            }
        }
    });

    // إغلاق نوافذ العرض
    reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) reportModal.style.display = 'none';
    });
    cancelDeleteBtn.addEventListener('click', () => {
        deleteConfirmModal.style.display = 'none';
        deleteTargetId = null;
    });

    // تأكيد الحذف
    confirmDeleteBtn.addEventListener('click', async () => {
        if (!deleteTargetId) return;
        const btn = confirmDeleteBtn;
        btn.disabled = true;
        btn.textContent = 'جاري الحذف...';
        await fetch(`/api/requests/${deleteTargetId}`, { method: 'DELETE' });
        deleteConfirmModal.style.display = 'none';
        deleteTargetId = null;
        btn.disabled = false;
        btn.textContent = 'نعم، قم بالحذف';
        fetchAndRenderAll();
    });

    // استيراد مكتبة Bootstrap JS
    const bootstrapScript = document.createElement('script');
    bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
    document.body.appendChild(bootstrapScript);
    
    fetchAndRenderAll();
});
