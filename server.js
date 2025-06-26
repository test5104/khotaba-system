require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const PrayerRequest = require('./models/PrayerRequest');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas.'))
  .catch(err => console.error('Could not connect to MongoDB Atlas. Error:', err));

// --- API Routes ---

// GET all requests
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await PrayerRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// POST a new request
app.post('/api/requests', async (req, res) => {
    try {
        const newRequest = new PrayerRequest(req.body);
        await newRequest.save();
        res.status(201).json({ message: 'Request submitted successfully!', data: newRequest });
    } catch (error) {
        res.status(400).json({ message: 'Error submitting request' });
    }
});

// PATCH to approve a request
app.patch('/api/requests/:id/approve', async (req, res) => {
  try {
    const request = await PrayerRequest.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.status(200).json({ message: 'Request approved successfully!', data: request });
  } catch (error) {
    res.status(500).json({ message: 'Error approving request' });
  }
});

// DELETE a request (الوظيفة التي كانت ناقصة)
app.delete('/api/requests/:id', async (req, res) => {
    try {
        const request = await PrayerRequest.findByIdAndDelete(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json({ message: 'Request deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting request' });
    }
});


// Catch-all Route for any other request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
