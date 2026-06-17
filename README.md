# DuBaoTravel Portal - Hệ Thống Quản Lý & Đặt Chỗ Du Lịch Toàn Diện

Hệ thống cổng thông tin du lịch (Travel Portal) thiết kế theo mô hình **MVC** hiện đại, kết hợp cơ sở dữ liệu MySQL, Backend API Gateway Express, và Frontend React SPA (Vite) cao cấp.

---

## 📁 Cấu Trúc Thư Mục (MVC Split)

```text
web_dulich/
├── database/
│   └── web_dulich.sql        # Database schema và dữ liệu mẫu (import vào MySQL)
├── backend/
│   ├── config/               # Cấu hình Pool Connection database
│   ├── controllers/          # Business logic (Auth, Bookings, Itineraries, Suppliers)
│   ├── middleware/           # Lớp bảo mật Auth và Admin Token
│   ├── routes/               # API Route mappings
│   ├── server.js             # Cổng API Gateway chính
│   └── .env                  # Cấu hình cổng kết nối và thông số DB
├── frontend/
│   ├── src/
│   │   ├── components/       # Component dùng chung (Navbar, Footer, Leaflet Map)
│   │   ├── context/          # Lưu trữ session trạng thái đăng nhập
│   │   ├── pages/            # View chính (Home search, Tour details, Planner, Billing)
│   │   ├── App.jsx           # Quản lý Routing
│   │   └── index.css         # Custom Premium Design System & Print layouts
│   └── package.json
└── documentation.md          # Đặc tả API Spec, Mappings, và Runbook mùa cao điểm
```

---

## 🚀 Hướng Dẫn Thiết Lập & Khởi Chạy Nhanh

### Bước 1: Nhập Cơ Sở Dữ Liệu MySQL
1. Khởi động MySQL Server (ví dụ qua XAMPP, Laragon hoặc MySQL Command Line).
2. Tạo một database mới tên là `web_dulich` (nếu chưa có).
3. Import file `database/web_dulich.sql` để thiết lập cấu trúc bảng và tải dữ liệu mẫu:
   ```bash
   mysql -u root -p web_dulich < database/web_dulich.sql
   ```

### Bước 2: Khởi Chạy API Backend
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Mở file `.env` và tùy chỉnh lại tài khoản kết nối MySQL (`DB_USER`, `DB_PASSWORD`) nếu khác cấu hình mặc định (root/mật khẩu trống).
3. Khởi chạy server:
   ```bash
   npm start
   ```
   *Cổng API Gateway sẽ chạy tại địa chỉ: `http://localhost:5000`*

### Bước 3: Khởi Chạy Frontend React (Vite)
1. Mở một terminal mới và di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Khởi chạy máy chủ phát triển (Dev server):
   ```bash
   npm run dev
   ```
   *Trang web sẽ chạy tại địa chỉ mặc định: `http://localhost:5173`*

---

## 🌟 Các Tính Năng Đã Hoàn Thiện

1. **Search-First UX & Faceted Filters**:
   - Ô tìm kiếm loại trừ lỗi chính tả bằng tính năng Typeahead (gợi ý tự động).
   - Bộ lọc chi tiết nhiều chiều (Faceted Filters) theo số lượng ngày, khoảng giá tối đa, và điểm số đánh giá cập nhật dữ liệu trực tiếp trong thời gian thực.
2. **OTA Hotel & Flight Aggregator**:
   - Tích hợp mô phỏng luồng GDS/Sabre/OTA (Agoda/Booking) với giao diện so sánh giá.
   - Bản đồ tương tác Leaflet hiển thị các khách sạn (POIs) lân cận trực quan.
   - Pricing Engine tự động điều chỉnh mức giá tùy thuộc vào ngày nhận phòng khẩn cấp hoặc thời kỳ nghỉ cao điểm.
3. **Trip Builder & PDF Exporter**:
   - Trình lập lịch trình kéo thả ngày nghỉ sử dụng HTML5 Drag-and-Drop gốc, lưu kế hoạch trực tiếp trên DB của người dùng.
   - Hỗ trợ in/xuất file PDF lịch trình chuyên nghiệp (tự động loại bỏ nút bấm, thanh điều hướng khi nhấn Xuất PDF).
4. **Cổng Thanh Toán & Đồng Bộ Giao Dịch**:
   - Đặt chỗ bằng giao dịch MySQL (Transactions), kiểm tra giới hạn chỗ trống trước khi tạo hóa đơn chờ thanh toán.
   - Hỗ trợ tạo mã thanh toán chuyển khoản ngân hàng (QR Code) kèm nội dung và hóa đơn chuyển khoản.
   - Hỗ trợ chính sách hủy bỏ chỗ linh hoạt đi kèm cơ chế hoàn tiền hoàn tất tự động.
