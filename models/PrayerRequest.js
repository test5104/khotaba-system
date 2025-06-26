const mongoose = require('mongoose');

// تعريف شكل بيانات الصلاة الواحدة
const prayerSchema = new mongoose.Schema({
  mosqueAndNeighborhood: { 
    type: String 
  },
  date: { 
    type: String
  }
});

// تعريف شكل بيانات الطلب الكامل مع إضافة حقل الشهر
const prayerRequestSchema = new mongoose.Schema({
  preacherName: {
    type: String
  },
  nationalId: {
    type: String
  },
  // ====> هذا هو الحقل المهم الذي أضفناه <====
  monthName: { 
    type: String
  },
  periodStart: {
    type: String
  },
  periodEnd: {
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