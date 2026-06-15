const db = require('../config/db');

const getItineraries = async (req, res) => {
  try {
    const userId = req.user.id;
    const [itineraries] = await db.query(
      'SELECT id, user_id, title, destination, start_date, end_date, created_at FROM itineraries WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(itineraries);
  } catch (error) {
    console.error('getItineraries error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách lịch trình' });
  }
};

const getItineraryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const [itineraries] = await db.query('SELECT * FROM itineraries WHERE id = ?', [id]);
    
    if (itineraries.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch trình này' });
    }

    const itinerary = itineraries[0];
    if (itinerary.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Quyền truy cập lịch trình bị từ chối' });
    }

    res.json(itinerary);
  } catch (error) {
    console.error('getItineraryById error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết lịch trình' });
  }
};

const createItinerary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, destination, start_date, end_date, content } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Vui lòng nhập tên lịch trình' });
    }

    const [result] = await db.query(
      'INSERT INTO itineraries (user_id, title, destination, start_date, end_date, content) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        title,
        destination || '',
        start_date || null,
        end_date || null,
        JSON.stringify(content || [])
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Tạo lịch trình thành công' });
  } catch (error) {
    console.error('createItinerary error:', error);
    res.status(500).json({ message: 'Lỗi khi tạo lịch trình' });
  }
};

const updateItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, destination, start_date, end_date, content } = req.body;

    const [existing] = await db.query('SELECT * FROM itineraries WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch trình cần cập nhật' });
    }

    if (existing[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa lịch trình này' });
    }

    await db.query(
      'UPDATE itineraries SET title = ?, destination = ?, start_date = ?, end_date = ?, content = ? WHERE id = ?',
      [
        title || existing[0].title,
        destination !== undefined ? destination : existing[0].destination,
        start_date !== undefined ? start_date : existing[0].start_date,
        end_date !== undefined ? end_date : existing[0].end_date,
        content ? JSON.stringify(content) : JSON.stringify(existing[0].content || []),
        id
      ]
    );

    res.json({ message: 'Cập nhật lịch trình thành công' });
  } catch (error) {
    console.error('updateItinerary error:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật lịch trình' });
  }
};

const deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [existing] = await db.query('SELECT * FROM itineraries WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch trình để xóa' });
    }

    if (existing[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa lịch trình này' });
    }

    await db.query('DELETE FROM itineraries WHERE id = ?', [id]);
    res.json({ message: 'Xóa lịch trình thành công' });
  } catch (error) {
    console.error('deleteItinerary error:', error);
    res.status(500).json({ message: 'Lỗi khi xóa lịch trình' });
  }
};

module.exports = {
  getItineraries,
  getItineraryById,
  createItinerary,
  updateItinerary,
  deleteItinerary
};
