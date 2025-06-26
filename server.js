// --- استدعاء المكتبات الأساسية ---
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// --- استيراد نموذج قاعدة البيانات ---
const PrayerRequest = require('./models/PrayerRequest');

// --- تهيئة تطبيق Express ---
const app = express();

// --- Middlewares (برمجيات وسيطة) ---
// يجب أن تأتي هذه في البداية
app.use(cors());
app.use(express.json());

// --- تقديم الملفات الثابتة (HTML, CSS, JS) ---
// هذا السطر يخبر الخادم بأن يبحث عن الملفات في مجلد "public"
app.use(express.static(path.join(__dirname, 'public')));

// --- الاتصال بقاعدة البيانات ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas.'))
  .catch(err => console.error('Could not connect to MongoDB Atlas. Error:', err));

// --- API Routes (مسارات الواجهة البرمجية) ---
// يجب أن تأتي هذه المسارات قبل المسار الاحتياطي

// 1. مسار لإضافة طلب جديد
app.post('/api/requests', async (req, res) => {
  try {
    const { preacherName, prayers, eidPrayer } = req.body;
    const newRequest = new PrayerRequest({ preacherName, prayers, eidPrayer });
    await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully!', data: newRequest });
  } catch (error) {
    res.status(400).json({ message: 'Error submitting request' });
  }
});

// 2. مسار لجلب جميع الطلبات
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await PrayerRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// 3. مسار للموافقة على طلب
app.patch('/api/requests/:id/approve', async (req, res) => {
  try {
    const request = await PrayerRequest.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    res.status(200).json({ message: 'Request approved successfully!', data: request });
  } catch (error) {
    res.status(500).json({ message: 'Error approving request' });
  }
});

// --- Catch-all Route (المسار الاحتياطي) ---
// هذا هو أهم سطر لحل المشكلة. يجب أن يكون آخر مسار قبل تشغيل الخادم.
// هو يضمن أن أي طلب لا يطابق المسارات أعلاه سيتم إرسال صفحة index.html له.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- تشغيل الخادم ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});