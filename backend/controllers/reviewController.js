const db = require('../config/db');

const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { entityType, entityId, rating, comment } = req.body;

    if (!entityType || !entityId || !rating) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin: loại dịch vụ, ID dịch vụ và số sao đánh giá' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Số sao đánh giá phải từ 1 đến 5' });
    }

    // Insert review
    await db.query(
      'INSERT INTO reviews (user_id, entity_type, entity_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [userId, entityType, entityId, rating, comment || '']
    );

    // Update entity average rating dynamically
    if (entityType === 'tour') {
      const [ratings] = await db.query(
        'SELECT AVG(rating) as avg_rating FROM reviews WHERE entity_type = "tour" AND entity_id = ?',
        [entityId]
      );
      if (ratings.length > 0 && ratings[0].avg_rating !== null) {
        await db.query('UPDATE tours SET rating = ? WHERE id = ?', [ratings[0].avg_rating, entityId]);
      }
    }

    res.status(201).json({ message: 'Đăng đánh giá thành công!' });
  } catch (error) {
    console.error('addReview error:', error);
    res.status(500).json({ message: 'Lỗi khi đăng đánh giá' });
  }
};

module.exports = { addReview };
