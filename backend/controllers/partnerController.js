const db = require('../config/db');

// --- HOTEL CRUD ---

const getPartnerHotels = async (req, res) => {
  try {
    let query = 'SELECT h.*, u.name as owner_name FROM hotels h LEFT JOIN users u ON h.owner_id = u.id';
    let params = [];

    // If hotel owner, only fetch their own hotels
    if (req.user.role === 'hotel_owner') {
      query += ' WHERE h.owner_id = ?';
      params.push(req.user.id);
    }

    const [hotels] = await db.query(query, params);
    res.json(hotels);
  } catch (error) {
    console.error('getPartnerHotels error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách khách sạn' });
  }
};

const createPartnerHotel = async (req, res) => {
  try {
    const { name, location, price_per_night, star_rating, image_url, description, lat, lng, owner_id } = req.body;
    if (!name || !location || !price_per_night) {
      return res.status(400).json({ message: 'Vui lòng điền tên khách sạn, địa chỉ và giá phòng cơ bản' });
    }

    // Set owner_id based on role
    let finalOwnerId = req.user.id;
    if (req.user.role === 'admin' && owner_id) {
      finalOwnerId = owner_id;
    }

    const [result] = await db.query(
      `INSERT INTO hotels (name, location, price_per_night, star_rating, image_url, description, lat, lng, owner_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        location,
        price_per_night,
        star_rating || 3,
        image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        description || '',
        lat || 10.0,
        lng || 100.0,
        finalOwnerId
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Đăng ký khách sạn thành công!' });
  } catch (error) {
    console.error('createPartnerHotel error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi tạo khách sạn mới' });
  }
};

const updatePartnerHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, price_per_night, star_rating, image_url, description, lat, lng, owner_id } = req.body;

    const [existing] = await db.query('SELECT * FROM hotels WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }

    // Check ownership
    if (req.user.role === 'hotel_owner' && existing[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa khách sạn này' });
    }

    let finalOwnerId = existing[0].owner_id;
    if (req.user.role === 'admin') {
      finalOwnerId = owner_id !== undefined ? owner_id : existing[0].owner_id;
    }

    await db.query(
      `UPDATE hotels SET 
        name = ?, location = ?, price_per_night = ?, star_rating = ?, 
        image_url = ?, description = ?, lat = ?, lng = ?, owner_id = ? 
       WHERE id = ?`,
      [
        name || existing[0].name,
        location || existing[0].location,
        price_per_night !== undefined ? price_per_night : existing[0].price_per_night,
        star_rating !== undefined ? star_rating : existing[0].star_rating,
        image_url !== undefined ? image_url : existing[0].image_url,
        description !== undefined ? description : existing[0].description,
        lat !== undefined ? lat : existing[0].lat,
        lng !== undefined ? lng : existing[0].lng,
        finalOwnerId,
        id
      ]
    );

    res.json({ message: 'Cập nhật thông tin khách sạn thành công' });
  } catch (error) {
    console.error('updatePartnerHotel error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi cập nhật thông tin khách sạn' });
  }
};

const deletePartnerHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM hotels WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }

    // Check ownership
    if (req.user.role === 'hotel_owner' && existing[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa khách sạn này' });
    }

    await db.query('DELETE FROM hotels WHERE id = ?', [id]);
    res.json({ message: 'Đã xóa khách sạn thành công' });
  } catch (error) {
    console.error('deletePartnerHotel error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi xóa khách sạn' });
  }
};


// --- ROOM CRUD ---

const getHotelRooms = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    // Verify owner has access to this hotel if they are hotel_owner
    if (req.user.role === 'hotel_owner') {
      const [hotel] = await db.query('SELECT * FROM hotels WHERE id = ? AND owner_id = ?', [hotelId, req.user.id]);
      if (hotel.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền truy cập khách sạn này' });
      }
    }

    const [rooms] = await db.query('SELECT * FROM rooms WHERE hotel_id = ?', [hotelId]);
    res.json(rooms);
  } catch (error) {
    console.error('getHotelRooms error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách phòng' });
  }
};

const createRoom = async (req, res) => {
  try {
    const { hotel_id, room_type, price_per_night, max_occupancy, image_url, description, total_rooms } = req.body;
    if (!hotel_id || !room_type || !price_per_night) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mã khách sạn, loại phòng và giá bán' });
    }

    // Check hotel ownership
    if (req.user.role === 'hotel_owner') {
      const [hotel] = await db.query('SELECT * FROM hotels WHERE id = ? AND owner_id = ?', [hotel_id, req.user.id]);
      if (hotel.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền thêm phòng vào khách sạn này' });
      }
    }

    const [result] = await db.query(
      `INSERT INTO rooms (hotel_id, room_type, price_per_night, max_occupancy, image_url, description, total_rooms) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        hotel_id,
        room_type,
        price_per_night,
        max_occupancy || 2,
        image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        description || '',
        total_rooms || 5
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Thêm phòng thành công!' });
  } catch (error) {
    console.error('createRoom error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi thêm phòng mới' });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_type, price_per_night, max_occupancy, image_url, description, total_rooms } = req.body;

    const [existing] = await db.query('SELECT * FROM rooms WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phòng cần sửa' });
    }

    // Check hotel ownership
    if (req.user.role === 'hotel_owner') {
      const [hotel] = await db.query('SELECT * FROM hotels WHERE id = ? AND owner_id = ?', [existing[0].hotel_id, req.user.id]);
      if (hotel.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa phòng của khách sạn này' });
      }
    }

    await db.query(
      `UPDATE rooms SET 
        room_type = ?, price_per_night = ?, max_occupancy = ?, 
        image_url = ?, description = ?, total_rooms = ? 
       WHERE id = ?`,
      [
        room_type || existing[0].room_type,
        price_per_night !== undefined ? price_per_night : existing[0].price_per_night,
        max_occupancy !== undefined ? max_occupancy : existing[0].max_occupancy,
        image_url !== undefined ? image_url : existing[0].image_url,
        description !== undefined ? description : existing[0].description,
        total_rooms !== undefined ? total_rooms : existing[0].total_rooms,
        id
      ]
    );

    res.json({ message: 'Cập nhật thông tin phòng thành công' });
  } catch (error) {
    console.error('updateRoom error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi cập nhật phòng' });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM rooms WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phòng cần xóa' });
    }

    // Check hotel ownership
    if (req.user.role === 'hotel_owner') {
      const [hotel] = await db.query('SELECT * FROM hotels WHERE id = ? AND owner_id = ?', [existing[0].hotel_id, req.user.id]);
      if (hotel.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa phòng của khách sạn này' });
      }
    }

    await db.query('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ message: 'Đã xóa phòng thành công' });
  } catch (error) {
    console.error('deleteRoom error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi xóa phòng' });
  }
};


// --- BOOKING OPERATIONS ---

const getPartnerBookings = async (req, res) => {
  try {
    let query = `
      SELECT b.*, h.name as hotel_name, u.name as user_name, u.email as user_email 
      FROM bookings b 
      JOIN hotels h ON b.reference_id = h.id AND b.type = 'hotel'
      JOIN users u ON b.user_id = u.id
    `;
    let params = [];

    // Filter by ownership
    if (req.user.role === 'hotel_owner') {
      query += ' WHERE h.owner_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY b.id DESC';

    const [bookings] = await db.query(query, params);
    res.json(bookings);
  } catch (error) {
    console.error('getPartnerBookings error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách đặt phòng' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const [existing] = await db.query('SELECT * FROM bookings WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn đặt chỗ này' });
    }

    // Verify ownership (only for hotel bookings if partner is hotel_owner)
    if (req.user.role === 'hotel_owner') {
      if (existing[0].type !== 'hotel') {
        return res.status(403).json({ message: 'Bạn không có quyền quản lý hóa đơn này' });
      }
      const [hotel] = await db.query('SELECT * FROM hotels WHERE id = ? AND owner_id = ?', [existing[0].reference_id, req.user.id]);
      if (hotel.length === 0) {
        return res.status(403).json({ message: 'Bạn không có quyền quản lý hóa đơn của khách sạn này' });
      }
    }

    let updateFields = [];
    let params = [];

    if (status) {
      updateFields.push('status = ?');
      params.push(status);
    }

    if (payment_status) {
      updateFields.push('payment_status = ?');
      params.push(payment_status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Không có thông tin thay đổi' });
    }

    params.push(id);

    await db.query(`UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`, params);

    res.json({ message: 'Cập nhật trạng thái đặt phòng thành công!' });
  } catch (error) {
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi cập nhật trạng thái đặt phòng' });
  }
};


// --- STATISTICS ---

const getPartnerStatistics = async (req, res) => {
  try {
    let hotelFilterSql = '';
    let hotelParams = [];

    if (req.user.role === 'hotel_owner') {
      hotelFilterSql = ' WHERE owner_id = ?';
      hotelParams.push(req.user.id);
    }

    // 1. Total hotels
    const [[{ totalHotels }]] = await db.query(`SELECT COUNT(*) as totalHotels FROM hotels ${hotelFilterSql}`, hotelParams);

    // 2. Total rooms
    let totalRoomsQuery = `SELECT COUNT(*) as totalRooms FROM rooms`;
    if (req.user.role === 'hotel_owner') {
      totalRoomsQuery = `SELECT COUNT(r.id) as totalRooms FROM rooms r JOIN hotels h ON r.hotel_id = h.id WHERE h.owner_id = ?`;
    }
    const [[{ totalRooms }]] = await db.query(totalRoomsQuery, hotelParams);

    // 3. Booking Stats
    let bookingsQuery = `
      SELECT 
        COUNT(*) as totalBookings,
        SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) as confirmedBookings,
        SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) as pendingBookings,
        SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) as cancelledBookings,
        SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END) as totalRevenue
      FROM bookings b
    `;
    let bookingParams = [];
    if (req.user.role === 'hotel_owner') {
      bookingsQuery = `
        SELECT 
          COUNT(b.id) as totalBookings,
          SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) as confirmedBookings,
          SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) as pendingBookings,
          SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) as cancelledBookings,
          SUM(CASE WHEN b.status = 'confirmed' THEN b.total_price ELSE 0 END) as totalRevenue
        FROM bookings b
        JOIN hotels h ON b.reference_id = h.id AND b.type = 'hotel'
        WHERE h.owner_id = ?
      `;
      bookingParams.push(req.user.id);
    }
    const [bookingStats] = await db.query(bookingsQuery, bookingParams);
    const stats = bookingStats[0] || { totalBookings: 0, confirmedBookings: 0, pendingBookings: 0, cancelledBookings: 0, totalRevenue: 0 };

    // 4. Monthly chart data (last 6 months)
    let monthlyQuery = `
      SELECT 
        DATE_FORMAT(b.booking_date, '%Y-%m') as month,
        SUM(b.total_price) as revenue,
        COUNT(b.id) as bookingsCount
      FROM bookings b
      WHERE b.status = 'confirmed'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `;
    let monthlyParams = [];
    if (req.user.role === 'hotel_owner') {
      monthlyQuery = `
        SELECT 
          DATE_FORMAT(b.booking_date, '%Y-%m') as month,
          SUM(b.total_price) as revenue,
          COUNT(b.id) as bookingsCount
        FROM bookings b
        JOIN hotels h ON b.reference_id = h.id AND b.type = 'hotel'
        WHERE h.owner_id = ? AND b.status = 'confirmed'
        GROUP BY month
        ORDER BY month DESC
        LIMIT 6
      `;
      monthlyParams.push(req.user.id);
    }
    const [monthlyData] = await db.query(monthlyQuery, monthlyParams);

    res.json({
      hotelsCount: totalHotels,
      roomsCount: totalRooms,
      bookingsCount: stats.totalBookings || 0,
      confirmedCount: stats.confirmedBookings || 0,
      pendingCount: stats.pendingBookings || 0,
      cancelledCount: stats.cancelledBookings || 0,
      totalRevenue: parseFloat(stats.totalRevenue || 0),
      monthlyData: monthlyData.reverse()
    });
  } catch (error) {
    console.error('getPartnerStatistics error:', error);
    res.status(500).json({ message: 'Lỗi hệ thống khi tính toán thống kê' });
  }
};

module.exports = {
  getPartnerHotels,
  createPartnerHotel,
  updatePartnerHotel,
  deletePartnerHotel,
  getHotelRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getPartnerBookings,
  updateBookingStatus,
  getPartnerStatistics
};
