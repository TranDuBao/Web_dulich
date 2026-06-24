const db = require('../config/db');

const getTours = async (req, res) => {
  try {
    const { destination, duration, maxPrice, rating, search } = req.query;
    let query = 'SELECT * FROM tours WHERE 1=1';
    let params = [];

    if (search) {
      query += ' AND (title LIKE ? OR destination LIKE ? OR description LIKE ?)';
      const searchWildcard = `%${search}%`;
      params.push(searchWildcard, searchWildcard, searchWildcard);
    }

    if (destination) {
      query += ' AND destination LIKE ?';
      params.push(`%${destination}%`);
    }

    if (duration) {
      if (duration === 'short') { // 1-3 days
        query += ' AND duration_days <= 3';
      } else if (duration === 'medium') { // 4-7 days
        query += ' AND duration_days BETWEEN 4 AND 7';
      } else if (duration === 'long') { // > 7 days
        query += ' AND duration_days > 7';
      }
    }

    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (rating) {
      query += ' AND rating >= ?';
      params.push(parseFloat(rating));
    }

    query += ' ORDER BY rating DESC';

    const [tours] = await db.query(query, params);
    res.json(tours);
  } catch (error) {
    console.error('getTours error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách tour' });
  }
};

const getTourById = async (req, res) => {
  try {
    const { id } = req.params;
    const [tours] = await db.query('SELECT * FROM tours WHERE id = ?', [id]);
    if (tours.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tour này' });
    }

    // Get reviews for this tour
    const [reviews] = await db.query(
      `SELECT r.*, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.entity_type = 'tour' AND r.entity_id = ? 
       ORDER BY r.created_at DESC`,
      [id]
    );

    const tour = tours[0];
    tour.reviews = reviews;

    res.json(tour);
  } catch (error) {
    console.error('getTourById error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết tour' });
  }
};

const createTour = async (req, res) => {
  try {
    const { title, description, destination, duration_days, duration_nights, price, image_url, start_date, max_participants, highlights, itinerary_preview } = req.body;
    if (!title || !destination || !price) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tiêu đề, điểm đến và giá tour' });
    }

    const [result] = await db.query(
      `INSERT INTO tours (title, description, destination, duration_days, duration_nights, price, image_url, start_date, max_participants, rating, highlights, itinerary_preview) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, ?, ?)`,
      [
        title,
        description || '',
        destination,
        duration_days || 1,
        duration_nights || 0,
        price,
        image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
        start_date || null,
        max_participants || 20,
        highlights || '',
        itinerary_preview || ''
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Đã tạo tour thành công' });
  } catch (error) {
    console.error('createTour error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi tạo tour' });
  }
};

const updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, destination, duration_days, duration_nights, price, image_url, start_date, max_participants, highlights, itinerary_preview } = req.body;

    const [existing] = await db.query('SELECT * FROM tours WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tour này để cập nhật' });
    }

    await db.query(
      `UPDATE tours SET 
        title = ?, description = ?, destination = ?, duration_days = ?, duration_nights = ?, 
        price = ?, image_url = ?, start_date = ?, max_participants = ?, highlights = ?, itinerary_preview = ? 
       WHERE id = ?`,
      [
        title || existing[0].title,
        description !== undefined ? description : existing[0].description,
        destination || existing[0].destination,
        duration_days || existing[0].duration_days,
        duration_nights !== undefined ? duration_nights : existing[0].duration_nights,
        price || existing[0].price,
        image_url !== undefined ? (image_url.trim() === '' ? 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80' : image_url) : existing[0].image_url,
        start_date !== undefined ? start_date : existing[0].start_date,
        max_participants || existing[0].max_participants,
        highlights !== undefined ? highlights : existing[0].highlights,
        itinerary_preview !== undefined ? itinerary_preview : existing[0].itinerary_preview,
        id
      ]
    );

    res.json({ message: 'Đã cập nhật tour thành công' });
  } catch (error) {
    console.error('updateTour error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật tour' });
  }
};

const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT * FROM tours WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tour này để xóa' });
    }

    await db.query('DELETE FROM tours WHERE id = ?', [id]);
    res.json({ message: 'Đã xóa tour thành công' });
  } catch (error) {
    console.error('deleteTour error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi xóa tour' });
  }
};

module.exports = {
  getTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour
};
