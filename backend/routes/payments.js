const express = require('express');
const router = express.Router();
const db = require('../config/db');

// SePay Webhook endpoint
// SePay calls this with POST request when money is received
router.post('/sepay-webhook', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Verify token/API Key if configured
    const apiKey = req.headers['x-sepay-api-key'] || req.headers['authorization'];
    const expectedApiKey = process.env.SEPAY_API_KEY || 'sepay_secret_token_123';
    
    if (process.env.SEPAY_API_KEY && apiKey !== expectedApiKey) {
      console.warn('SePay webhook unauthorized access attempt');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      gateway,
      transactionDate,
      accountNumber,
      transferType,
      transferAmount,
      content,
      id: sepayTransactionId
    } = req.body;

    console.log('SePay Webhook Received:', req.body);

    // SePay sends transferType 'in' or 'IN' for incoming transfers
    if (transferType && transferType.toLowerCase() !== 'in') {
      return res.json({ message: 'Ignore non-incoming transaction' });
    }

    // Parse booking ID from content (description). Expected format: "BK 12" or "BK_12" or "BK-12"
    const match = content ? content.match(/BK[_\-\s]*(\d+)/i) : null;
    if (!match) {
      console.log('No booking reference found in transaction content:', content);
      return res.status(400).json({ message: 'No booking reference found in transaction content' });
    }

    const bookingId = parseInt(match[1], 10);
    const [bookings] = await connection.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (bookings.length === 0) {
      console.log('Booking not found for ID:', bookingId);
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];
    if (booking.payment_status === 'paid') {
      console.log('Booking already paid:', bookingId);
      return res.json({ success: true, message: 'Booking already paid' });
    }

    // Verify amount matches or is higher
    if (parseFloat(transferAmount) < parseFloat(booking.total_price)) {
      console.log(`Amount mismatch. Expected: ${booking.total_price}, Received: ${transferAmount}`);
      return res.status(400).json({ message: 'Insufficient payment amount' });
    }

    const transactionId = sepayTransactionId || 'SP_' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // 1. Insert Payment log
    await connection.query(
      `INSERT INTO payments (booking_id, transaction_id, payment_method, amount, status) 
       VALUES (?, ?, ?, ?, 'success')`,
      [bookingId, transactionId, 'SEPAY', transferAmount]
    );

    // 2. Update booking status
    await connection.query(
      `UPDATE bookings SET payment_status = 'paid', status = 'confirmed' WHERE id = ?`,
      [bookingId]
    );

    await connection.commit();
    console.log(`Booking ${bookingId} successfully confirmed via SePay transaction ${transactionId}`);
    
    res.json({
      success: true,
      message: 'Booking paid and confirmed successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('SePay webhook error:', error);
    res.status(500).json({ message: 'Internal server error processing SePay webhook' });
  } finally {
    connection.release();
  }
});

module.exports = router;
