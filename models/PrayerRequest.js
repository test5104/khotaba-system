const mongoose = require('mongoose');

// تعريف شكل بيانات الصلاة الواحدة
const prayerSchema = new mongoose.Schema({
  mosque: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  }
});

// تعريف شكل بيانات الطلب الكامل
const prayerRequestSchema = new mongoose.Schema({
  preacherName: {
    type: String,
    required: true
  },
  prayers: [prayerSchema], // مصفوفة من الصلوات
  eidPrayer: {
    mosque: String,
    date: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved'], // القيم المسموح بها فقط
    default: 'pending' // القيمة الافتراضية
  },
  createdAt: {
    type: Date,
    default: Date.now // تاريخ إنشاء الطلب تلقائياً
  }
});

module.exports = mongoose.model('PrayerRequest', prayerRequestSchema);