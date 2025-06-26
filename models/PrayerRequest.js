const mongoose = require('mongoose');

// تعريف شكل بيانات الصلاة الواحدة
const prayerSchema = new mongoose.Schema({
  // تم تغيير الاسم ليكون أوضح
  mosqueAndNeighborhood: { 
    type: String 
  },
  // سيتم تخزين التاريخ كنص لاستيعاب التنسيق الهجري
  date: { 
    type: String
  }
});

// تعريف شكل بيانات الطلب الكامل مع الحقول الجديدة
const prayerRequestSchema = new mongoose.Schema({
  preacherName: {
    type: String
  },
  nationalId: { // حقل الهوية الوطنية الجديد
    type: String
  },
  periodStart: { // حقل بداية الفترة الجديد
    type: String
  },
  periodEnd: { // حقل نهاية الفترة الجديد
    type: String
  },
  prayers: [prayerSchema],
  eidPrayer: {
    mosqueAndNeighborhood: String,
    date: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PrayerRequest', prayerRequestSchema);
