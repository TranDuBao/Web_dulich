const db = require('../config/db');

const createBooking = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction(); // Start transactional booking orchestration

    const userId = req.user.id;
    const { type, referenceId, totalPrice, guestDetails } = req.body;

    if (!type || !referenceId || !totalPrice) {
      return res.status(400).json({ message: 'Vui lòng cung cấp loại dịch vụ, ID tham chiếu và tổng giá tiền' });
    }

    // Step 1: Inventory & availability check
    if (type === 'tour') {
      const [tours] = await connection.query(
        `SELECT max_participants, 
         (SELECT COUNT(*) FROM bookings WHERE type="tour" AND reference_id = ? AND status="confirmed") as active_bookings 
         FROM tours WHERE id = ?`, 
        [referenceId, referenceId]
      );
      if (tours.length === 0) {
        throw new Error('Tour không tồn tại');
      }
      const tour = tours[0];
      if (tour.active_bookings >= tour.max_participants) {
        return res.status(400).json({ message: 'Hết chỗ trống! Tour đã đầy người tham gia.' });
      }
    } else if (type === 'hotel') {
      const [hotels] = await connection.query('SELECT name FROM hotels WHERE id = ?', [referenceId]);
      if (hotels.length === 0) {
        throw new Error('Khách sạn không tồn tại');
      }
    } else if (type === 'flight') {
      const [flights] = await connection.query('SELECT flight_number FROM flights WHERE id = ?', [referenceId]);
      if (flights.length === 0) {
        throw new Error('Chuyến bay không tồn tại');
      }
    }

    // Step 2: Book orchestration
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (user_id, type, reference_id, total_price, payment_status, status, guest_details) 
       VALUES (?, ?, ?, ?, 'unpaid', 'pending', ?)`,
      [userId, type, referenceId, totalPrice, JSON.stringify(guestDetails || {})]
    );

    const bookingId = bookingResult.insertId;

    await connection.commit(); // Commit booking creation
    res.status(201).json({
      bookingId,
      message: 'Đặt chỗ thành công! Đang chờ thanh toán.',
      status: 'pending'
    });
  } catch (error) {
    await connection.rollback(); // Rollback transaction on failure (compensation pattern)
    console.error('createBooking error:', error.message);
    res.status(500).json({ message: error.message || 'Lỗi khi đặt chỗ dịch vụ' });
  } finally {
    connection.release();
  }
};

const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const [bookings] = await db.query(
      `SELECT b.*, 
        CASE 
          WHEN b.type = 'tour' THEN t.title 
          WHEN b.type = 'hotel' THEN h.name 
          WHEN b.type = 'flight' THEN CONCAT(f.airline, ' (', f.flight_number, ')')
        END as service_name,
        CASE 
          WHEN b.type = 'tour' THEN t.image_url 
          WHEN b.type = 'hotel' THEN h.image_url 
          WHEN b.type = 'flight' THEN 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80'
        END as service_image
      FROM bookings b
      LEFT JOIN tours t ON b.type = 'tour' AND b.reference_id = t.id
      LEFT JOIN hotels h ON b.type = 'hotel' AND b.reference_id = h.id
      LEFT JOIN flights f ON b.type = 'flight' AND b.reference_id = f.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC`,
      [userId]
    );
    res.json(bookings);
  } catch (error) {
    console.error('getMyBookings error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy lịch sử đặt chỗ' });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [bookings] = await db.query(
      `SELECT b.*, 
        CASE 
          WHEN b.type = 'tour' THEN t.title 
          WHEN b.type = 'hotel' THEN h.name 
          WHEN b.type = 'flight' THEN CONCAT(f.airline, ' (', f.flight_number, ')')
        END as service_name,
        CASE 
          WHEN b.type = 'tour' THEN t.destination 
          WHEN b.type = 'hotel' THEN h.location 
          WHEN b.type = 'flight' THEN CONCAT(f.departure_airport, ' -> ', f.arrival_airport)
        END as service_location
      FROM bookings b
      LEFT JOIN tours t ON b.type = 'tour' AND b.reference_id = t.id
      LEFT JOIN hotels h ON b.type = 'hotel' AND b.reference_id = h.id
      LEFT JOIN flights f ON b.type = 'flight' AND b.reference_id = f.id
      WHERE b.id = ?`,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin đặt chỗ' });
    }

    const booking = bookings[0];
    if (booking.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập thông tin này' });
    }

    res.json(booking);
  } catch (error) {
    console.error('getBookingById error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết đặt chỗ' });
  }
};

const processPayment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { bookingId, paymentMethod } = req.body;
    const userId = req.user.id;

    const [bookings] = await connection.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đặt chỗ để thanh toán' });
    }

    const booking = bookings[0];
    if (booking.user_id !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền thanh toán cho đặt chỗ này' });
    }

    if (booking.payment_status === 'paid') {
      return res.status(400).json({ message: 'Đặt chỗ này đã được thanh toán' });
    }

    const transactionId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // 1. Insert Payment log
    await connection.query(
      `INSERT INTO payments (booking_id, transaction_id, payment_method, amount, status) 
       VALUES (?, ?, ?, ?, 'success')`,
      [bookingId, transactionId, paymentMethod || 'VNPAY', booking.total_price]
    );

    // 2. Update booking status
    await connection.query(
      `UPDATE bookings SET payment_status = 'paid', status = 'confirmed' WHERE id = ?`,
      [bookingId]
    );

    await connection.commit();
    res.json({
      message: 'Thanh toán thành công qua cổng thanh toán!',
      transactionId,
      status: 'confirmed',
      payment_status: 'paid'
    });
  } catch (error) {
    await connection.rollback();
    console.error('processPayment error:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý thanh toán' });
  } finally {
    connection.release();
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [bookings] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin đặt chỗ' });
    }

    const booking = bookings[0];
    if (booking.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền hủy đặt chỗ này' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Đặt chỗ này đã được hủy trước đó' });
    }

    let paymentStatus = booking.payment_status;
    if (booking.payment_status === 'paid') {
      paymentStatus = 'refunded';
    }

    await db.query(
      `UPDATE bookings SET status = 'cancelled', payment_status = ? WHERE id = ?`,
      [paymentStatus, id]
    );

    res.json({
      message: 'Hủy đặt chỗ thành công. Tiền hoàn trả sẽ được xử lý trong 3-5 ngày làm việc nếu đã thanh toán.',
      status: 'cancelled',
      payment_status: paymentStatus
    });
  } catch (error) {
    console.error('cancelBooking error:', error);
    res.status(500).json({ message: 'Lỗi khi hủy đặt chỗ' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  processPayment,
  cancelBooking
};
