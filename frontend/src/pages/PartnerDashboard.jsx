import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Plus, Edit2, Trash2, Calendar, DollarSign, 
  Users, Briefcase, X, Check, AlertCircle, Building, Bed, TrendingUp,
  Download, Search, FileText, Sliders
} from 'lucide-react';

export const PartnerDashboard = () => {
  const { user, token } = useAuth();
  const { showAlert, showConfirm } = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Revenue Filter & Lightbox States
  const [revSearch, setRevSearch] = useState('');
  const [revStatus, setRevStatus] = useState('all');
  const [revDateRange, setRevDateRange] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [usersList, setUsersList] = useState([]);

  // Hotel Modal State
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [hotelFormData, setHotelFormData] = useState({
    name: '',
    location: '',
    price_per_night: 0,
    star_rating: 3,
    image_url: '',
    description: '',
    lat: 10.0,
    lng: 100.0,
    owner_id: ''
  });

  // Room Modal State
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    hotel_id: '',
    room_type: '',
    price_per_night: 0,
    max_occupancy: 2,
    image_url: '',
    description: '',
    total_rooms: 5
  });

  const [formLoading, setFormLoading] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('lang') || 'vi');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  // Protection: role must be 'hotel_owner' or 'admin'
  useEffect(() => {
    if (!loading && (!user || (user.role !== 'hotel_owner' && user.role !== 'admin'))) {
      showAlert(
        lang === 'vi' ? 'Bạn không có quyền truy cập trang đối tác!' : 'Unauthorized access to partner portal!',
        'error',
        lang === 'vi' ? 'Từ chối truy cập' : 'Access Denied'
      );
      navigate('/');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user && (user.role === 'hotel_owner' || user.role === 'admin')) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Load rooms when selected hotel changes
  useEffect(() => {
    if (selectedHotelId) {
      fetchRooms(selectedHotelId);
    } else {
      setRooms([]);
    }
  }, [selectedHotelId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const promises = [
        fetchHotels(),
        fetchBookings(),
        fetchStatistics()
      ];
      if (user && user.role === 'admin') {
        promises.push(fetchUsers());
      }
      await Promise.all(promises);
    } catch (err) {
      console.error('Error loading partner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error('Error fetching users list:', err);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/partners/hotels', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHotels(data);
        if (data.length > 0) {
          setSelectedHotelId(data[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching partner hotels:', err);
    }
  };

  const fetchRooms = async (hotelId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/partners/hotels/${hotelId}/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error('Error fetching hotel rooms:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/partners/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching partner bookings:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/partners/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching partner statistics:', err);
    }
  };

  // --- Hotel Actions ---
  const handleOpenHotelCreate = () => {
    setEditingHotel(null);
    setHotelFormData({
      name: '',
      location: '',
      price_per_night: 0,
      star_rating: 3,
      image_url: '',
      description: '',
      lat: 10.0,
      lng: 100.0,
      owner_id: ''
    });
    setShowHotelModal(true);
  };

  const handleOpenHotelEdit = (hotel) => {
    setEditingHotel(hotel);
    setHotelFormData({
      name: hotel.name,
      location: hotel.location,
      price_per_night: hotel.price_per_night,
      star_rating: hotel.star_rating,
      image_url: hotel.image_url,
      description: hotel.description,
      lat: hotel.lat,
      lng: hotel.lng,
      owner_id: hotel.owner_id || ''
    });
    setShowHotelModal(true);
  };

  const handleHotelFormChange = (e) => {
    const { name, value } = e.target;
    setHotelFormData(prev => ({
      ...prev,
      [name]: name === 'price_per_night' || name === 'star_rating' || name === 'lat' || name === 'lng'
        ? Number(value)
        : name === 'owner_id'
        ? (value ? Number(value) : '')
        : value
    }));
  };

  const handleSaveHotel = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const url = editingHotel
      ? `http://localhost:5001/api/partners/hotels/${editingHotel.id}`
      : 'http://localhost:5001/api/partners/hotels';
    const method = editingHotel ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hotelFormData)
      });
      const data = await res.json();

      if (res.ok) {
        await showAlert(
          lang === 'vi'
            ? (editingHotel ? 'Cập nhật khách sạn thành công!' : 'Đã đăng ký khách sạn mới thành công!')
            : (editingHotel ? 'Hotel updated successfully!' : 'New hotel published successfully!'),
          'success'
        );
        setShowHotelModal(false);
        loadDashboardData();
      } else {
        await showAlert(data.message || 'Lỗi lưu thông tin', 'error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteHotel = async (hotelId, hotelName) => {
    const confirmMsg = lang === 'vi'
      ? `Bạn có chắc chắn muốn xóa khách sạn "${hotelName}"? Thao tác này sẽ xóa mọi thông tin phòng và hóa đơn liên quan.`
      : `Are you sure you want to delete hotel "${hotelName}"? This will delete all rooms and related invoices.`;

    const isConfirmed = await showConfirm(confirmMsg, lang === 'vi' ? 'Xác nhận xóa khách sạn' : 'Confirm Hotel Deletion', 'danger');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5001/api/partners/hotels/${hotelId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        await showAlert(lang === 'vi' ? 'Đã xóa khách sạn thành công!' : 'Hotel deleted successfully!', 'success');
        loadDashboardData();
      } else {
        await showAlert(data.message || 'Lỗi khi xóa khách sạn', 'error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error');
    }
  };

  // --- Room Actions ---
  const handleOpenRoomCreate = () => {
    setEditingRoom(null);
    setRoomFormData({
      hotel_id: selectedHotelId,
      room_type: '',
      price_per_night: 0,
      max_occupancy: 2,
      image_url: '',
      description: '',
      total_rooms: 5
    });
    setShowRoomModal(true);
  };

  const handleOpenRoomEdit = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      hotel_id: room.hotel_id,
      room_type: room.room_type,
      price_per_night: room.price_per_night,
      max_occupancy: room.max_occupancy,
      image_url: room.image_url,
      description: room.description,
      total_rooms: room.total_rooms
    });
    setShowRoomModal(true);
  };

  const handleRoomFormChange = (e) => {
    const { name, value } = e.target;
    setRoomFormData(prev => ({
      ...prev,
      [name]: name === 'price_per_night' || name === 'max_occupancy' || name === 'total_rooms'
        ? Number(value)
        : value
    }));
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const url = editingRoom
      ? `http://localhost:5001/api/partners/rooms/${editingRoom.id}`
      : 'http://localhost:5001/api/partners/rooms';
    const method = editingRoom ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roomFormData)
      });
      const data = await res.json();

      if (res.ok) {
        await showAlert(
          lang === 'vi'
            ? (editingRoom ? 'Cập nhật phòng thành công!' : 'Đã thêm loại phòng mới thành công!')
            : (editingRoom ? 'Room type updated!' : 'New room type added successfully!'),
          'success'
        );
        setShowRoomModal(false);
        fetchRooms(selectedHotelId);
        fetchStatistics();
      } else {
        await showAlert(data.message || 'Lỗi lưu thông tin phòng', 'error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId, roomType) => {
    const confirmMsg = lang === 'vi'
      ? `Bạn có chắc chắn muốn xóa phòng "${roomType}" không?`
      : `Are you sure you want to delete room type "${roomType}"?`;

    const isConfirmed = await showConfirm(confirmMsg, lang === 'vi' ? 'Xác nhận xóa phòng' : 'Confirm Room Deletion', 'danger');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5001/api/partners/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        await showAlert(lang === 'vi' ? 'Đã xóa phòng thành công!' : 'Room deleted successfully!', 'success');
        fetchRooms(selectedHotelId);
        fetchStatistics();
      } else {
        await showAlert(data.message || 'Lỗi khi xóa phòng', 'error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error');
    }
  };

  // --- Booking Approvals ---
  const handleUpdateBooking = async (bookingId, action) => {
    const confirmMsg = lang === 'vi'
      ? `Bạn có chắc chắn muốn ${action === 'confirmed' ? 'Xác nhận duyệt' : 'Từ chối'} đơn đặt phòng này không?`
      : `Are you sure you want to ${action === 'confirmed' ? 'Accept' : 'Reject'} this room booking?`;

    const isConfirmed = await showConfirm(confirmMsg, lang === 'vi' ? 'Xác nhận thay đổi' : 'Confirm Booking Status', 'warning');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5001/api/partners/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: action,
          payment_status: action === 'confirmed' ? 'paid' : 'unpaid' 
        })
      });
      const data = await res.json();

      if (res.ok) {
        await showAlert(
          lang === 'vi' 
            ? (action === 'confirmed' ? 'Đã xác nhận đặt phòng!' : 'Đã từ chối đặt phòng!')
            : (action === 'confirmed' ? 'Booking approved successfully!' : 'Booking rejected successfully!'),
          'success'
        );
        fetchBookings();
        fetchStatistics();
      } else {
        await showAlert(data.message || 'Lỗi cập nhật đặt phòng', 'error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error');
    }
  };

  // Status badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge badge-success">{lang === 'vi' ? 'Đã Xác Nhận' : 'Confirmed'}</span>;
      case 'pending':
        return <span className="badge badge-warning">{lang === 'vi' ? 'Chờ Xử Lý' : 'Pending'}</span>;
      case 'cancelled':
        return <span className="badge badge-danger">{lang === 'vi' ? 'Đã Từ Chối' : 'Rejected'}</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="badge badge-success" style={{ backgroundColor: 'rgba(56, 161, 105, 0.1)' }}>{lang === 'vi' ? 'Đã Thanh Toán' : 'Paid'}</span>;
      case 'unpaid':
        return <span className="badge badge-danger" style={{ backgroundColor: 'rgba(229, 62, 62, 0.1)' }}>{lang === 'vi' ? 'Chưa Thanh Toán' : 'Unpaid'}</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ border: '4px solid #E2E8F0', borderTop: '4px solid var(--secondary-base)', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
        <p>{lang === 'vi' ? 'Đang tải dữ liệu trang đối tác...' : 'Loading partner portal data...'}</p>
      </div>
    );
  }

  if (!user || (user.role !== 'hotel_owner' && user.role !== 'admin')) return null;

  // Custom Translations
  const t = {
    vi: {
      title: 'Kênh Nhà Cung Cấp & Đối Tác',
      desc: 'Quản lý thông tin khách sạn của bạn, cài đặt các phòng trống, duyệt đặt phòng của khách hàng và xem báo cáo doanh thu.',
      tabOverview: 'Báo Cáo Thống Kê',
      tabHotels: 'Quản Lý Khách Sạn',
      tabRooms: 'Cài Đặt Phòng',
      tabBookings: 'Duyệt Đặt Phòng',
      cardHotels: 'Số Khách Sạn',
      cardRooms: 'Loại Phòng Đang Bán',
      cardBookings: 'Hóa Đơn Đặt Phòng',
      cardRevenue: 'Doanh Thu Khách Sạn',
      addNewHotel: 'Đăng Khách Sạn Mới',
      addNewRoom: 'Thêm Loại Phòng Mới',
      edit: 'Sửa',
      delete: 'Xóa',
      btnApprove: 'Duyệt',
      btnReject: 'Từ Chối',
      colHotelName: 'Khách sạn',
      colLoc: 'Địa điểm / Vị trí',
      colPrice: 'Giá cơ bản / đêm',
      colStars: 'Xếp hạng sao',
      colActions: 'Hành động',
      colRoomType: 'Tên loại phòng',
      colOccupancy: 'Số khách tối đa',
      colRoomCount: 'Tổng số phòng',
      colCustomer: 'Khách hàng',
      colHotelRoom: 'Khách sạn / Loại phòng',
      colBookingDate: 'Ngày Đặt',
      colCheckIn: 'Thời gian lưu trú',
      colStatus: 'Trạng Thái',
      colPayment: 'Thanh Toán',
      emptyHotels: 'Bạn chưa đăng ký khách sạn nào trên hệ thống.',
      emptyRooms: 'Khách sạn này chưa được cấu hình loại phòng nào.',
      emptyBookings: 'Hệ thống chưa có đơn đặt phòng nào cho khách sạn của bạn.',
      hotelSelectLabel: 'Chọn khách sạn để xem & quản lý phòng:'
    },
    en: {
      title: 'Partner & Hotel Owner Portal',
      desc: 'Manage your hotel profiles, set room vacancies/rates, confirm customer bookings, and track hotel revenues.',
      tabOverview: 'Financial Statistics',
      tabHotels: 'Hotel Manager',
      tabRooms: 'Room Manager',
      tabBookings: 'Booking Approvals',
      cardHotels: 'My Hotels',
      cardRooms: 'Active Room Types',
      cardBookings: 'Total Invoices',
      cardRevenue: 'Hotel Revenues',
      addNewHotel: 'Publish New Hotel',
      addNewRoom: 'Add Room Type',
      edit: 'Edit',
      delete: 'Delete',
      btnApprove: 'Approve',
      btnReject: 'Reject',
      colHotelName: 'Hotel Name',
      colLoc: 'Location Address',
      colPrice: 'Base Rate / Night',
      colStars: 'Stars',
      colActions: 'Actions',
      colRoomType: 'Room Type',
      colOccupancy: 'Max Guests',
      colRoomCount: 'Available Rooms',
      colCustomer: 'Customer',
      colHotelRoom: 'Hotel / Room Type',
      colBookingDate: 'Order Date',
      colCheckIn: 'Duration / Period',
      colStatus: 'Status',
      colPayment: 'Payment',
      emptyHotels: 'You have not registered any hotels yet.',
      emptyRooms: 'No room configurations found for this hotel.',
      emptyBookings: 'No hotel booking requests found.',
      hotelSelectLabel: 'Select hotel to configure rooms:'
    }
  }[lang];

  // Helper for generating premium progress bars for months
  const maxMonthRevenue = stats && stats.monthlyData && stats.monthlyData.length > 0
    ? Math.max(...stats.monthlyData.map(m => parseFloat(m.revenue || 0)), 1000000)
    : 1000000;

  const getFilteredRevenueBookings = () => {
    return bookings.filter(b => {
      const matchesSearch = 
        !revSearch || 
        b.user_name?.toLowerCase().includes(revSearch.toLowerCase()) ||
        b.user_email?.toLowerCase().includes(revSearch.toLowerCase()) ||
        b.service_name?.toLowerCase().includes(revSearch.toLowerCase()) ||
        b.hotel_name?.toLowerCase().includes(revSearch.toLowerCase()) ||
        `BK-${b.id.toString().padStart(5, '0')}`.toLowerCase().includes(revSearch.toLowerCase());

      const matchesStatus = revStatus === 'all' || b.payment_status === revStatus;

      let matchesDate = true;
      if (revDateRange !== 'all') {
        const bookingDate = new Date(b.booking_date);
        const now = new Date();
        if (revDateRange === '7days') {
          const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
          matchesDate = bookingDate >= sevenDaysAgo;
        } else if (revDateRange === '30days') {
          const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
          matchesDate = bookingDate >= thirtyDaysAgo;
        } else if (revDateRange === '12months') {
          const twelveMonthsAgo = new Date(now.setMonth(now.getMonth() - 12));
          matchesDate = bookingDate >= twelveMonthsAgo;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const handleExportCSV = () => {
    const filtered = getFilteredRevenueBookings();
    const headers = ['Ma Don', 'Khach hang', 'Email', 'Khach san', 'Phong', 'Ngay Dat', 'Doanh thu (VND)', 'Trang thai', 'Thanh toan'];
    const rows = filtered.map(b => [
      `BK-${b.id.toString().padStart(5, '0')}`,
      b.user_name,
      b.user_email,
      b.hotel_name,
      b.service_name,
      new Date(b.booking_date).toLocaleDateString(),
      b.total_price,
      b.status,
      b.payment_status
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bao_cao_doanh_thu_partner_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container animate-fade-in" style={{ marginTop: '40px', marginBottom: '60px' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building size={32} color="var(--secondary-base)" />
            <h1 style={{ fontSize: '2.2rem' }}>{t.title}</h1>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="glass-card" style={{ padding: '8px', display: 'inline-flex', gap: '8px', marginBottom: '30px', border: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => setActiveTab('overview')} 
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'overview' ? 'var(--primary-base)' : 'transparent', 
            color: activeTab === 'overview' ? 'white' : 'var(--text-main)',
            padding: '8px 16px',
            fontSize: '0.9rem'
          }}
        >
          {t.tabOverview}
        </button>
        <button 
          onClick={() => setActiveTab('hotels')} 
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'hotels' ? 'var(--primary-base)' : 'transparent', 
            color: activeTab === 'hotels' ? 'white' : 'var(--text-main)',
            padding: '8px 16px',
            fontSize: '0.9rem'
          }}
        >
          {t.tabHotels}
        </button>
        <button 
          onClick={() => setActiveTab('rooms')} 
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'rooms' ? 'var(--primary-base)' : 'transparent', 
            color: activeTab === 'rooms' ? 'white' : 'var(--text-main)',
            padding: '8px 16px',
            fontSize: '0.9rem'
          }}
        >
          {t.tabRooms}
        </button>
        <button 
          onClick={() => setActiveTab('bookings')} 
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'bookings' ? 'var(--primary-base)' : 'transparent', 
            color: activeTab === 'bookings' ? 'white' : 'var(--text-main)',
            padding: '8px 16px',
            fontSize: '0.9rem'
          }}
        >
          {t.tabBookings}
        </button>
        <button 
          onClick={() => setActiveTab('revenue')} 
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'revenue' ? 'var(--primary-base)' : 'transparent', 
            color: activeTab === 'revenue' ? 'white' : 'var(--text-main)',
            padding: '8px 16px',
            fontSize: '0.9rem'
          }}
        >
          {lang === 'vi' ? 'Quản Lý Doanh Thu' : 'Revenue Manager'}
        </button>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div>
          {/* Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            
            <div className="glass-card hover-lift" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ backgroundColor: 'rgba(49, 151, 149, 0.1)', color: 'var(--secondary-base)', padding: '16px', borderRadius: '50%' }}>
                <Building size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.cardHotels}</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.hotelsCount}</h2>
              </div>
            </div>

            <div className="glass-card hover-lift" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ backgroundColor: 'rgba(26, 54, 93, 0.1)', color: 'var(--primary-base)', padding: '16px', borderRadius: '50%' }}>
                <Bed size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.cardRooms}</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.roomsCount}</h2>
              </div>
            </div>

            <div className="glass-card hover-lift" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ backgroundColor: 'rgba(214, 158, 46, 0.1)', color: 'var(--accent-base)', padding: '16px', borderRadius: '50%' }}>
                <Briefcase size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.cardBookings}</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.bookingsCount}</h2>
              </div>
            </div>

            <div className="glass-card hover-lift" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ backgroundColor: 'rgba(56, 161, 105, 0.1)', color: 'var(--success-color)', padding: '16px', borderRadius: '50%' }}>
                <DollarSign size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.cardRevenue}</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success-color)' }}>
                  {stats.totalRevenue.toLocaleString()}đ
                </h2>
              </div>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', flexWrap: 'wrap' }}>
            
            {/* Chart: Monthly Revenue */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="var(--success-color)" />
                <span>{lang === 'vi' ? 'Biểu đồ Doanh thu (6 tháng gần đây)' : 'Revenue Trend (Last 6 Months)'}</span>
              </h3>
              
              {stats.monthlyData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
                  <AlertCircle size={24} style={{ marginBottom: '10px' }} />
                  <p>{lang === 'vi' ? 'Chưa có dữ liệu giao dịch đã xác nhận.' : 'No confirmed transaction data found.'}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {stats.monthlyData.map(item => {
                    const percent = Math.max(10, Math.round((parseFloat(item.revenue || 0) / maxMonthRevenue) * 100));
                    return (
                      <div key={item.month} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 150px', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Tháng {item.month}</span>
                        <div style={{ height: '14px', backgroundColor: 'var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              width: `${percent}%`, 
                              background: 'linear-gradient(90deg, var(--secondary-light), var(--secondary-base))',
                              borderRadius: '10px',
                              transition: 'width 0.8s ease-in-out'
                            }} 
                          />
                        </div>
                        <span style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary-base)' }}>
                          {parseFloat(item.revenue || 0).toLocaleString()}đ ({item.bookingsCount} đơn)
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Side summary of bookings */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>{lang === 'vi' ? 'Tổng quan đơn đặt chỗ' : 'Booking Summary'}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{lang === 'vi' ? 'Chờ duyệt' : 'Pending'}</span>
                    <span className="badge badge-warning" style={{ fontSize: '0.9rem', fontWeight: 700 }}>{stats.pendingCount}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{lang === 'vi' ? 'Đã xác nhận' : 'Approved'}</span>
                    <span className="badge badge-success" style={{ fontSize: '0.9rem', fontWeight: 700 }}>{stats.confirmedCount}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{lang === 'vi' ? 'Đã hủy / từ chối' : 'Rejected'}</span>
                    <span className="badge badge-danger" style={{ fontSize: '0.9rem', fontWeight: 700 }}>{stats.cancelledCount}</span>
                  </div>

                </div>
              </div>
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'rgba(214, 158, 46, 0.05)', border: '1px solid rgba(214, 158, 46, 0.2)', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-base)', margin: 0, fontWeight: 500 }}>
                  💡 {lang === 'vi' ? 'Hãy duyệt nhanh các đặt phòng chờ xử lý để tối ưu hóa sự hài lòng của khách hàng và tối đa doanh thu.' : 'Approve pending bookings promptly to enhance satisfaction and secure revenue.'}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB: HOTELS MANAGEMENT */}
      {activeTab === 'hotels' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>{lang === 'vi' ? 'Danh sách khách sạn của tôi' : 'My Hotel Profiles'}</h3>
            <button onClick={handleOpenHotelCreate} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={16} />
              {t.addNewHotel}
            </button>
          </div>

          {hotels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ marginBottom: '10px' }} />
              <p>{t.emptyHotels}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px 8px' }}>ID</th>
                    <th style={{ padding: '12px 8px' }}>{t.colHotelName}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colLoc}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colPrice}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colStars}</th>
                    {user.role === 'admin' && <th style={{ padding: '12px 8px' }}>Chủ sở hữu</th>}
                    <th style={{ padding: '12px 8px' }}>{t.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.map(hotel => (
                    <tr key={hotel.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-muted)' }}>#{hotel.id}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={hotel.image_url} alt={hotel.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          <strong style={{ color: 'var(--primary-base)' }}>{hotel.name}</strong>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>{hotel.location}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--secondary-base)' }}>
                        {parseInt(hotel.price_per_night).toLocaleString()}đ
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--accent-base)', fontWeight: 700 }}>
                        {'⭐'.repeat(hotel.star_rating)} ({hotel.star_rating} sao)
                      </td>
                      {user.role === 'admin' && <td style={{ padding: '12px 8px' }}>{hotel.owner_name || 'N/A'}</td>}
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleOpenHotelEdit(hotel)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--primary-base)' }}>
                            <Edit2 size={12} /> {t.edit}
                          </button>
                          <button onClick={() => handleDeleteHotel(hotel.id, hotel.name)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                            <Trash2 size={12} /> {t.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: ROOMS CONFIGURATION */}
      {activeTab === 'rooms' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' }}>{t.hotelSelectLabel}</label>
            <select
              value={selectedHotelId}
              onChange={(e) => setSelectedHotelId(e.target.value)}
              className="btn"
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '8px 12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'white',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              <option value="">-- {lang === 'vi' ? 'Chọn khách sạn' : 'Select Hotel'} --</option>
              {hotels.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {selectedHotelId && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '1.1rem' }}>
                  {lang === 'vi' ? 'Cấu hình các loại phòng bán trực tuyến' : 'Room Types listed Online'}
                </h3>
                <button onClick={handleOpenRoomCreate} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <Plus size={16} />
                  {t.addNewRoom}
                </button>
              </div>

              {rooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <AlertCircle size={32} style={{ marginBottom: '10px' }} />
                  <p>{t.emptyRooms}</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <th style={{ padding: '12px 8px' }}>ID</th>
                        <th style={{ padding: '12px 8px' }}>{t.colRoomType}</th>
                        <th style={{ padding: '12px 8px' }}>{t.colPrice}</th>
                        <th style={{ padding: '12px 8px' }}>{t.colOccupancy}</th>
                        <th style={{ padding: '12px 8px' }}>{t.colRoomCount}</th>
                        <th style={{ padding: '12px 8px' }}>{t.colActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map(room => (
                        <tr key={room.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                          <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-muted)' }}>#{room.id}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={room.image_url} alt={room.room_type} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                              <strong style={{ color: 'var(--primary-base)' }}>{room.room_type}</strong>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--secondary-base)' }}>
                            {parseInt(room.price_per_night).toLocaleString()}đ
                          </td>
                          <td style={{ padding: '12px 8px' }}>{room.max_occupancy} {lang === 'vi' ? 'người' : 'guests'}</td>
                          <td style={{ padding: '12px 8px', fontWeight: 600 }}>{room.total_rooms}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleOpenRoomEdit(room)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--primary-base)' }}>
                                <Edit2 size={12} /> {t.edit}
                              </button>
                              <button onClick={() => handleDeleteRoom(room.id, room.room_type)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                                <Trash2 size={12} /> {t.delete}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB: BOOKINGS APPROVALS */}
      {activeTab === 'bookings' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>{lang === 'vi' ? 'Duyệt đặt phòng của khách hàng' : 'Guest Reservation Approvals'}</h3>

          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ marginBottom: '10px' }} />
              <p>{t.emptyBookings}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px 8px' }}>Mã Đơn</th>
                    <th style={{ padding: '12px 8px' }}>{t.colCustomer}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colHotelRoom}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colBookingDate}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colPrice}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colStatus}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colPayment}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 700 }}>
                        #BK-{booking.id.toString().padStart(5, '0')}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div>
                          <strong style={{ display: 'block' }}>{booking.user_name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.user_email}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div>
                          <strong style={{ display: 'block' }}>{booking.hotel_name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.service_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--primary-base)' }}>
                        {parseInt(booking.total_price).toLocaleString()}đ
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {getStatusBadge(booking.status)}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {getPaymentBadge(booking.payment_status)}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {booking.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleUpdateBooking(booking.id, 'confirmed')} 
                              className="btn btn-success" 
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              <Check size={12} /> {t.btnApprove}
                            </button>
                            <button 
                              onClick={() => handleUpdateBooking(booking.id, 'cancelled')} 
                              className="btn btn-danger" 
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              <X size={12} /> {t.btnReject}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            {booking.status === 'confirmed' ? (lang === 'vi' ? 'Đã duyệt' : 'Approved') : (lang === 'vi' ? 'Đã hủy' : 'Rejected')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: REVENUE MANAGEMENT */}
      {activeTab === 'revenue' && (() => {
        const filteredRev = getFilteredRevenueBookings();
        const totalRev = filteredRev.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + parseFloat(b.total_price), 0);
        const confirmedCnt = filteredRev.filter(b => b.status === 'confirmed').length;
        const avgBooking = confirmedCnt > 0 ? totalRev / confirmedCnt : 0;
        const commission = totalRev * 0.10;
        const netEarnings = totalRev * 0.90;
        const pendingRev = filteredRev.filter(b => b.status === 'pending').reduce((sum, b) => sum + parseFloat(b.total_price), 0);

        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
              <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--success-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TỔNG DOANH THU</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success-color)', margin: '8px 0 4px' }}>
                  {totalRev.toLocaleString()}đ
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Từ {confirmedCnt} lượt đặt phòng hoàn thành</span>
              </div>

              <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--secondary-base)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>DOANH THU THỰC NHẬN (90%)</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary-base)', margin: '8px 0 4px' }}>
                  {netEarnings.toLocaleString()}đ
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sau khi trừ 10% phí hoa hồng đại lý</span>
              </div>

              <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent-base)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CHIẾT KHẤU ĐẠI LÝ (10%)</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-base)', margin: '8px 0 4px' }}>
                  {commission.toLocaleString()}đ
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phí duy trì gian hàng online</span>
              </div>

              <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary-base)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>DOANH THU CHỜ DUYỆT</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-base)', margin: '8px 0 4px' }}>
                  {pendingRev.toLocaleString()}đ
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lượng đặt phòng đang chờ xác nhận</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h4 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} color="var(--secondary-base)" />
                  Bộ lọc báo cáo tài chính
                </h4>
                <button 
                  onClick={handleExportCSV}
                  className="btn btn-outline" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <Download size={16} />
                  Xuất Excel/CSV
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm mã đơn, tên khách, tên phòng..." 
                    value={revSearch}
                    onChange={(e) => setRevSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                  />
                </div>

                <select 
                  value={revStatus} 
                  onChange={(e) => setRevStatus(e.target.value)}
                  style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', backgroundColor: 'white' }}
                >
                  <option value="all">Tất cả trạng thái thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="unpaid">Chưa thanh toán</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>

                <select 
                  value={revDateRange} 
                  onChange={(e) => setRevDateRange(e.target.value)}
                  style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', backgroundColor: 'white' }}
                >
                  <option value="all">Mọi thời gian</option>
                  <option value="7days">7 ngày qua</option>
                  <option value="30days">30 ngày qua</option>
                  <option value="12months">12 tháng qua</option>
                </select>
              </div>
            </div>

            {/* List Table */}
            <div className="glass-card" style={{ padding: '24px' }}>
              {filteredRev.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <AlertCircle size={32} style={{ marginBottom: '10px' }} />
                  <p>Không có giao dịch đặt phòng nào khớp với bộ lọc.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <th style={{ padding: '12px 8px' }}>Mã Đơn</th>
                        <th style={{ padding: '12px 8px' }}>Khách Hàng</th>
                        <th style={{ padding: '12px 8px' }}>Khách Sạn & Loại Phòng</th>
                        <th style={{ padding: '12px 8px' }}>Ngày Đặt Phòng</th>
                        <th style={{ padding: '12px 8px' }}>Doanh Thu</th>
                        <th style={{ padding: '12px 8px' }}>Thực Nhận (90%)</th>
                        <th style={{ padding: '12px 8px' }}>Thanh Toán</th>
                        <th style={{ padding: '12px 8px' }}>Hành Động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRev.map((b) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                          <td style={{ padding: '12px 8px', fontWeight: 700 }}>BK-{b.id.toString().padStart(5, '0')}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <div>
                              <strong style={{ display: 'block' }}>{b.user_name}</strong>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user_email}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <div>
                              <strong style={{ display: 'block', color: 'var(--primary-base)' }}>{b.hotel_name}</strong>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.service_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px' }}>{new Date(b.booking_date).toLocaleDateString()}</td>
                          <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--success-color)' }}>
                            {parseInt(b.total_price).toLocaleString()}đ
                          </td>
                          <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--secondary-base)' }}>
                            {(parseInt(b.total_price) * 0.90).toLocaleString()}đ
                          </td>
                          <td style={{ padding: '12px 8px' }}>{getPaymentBadge(b.payment_status)}</td>
                          <td style={{ padding: '12px 8px' }}>
                            <button 
                              onClick={() => setSelectedInvoice(b)}
                              className="btn btn-outline" 
                              style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FileText size={12} /> Hóa Đơn
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* INVOICE DETAIL LIGHTBOX */}
      {selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '500px', width: '90%', padding: '30px', position: 'relative', borderRadius: 'var(--radius-md)' }}>
            <button 
              onClick={() => setSelectedInvoice(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              &times;
            </button>

            <div style={{ textAlign: 'center', borderBottom: '2px dashed var(--border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-base)', marginBottom: '4px' }}>HÓA ĐƠN DOANH THU ĐỐI TÁC</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mã hóa đơn: BK-{selectedInvoice.id.toString().padStart(5, '0')}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Khách hàng:</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedInvoice.user_name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email liên lạc:</span>
                <span>{selectedInvoice.user_email}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Khách sạn:</span>
                <strong style={{ color: 'var(--primary-base)' }}>{selectedInvoice.hotel_name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Loại phòng:</span>
                <span style={{ fontWeight: 600 }}>{selectedInvoice.service_name}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ngày đặt phòng:</span>
                <span>{new Date(selectedInvoice.booking_date).toLocaleDateString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Trạng thái đơn:</span>
                <span>{getStatusBadge(selectedInvoice.status)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Thanh toán:</span>
                <span>{getPaymentBadge(selectedInvoice.payment_status)}</span>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                  <span style={{ fontWeight: 'bold' }}>Doanh thu gộp:</span>
                  <strong style={{ color: 'var(--success-color)', fontSize: '1.1rem' }}>
                    {parseInt(selectedInvoice.total_price).toLocaleString()}đ
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--accent-base)' }}>
                  <span>Phí hoa hồng cổng đại lý (10%):</span>
                  <strong>{(parseInt(selectedInvoice.total_price) * 0.1).toLocaleString()}đ</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>Thực nhận đối tác (90%):</span>
                  <strong style={{ color: 'var(--secondary-base)', fontSize: '1.2rem' }}>
                    {(parseInt(selectedInvoice.total_price) * 0.9).toLocaleString()}đ
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => window.print()}
                className="btn btn-primary" 
                style={{ flex: 1, padding: '10px' }}
              >
                In hóa đơn
              </button>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="btn btn-outline" 
                style={{ flex: 1, padding: '10px' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOTEL DIALOG MODAL */}
      {showHotelModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '650px', width: '95%', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowHotelModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              &times;
            </button>

            <h3 style={{ textAlign: 'center', marginBottom: '20px', letterSpacing: '0.5px' }}>
              {editingHotel ? (lang === 'vi' ? 'CẬP NHẬT THÔNG TIN KHÁCH SẠN' : 'EDIT HOTEL DETAILS') : (lang === 'vi' ? 'ĐĂNG KÝ KHÁCH SẠN MỚI' : 'REGISTER NEW HOTEL')}
            </h3>

            <form onSubmit={handleSaveHotel} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {user.role === 'admin' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                    {lang === 'vi' ? 'Chủ Sở Hữu Khách Sạn (Đối tác) *' : 'Hotel Owner (Partner) *'}
                  </label>
                  <select 
                    name="owner_id"
                    required
                    value={hotelFormData.owner_id}
                    onChange={handleHotelFormChange}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'white', outline: 'none' }}
                  >
                    <option value="">-- {lang === 'vi' ? 'Chọn chủ sở hữu' : 'Select Owner'} --</option>
                    {usersList
                      .filter(u => u.role === 'hotel_owner' || u.role === 'admin')
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email} - {u.role === 'admin' ? 'Admin' : 'Chủ khách sạn'})
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Tên Khách Sạn *' : 'Hotel Name *'}</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={hotelFormData.name}
                  onChange={handleHotelFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Địa Chỉ Chi Tiết *' : 'Full Location Address *'}</label>
                <input 
                  type="text" 
                  name="location"
                  required
                  placeholder="Xã, Quận/Huyện, Tỉnh/Thành..."
                  value={hotelFormData.location}
                  onChange={handleHotelFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Giá Cơ Bản (VND/đêm) *' : 'Base Rate (VND/night) *'}</label>
                <input 
                  type="number" 
                  name="price_per_night"
                  required
                  min="0"
                  value={hotelFormData.price_per_night}
                  onChange={handleHotelFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Hạng Sao (1-5) *' : 'Star Rating (1-5) *'}</label>
                <input 
                  type="number" 
                  name="star_rating"
                  required
                  min="1"
                  max="5"
                  value={hotelFormData.star_rating}
                  onChange={handleHotelFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Vĩ Độ (Latitude)</label>
                <input 
                  type="number" 
                  step="any"
                  name="lat"
                  value={hotelFormData.lat}
                  onChange={handleHotelFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>Kinh Độ (Longitude)</label>
                <input 
                  type="number" 
                  step="any"
                  name="lng"
                  value={hotelFormData.lng}
                  onChange={handleHotelFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Đường Dẫn Ảnh Khách Sạn' : 'Hotel Exterior Image URL'}</label>
                <input 
                  type="text" 
                  name="image_url"
                  placeholder="https://images.unsplash.com/..."
                  value={hotelFormData.image_url}
                  onChange={handleHotelFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Mô Tả Khách Sạn' : 'Description / Facilities'}</label>
                <textarea 
                  name="description"
                  rows="3"
                  value={hotelFormData.description}
                  onChange={handleHotelFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', resize: 'vertical' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowHotelModal(false)} 
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  {lang === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="btn btn-primary"
                  style={{ padding: '8px 24px', fontSize: '0.9rem' }}
                >
                  {formLoading ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...') : (lang === 'vi' ? 'Lưu Lại' : 'Save')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ROOM DIALOG MODAL */}
      {showRoomModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '650px', width: '95%', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowRoomModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              &times;
            </button>

            <h3 style={{ textAlign: 'center', marginBottom: '20px', letterSpacing: '0.5px' }}>
              {editingRoom ? (lang === 'vi' ? 'CẬP NHẬT THÔNG TIN PHÒNG' : 'EDIT ROOM TYPE') : (lang === 'vi' ? 'THÊM LOẠI PHÒNG MỚI' : 'ADD NEW ROOM TYPE')}
            </h3>

            <form onSubmit={handleSaveRoom} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Tên Loại Phòng *' : 'Room Type Name *'}</label>
                <input 
                  type="text" 
                  name="room_type"
                  required
                  placeholder="Deluxe Ocean View, Executive Suite..."
                  value={roomFormData.room_type}
                  onChange={handleRoomFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Giá Bán (VND/đêm) *' : 'Price / Night (VND) *'}</label>
                <input 
                  type="number" 
                  name="price_per_night"
                  required
                  min="0"
                  value={roomFormData.price_per_night}
                  onChange={handleRoomFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Số Khách Tối Đa *' : 'Max Occupancy *'}</label>
                <input 
                  type="number" 
                  name="max_occupancy"
                  required
                  min="1"
                  value={roomFormData.max_occupancy}
                  onChange={handleRoomFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Số Lượng Phòng Loại Này Có Sẵn *' : 'Total Available Rooms of this Type *'}</label>
                <input 
                  type="number" 
                  name="total_rooms"
                  required
                  min="1"
                  value={roomFormData.total_rooms}
                  onChange={handleRoomFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Đường Dẫn Ảnh Phòng' : 'Room Interior Image URL'}</label>
                <input 
                  type="text" 
                  name="image_url"
                  placeholder="https://images.unsplash.com/..."
                  value={roomFormData.image_url}
                  onChange={handleRoomFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Mô Tả Chi Tiết' : 'Amenities / Description'}</label>
                <textarea 
                  name="description"
                  rows="3"
                  placeholder="Giường đôi lớn, ban công, bồn tắm nằm..."
                  value={roomFormData.description}
                  onChange={handleRoomFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', resize: 'vertical' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowRoomModal(false)} 
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  {lang === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="btn btn-primary"
                  style={{ padding: '8px 24px', fontSize: '0.9rem' }}
                >
                  {formLoading ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...') : (lang === 'vi' ? 'Lưu Lại' : 'Save')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerDashboard;
