const db = require('../config/db');

// In-memory simple cache for dynamic pricing calculations
const pricingCache = new Map();

// Helper to check high season
const isHighSeason = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const month = date.getMonth(); // 0-indexed: 5 = June, 6 = July, 7 = August, 11 = December
  return [5, 6, 7, 11].includes(month);
};

// Pricing engine that dynamically computes prices based on booking urgency & seasonal demand
const calculateDynamicPrice = (basePrice, dateStr, demandFactor = 1.0) => {
  const cacheKey = `${basePrice}_${dateStr}_${demandFactor}`;
  if (pricingCache.has(cacheKey)) {
    return pricingCache.get(cacheKey);
  }

  let finalPrice = parseFloat(basePrice);
  const dateObj = dateStr ? new Date(dateStr) : new Date();
  const today = new Date();
  
  // Calculate difference in days
  const timeDiff = dateObj.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Dynamic Rule 1: Urgency Booking (within 3 days increases price by 25%)
  if (daysDiff >= 0 && daysDiff <= 3) {
    finalPrice *= 1.25;
  } else if (daysDiff > 3 && daysDiff <= 7) {
    // Within 7 days increases price by 10%
    finalPrice *= 1.10;
  }

  // Dynamic Rule 2: High season (summer or holiday seasons increase price by 20%)
  if (isHighSeason(dateStr)) {
    finalPrice *= 1.20;
  }

  // Dynamic Rule 3: Custom supplier demand factor
  finalPrice *= demandFactor;

  // Round to nearest 1000 VND
  finalPrice = Math.round(finalPrice / 1000) * 1000;

  // Cache results
  pricingCache.set(cacheKey, finalPrice);
  
  // Cache invalidation routine: Clear cache when size > 1000 items
  if (pricingCache.size > 1000) {
    pricingCache.clear();
  }

  return finalPrice;
};

const getHotels = async (req, res) => {
  try {
    const { location, stars, maxPrice, checkInDate } = req.query;
    let query = 'SELECT * FROM hotels WHERE 1=1';
    let params = [];

    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    if (stars) {
      query += ' AND star_rating >= ?';
      params.push(parseInt(stars));
    }

    if (maxPrice) {
      query += ' AND price_per_night <= ?';
      params.push(parseFloat(maxPrice));
    }

    const [hotels] = await db.query(query, params);

    // Apply dynamic pricing engine & currency conversion
    const processedHotels = hotels.map(hotel => {
      const dynamicPrice = calculateDynamicPrice(hotel.price_per_night, checkInDate, 1.0);
      return {
        ...hotel,
        original_price: hotel.price_per_night,
        price_per_night: dynamicPrice,
        price_usd: Math.round((dynamicPrice / 25000) * 100) / 100
      };
    });

    res.json(processedHotels);
  } catch (error) {
    console.error('getHotels error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách khách sạn' });
  }
};

const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkInDate } = req.query;
    const [hotels] = await db.query('SELECT * FROM hotels WHERE id = ?', [id]);
    if (hotels.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn này' });
    }

    const [reviews] = await db.query(
      `SELECT r.*, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.entity_type = 'hotel' AND r.entity_id = ? 
       ORDER BY r.created_at DESC`,
      [id]
    );

    const [rooms] = await db.query('SELECT * FROM rooms WHERE hotel_id = ?', [id]);

    const hotel = hotels[0];
    const dynamicPrice = calculateDynamicPrice(hotel.price_per_night, checkInDate, 1.0);
    hotel.original_price = hotel.price_per_night;
    hotel.price_per_night = dynamicPrice;
    hotel.price_usd = Math.round((dynamicPrice / 25000) * 100) / 100;
    hotel.reviews = reviews;
    
    // Process room prices dynamically
    hotel.rooms = rooms.map(room => {
      const roomDynamicPrice = calculateDynamicPrice(room.price_per_night, checkInDate, 1.0);
      return {
        ...room,
        original_price: room.price_per_night,
        price_per_night: roomDynamicPrice,
        price_usd: Math.round((roomDynamicPrice / 25000) * 100) / 100
      };
    });

    res.json(hotel);
  } catch (error) {
    console.error('getHotelById error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết khách sạn' });
  }
};

const getFlights = async (req, res) => {
  try {
    const { from, to, date, airline } = req.query;
    let query = 'SELECT * FROM flights WHERE 1=1';
    let params = [];

    if (from) {
      query += ' AND departure_airport LIKE ?';
      params.push(`%${from}%`);
    }

    if (to) {
      query += ' AND arrival_airport LIKE ?';
      params.push(`%${to}%`);
    }

    if (airline) {
      query += ' AND airline = ?';
      params.push(airline);
    }

    const [flights] = await db.query(query, params);

    const processedFlights = flights.map(flight => {
      const dynamicPrice = calculateDynamicPrice(flight.price, date || flight.departure_time, 1.1);
      return {
        ...flight,
        original_price: flight.price,
        price: dynamicPrice,
        price_usd: Math.round((dynamicPrice / 25000) * 100) / 100
      };
    });

    res.json(processedFlights);
  } catch (error) {
    console.error('getFlights error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách chuyến bay' });
  }
};

const createFlight = async (req, res) => {
  try {
    const { airline, flight_number, departure_airport, arrival_airport, departure_time, price, duration } = req.body;
    if (!airline || !flight_number || !departure_airport || !arrival_airport || !departure_time || !price || !duration) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin chuyến bay' });
    }
    const [result] = await db.query(
      `INSERT INTO flights (airline, flight_number, departure_airport, arrival_airport, departure_time, price, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [airline, flight_number, departure_airport, arrival_airport, departure_time, parseFloat(price), duration]
    );
    res.status(201).json({ id: result.insertId, airline, flight_number, departure_airport, arrival_airport, departure_time, price, duration });
  } catch (error) {
    console.error('createFlight error:', error);
    res.status(500).json({ message: 'Lỗi khi tạo chuyến bay mới' });
  }
};

const updateFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const { airline, flight_number, departure_airport, arrival_airport, departure_time, price, duration } = req.body;
    if (!airline || !flight_number || !departure_airport || !arrival_airport || !departure_time || !price || !duration) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin chuyến bay' });
    }
    const [result] = await db.query(
      `UPDATE flights 
       SET airline = ?, flight_number = ?, departure_airport = ?, arrival_airport = ?, departure_time = ?, price = ?, duration = ?
       WHERE id = ?`,
      [airline, flight_number, departure_airport, arrival_airport, departure_time, parseFloat(price), duration, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy chuyến bay để cập nhật' });
    }
    res.json({ id, airline, flight_number, departure_airport, arrival_airport, departure_time, price, duration });
  } catch (error) {
    console.error('updateFlight error:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật chuyến bay' });
  }
};

const deleteFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM flights WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy chuyến bay để xóa' });
    }
    res.json({ message: 'Đã xóa chuyến bay thành công!' });
  } catch (error) {
    console.error('deleteFlight error:', error);
    res.status(500).json({ message: 'Lỗi khi xóa chuyến bay' });
  }
};

module.exports = {
  getHotels,
  getHotelById,
  getFlights,
  createFlight,
  updateFlight,
  deleteFlight
};
