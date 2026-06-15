-- Web Du Lich Database Schema and Seed Data
-- Database name: web_dulich

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  destination VARCHAR(255) NOT NULL,
  duration_days INT NOT NULL,
  duration_nights INT NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  image_url VARCHAR(500),
  start_date DATE,
  max_participants INT DEFAULT 20,
  rating DECIMAL(3, 2) DEFAULT 5.00,
  highlights TEXT,
  itinerary_preview TEXT
);

CREATE TABLE IF NOT EXISTS hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  price_per_night DECIMAL(15, 2) NOT NULL,
  star_rating INT DEFAULT 3,
  image_url VARCHAR(500),
  description TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8)
);

CREATE TABLE IF NOT EXISTS flights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  airline VARCHAR(100) NOT NULL,
  flight_number VARCHAR(50) NOT NULL,
  departure_airport VARCHAR(50) NOT NULL,
  arrival_airport VARCHAR(50) NOT NULL,
  departure_time DATETIME NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  duration VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('tour', 'hotel', 'flight') NOT NULL,
  reference_id INT NOT NULL,
  booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  total_price DECIMAL(15, 2) NOT NULL,
  payment_status ENUM('unpaid', 'authorized', 'paid', 'refunded') DEFAULT 'unpaid',
  guest_details TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS itineraries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255),
  start_date DATE,
  end_date DATE,
  content JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  entity_type ENUM('tour', 'hotel', 'flight') NOT NULL,
  entity_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  transaction_id VARCHAR(255),
  payment_method VARCHAR(50),
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Seed Data

-- Insert Users (Password is bcrypt for 'user123' or 'admin123')
-- user123: $2b$10$tZ2cK.2xY/C7Uo8kMtf3OexvT7eYJ3L99s4f5n9V5d7N3U0pU.fP.
-- admin123: $2b$10$7zB356.b17g79t1Kx6Q/be1B9u06W6g4f.Yv/q2e6.x.D/G3Wb/F.
INSERT INTO users (id, email, password, name, phone, role) VALUES
(1, 'admin@webdulich.com', '$2b$10$7zB356.b17g79t1Kx6Q/be1B9u06W6g4f.Yv/q2e6.x.D/G3Wb/F.', 'Quản trị viên', '0901234567', 'admin'),
(2, 'user@webdulich.com', '$2b$10$tZ2cK.2xY/C7Uo8kMtf3OexvT7eYJ3L99s4f5n9V5d7N3U0pU.fP.', 'Nguyễn Văn A', '0987654321', 'user');

-- Insert Tours
INSERT INTO tours (id, title, description, destination, duration_days, duration_nights, price, image_url, start_date, max_participants, rating, highlights, itinerary_preview) VALUES
(1, 'Tour Du Thuyền 5 Sao Vịnh Hạ Long', 'Trải nghiệm du thuyền ngủ đêm đẳng cấp trên vịnh biển kỳ quan thế giới. Chiêm ngưỡng hàng nghìn hòn đảo đá vôi, hang động kỳ vĩ và tham gia các hoạt động chèo thuyền kayak, học nấu ăn, câu mực đêm.', 'Hạ Long, Quảng Ninh', 2, 1, 3500000.00, 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80', '2026-07-01', 15, 4.8, 'Hành trình 5 sao sang trọng,Thưởng thức hải sản cao cấp,Khám phá Hang Sửng Sốt,Chèo kayak tại Hang Luồn', 'Ngày 1: Hà Nội - Hạ Long - Check-in Du thuyền - Hang Luồn | Ngày 2: Hang Sửng Sốt - Đỉnh Titop - Hà Nội'),
(2, 'Khám Phá Hà Giang Hùng Vĩ - Mùa Hoa Tam Giác Mạch', 'Hành trình chinh phục những cung đường đèo hiểm trở nhưng vô cùng ngoạn mục của Hà Giang. Tham quan Cột cờ Lũng Cú, Phố cổ Đồng Văn, Đèo Mã Pí Lèng và du thuyền trên sông Nho Quế.', 'Hà Giang', 3, 2, 2800000.00, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', '2026-10-15', 20, 4.9, 'Chinh phục Đèo Mã Pí Lèng,Du thuyền Sông Nho Quế qua Hẻm Tu Sản,Check-in Cột cờ Lũng Cú cực Bắc,Trải nghiệm văn hóa đồng bào Mông', 'Ngày 1: Hà Nội - Quản Bạ - Yên Minh - Đồng Văn | Ngày 2: Cột cờ Lũng Cú - Mã Pí Lèng - Sông Nho Quế | Ngày 3: Chợ phiên Đồng Văn - Hà Nội'),
(3, 'Đảo Ngọc Phú Quốc - Thiên Đường Nghỉ Dưỡng', 'Kỳ nghỉ tuyệt vời tại bãi biển cát trắng mịn của Phú Quốc. Khám phá Safari bán hoang dã, Grand World thành phố không ngủ, ngắm hoàng hôn Dinh Cậu và tham gia tour 4 đảo lặn ngắm san hô.', 'Phú Quốc, Kiên Giang', 4, 3, 4900000.00, 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80', '2026-08-10', 25, 4.7, 'Nghỉ dưỡng resort sát biển,Tour 4 đảo & lặn ngắm san hô,Khám phá Grand World & VinWonders,Thưởng thức bún quậy Phú Quốc', 'Ngày 1: Đón sân bay Phú Quốc - Sunset Sanato - Dinh Cậu | Ngày 2: Tour 4 đảo lặn ngắm san hô - Cáp treo Hòn Thơm | Ngày 3: VinWonders & Safari | Ngày 4: Chợ Dương Đông - Tiễn sân bay'),
(4, 'Hành Trình Di Sản Miền Trung: Đà Nẵng - Hội An - Huế', 'Khám phá chuỗi di sản miền Trung từ sự hiện đại của Đà Nẵng, sự cổ kính của Phố cổ Hội An đến nét trang nghiêm của Đại Nội Huế và Lăng tẩm triều Nguyễn.', 'Đà Nẵng - Hội An - Huế', 4, 3, 4200000.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80', '2026-07-15', 18, 4.6, 'Tham quan Bà Nà Hills - Cầu Vàng,Thả đèn hoa đăng tại Phố cổ Hội An,Khám phá Đại Nội Huế cổ kính,Thưởng thức ẩm thực cung đình Huế', 'Ngày 1: Đón sân bay Đà Nẵng - Ngũ Hành Sơn - Hội An | Ngày 2: KDL Bà Nà Hills - Cầu Vàng - Đà Nẵng | Ngày 3: Đà Nẵng - Lăng Cô - Cố đô Huế | Ngày 4: Đại nội Huế - Chùa Thiên Mụ - Tiễn sân bay');

-- Insert Hotels
INSERT INTO hotels (id, name, location, price_per_night, star_rating, image_url, description, lat, lng) VALUES
(1, 'Vinpearl Resort & Spa Phú Quốc', 'Khu Bãi Dài, Xã Gành Dầu, Phú Quốc, Kiên Giang', 2200000.00, 5, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 'Mang đậm kiến trúc Á Đông với mái ngói đỏ đặc trưng, Vinpearl Resort & Spa Phú Quốc đem đến không gian nghỉ dưỡng sang trọng bên bãi biển riêng tư hoang sơ.', 10.334185, 103.856983),
(2, 'InterContinental Danang Sun Peninsula Resort', 'Bán đảo Sơn Trà, Đà Nẵng', 7500000.00, 5, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', 'Tọa lạc giữa sườn đồi thoai thoải của bán đảo Sơn Trà với tầm nhìn tuyệt đẹp ra vịnh biển riêng tư, khu nghỉ dưỡng là tuyệt tác nghệ thuật của KTS lừng danh Bill Bensley.', 16.121516, 108.312952),
(3, 'Sofitel Legend Metropole Hà Nội', '15 Ngô Quyền, Hoàn Kiếm, Hà Nội', 5500000.00, 5, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', 'Khách sạn di sản mang phong cách kiến trúc thời thuộc địa Pháp sang trọng bậc nhất Hà Nội, nằm ngay trung tâm thành phố gần Hồ Hoàn Kiếm và Nhà Hát Lớn.', 21.025062, 105.856230),
(4, 'Lotte Hotel Hà Nội', '54 Liễu Giai, Cống Vị, Ba Đình, Hà Nội', 2600000.00, 5, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', 'Tọa lạc từ tầng 33 đến 64 của tòa nhà Lotte Center 65 tầng hiện đại, mang đến tầm nhìn toàn cảnh ngoạn mục ra hồ Tây và toàn thành phố Hà Nội.', 21.031952, 105.811802);

-- Insert Flights
INSERT INTO flights (id, airline, flight_number, departure_airport, arrival_airport, departure_time, price, duration) VALUES
(1, 'Vietnam Airlines', 'VN213', 'HAN (Hà Nội)', 'SGN (TP. HCM)', '2026-07-05 08:00:00', 1850000.00, '2h 10m'),
(2, 'Vietjet Air', 'VJ127', 'HAN (Hà Nội)', 'DAD (Đà Nẵng)', '2026-07-06 10:30:00', 950000.00, '1h 20m'),
(3, 'Bamboo Airways', 'QH152', 'SGN (TP. HCM)', 'PQC (Phú Quốc)', '2026-07-07 14:15:00', 1200000.00, '1h 0m'),
(4, 'Vietnam Airlines', 'VN115', 'DAD (Đà Nẵng)', 'SGN (TP. HCM)', '2026-07-08 18:30:00', 1500000.00, '1h 30m');

-- Insert Reviews
INSERT INTO reviews (id, user_id, entity_type, entity_id, rating, comment) VALUES
(1, 2, 'tour', 1, 5, 'Chuyến đi tuyệt vời! Du thuyền rất sang trọng, nhân viên phục vụ chu đáo tận tình. Đồ ăn hải sản tươi ngon, lịch trình hợp lý. Rất đáng tiền.'),
(2, 2, 'tour', 2, 5, 'Cảnh sắc Hà Giang quá đỗi hùng vĩ. Đèo Mã Pí Lèng và Sông Nho Quế đẹp như tranh vẽ. Hướng dẫn viên địa phương am hiểu văn hóa và vô cùng nhiệt tình.'),
(3, 2, 'hotel', 2, 5, 'Khách sạn đẳng cấp nhất Việt Nam. Thiết kế sang trọng mang đậm bản sắc văn hóa Việt. Dịch vụ quản gia rất chu đáo, bãi biển riêng cực đẹp.'),
(4, 2, 'hotel', 3, 4, 'Khách sạn mang đậm nét cổ điển lịch sử. Phòng ốc sạch sẽ, bữa sáng buffet rất phong phú. Vị trí trung tâm thuận tiện đi lại.');
