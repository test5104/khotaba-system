require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// استيراد نموذج قاعدة البيانات
const PrayerRequest = require('./models/PrayerRequest');

// تهيئة تطبيق Express
const app = express();

// --- Middlewares (برمجيات وسيطة) ---
app.use(cors()); // للسماح بالاتصالات من مصادر مختلفة
app.use(express.json()); // لتحليل الطلبات بصيغة JSON

// --- تقديم الملفات الثابتة ---
// هذا السطر يخبر الخادم بأن أي ملفات (HTML, CSS, JS) موجودة في مجلد "public" يجب تقديمها للمستخدم
app.use(express.static(path.join(__dirname, 'public')));

// --- الاتصال بقاعدة البيانات ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas.'))
  .catch(err => console.error('Could not connect to MongoDB Atlas. Error:', err));

// --- API Routes (مسارات الواجهة البرمجية) ---

// 1. مسار لإضافة طلب جديد
app.post('/api/requests', async (req, res) => {
  try {
    const { preacherName, prayers, eidPrayer } = req.body;
    const newRequest = new PrayerRequest({
      preacherName,
      prayers,
      eidPrayer
    });
    await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully!', data: newRequest });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(400).json({ message: 'Error submitting request', error: error.message });
  }
});

// 2. مسار لجلب جميع الطلبات (للإدارة)
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await PrayerRequest.find().sort({ createdAt: -1 }); // الأحدث أولاً
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

// 3. مسار للموافقة على طلب
app.patch('/api/requests/:id/approve', async (req, res) => {
  try {
    const request = await PrayerRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true } // لإرجاع المستند بعد التحديث
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json({ message: 'Request approved successfully!', data: request });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Error approving request', error: error.message });
  }
});


// --- Catch-all Route (مسار احتياطي) ---
// هذا المسار مهم. إذا لم يتطابق الطلب مع أي من المسارات أعلاه (لا هو ملف ثابت ولا هو مسار API)
// فسيقوم بإرسال صفحة index.html الرئيسية. هذا يحل مشكلة "Cannot GET /" بشكل نهائي.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// --- تشغيل الخادم ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
