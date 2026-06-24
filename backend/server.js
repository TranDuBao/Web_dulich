const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploads static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Base64 upload endpoint
app.post('/api/upload', (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'Không có dữ liệu ảnh!' });
    }
    
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Định dạng ảnh không hợp lệ!' });
    }
    
    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    
    let extension = 'png';
    if (type.includes('jpeg') || type.includes('jpg')) {
      extension = 'jpg';
    } else if (type.includes('webp')) {
      extension = 'webp';
    } else if (type.includes('gif')) {
      extension = 'gif';
    }
    
    const filename = `upload_${Date.now()}_${Math.round(Math.random() * 1E9)}.${extension}`;
    const uploadPath = path.join(__dirname, 'uploads', filename);
    
    if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
      fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
    }
    
    fs.writeFileSync(uploadPath, buffer);
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Lỗi khi lưu ảnh lên máy chủ!' });
  }
});

// Root API welcome/healthcheck
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Travel Portal API Gateway!' });
});

// Register routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tours', require('./routes/tours'));
app.use('/api/suppliers', require('./routes/hotelFlights'));
app.use('/api/itineraries', require('./routes/itineraries'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/partners', require('./routes/partners'));
app.use('/api/payments', require('./routes/payments'));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ không mong muốn!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
