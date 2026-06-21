import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Plus, Edit2, Trash2, Shield, Calendar, DollarSign, 
  Users, Briefcase, Tag, Compass, X, Check, Eye, AlertCircle,
  TrendingUp, Download, Search, FileText, Sliders
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, token, loading: authLoading } = useAuth();
  const { showAlert, showConfirm } = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [tours, setTours] = useState([]);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Revenue Filter & Lightbox States
  const [revSearch, setRevSearch] = useState('');
  const [revType, setRevType] = useState('all');
  const [revStatus, setRevStatus] = useState('all');
  const [revDateRange, setRevDateRange] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Tour Form State (for Create/Edit)
  const [showTourModal, setShowTourModal] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    duration_days: 1,
    duration_nights: 0,
    price: 0,
    image_url: '',
    start_date: '',
    max_participants: 20,
    highlights: '',
    itinerary_preview: ''
  });

  // Flight Form State (for Create/Edit)
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [flightFormData, setFlightFormData] = useState({
    airline: '',
    flight_number: '',
    departure_airport: '',
    arrival_airport: '',
    departure_time: '',
    price: 0,
    duration: ''
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

  // Protection Check: Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      showAlert(
        lang === 'vi' ? 'Bạn không có quyền truy cập trang quản trị!' : 'Unauthorized access to admin panel!',
        'error',
        lang === 'vi' ? 'Từ chối truy cập' : 'Access Denied'
      );
      navigate('/');
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadDashboardData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTours(), fetchAllBookings(), fetchUsers(), fetchFlights()]);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTours = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/tours');
      if (res.ok) {
        const data = await res.json();
        setTours(data);
      }
    } catch (err) {
      console.error('Error fetching tours:', err);
    }
  };

  const fetchFlights = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/suppliers/flights');
      if (res.ok) {
        const data = await res.json();
        setFlights(data);
      }
    } catch (err) {
      console.error('Error fetching flights:', err);
    }
  };

  // Flight CRUD Actions
  const handleOpenFlightCreateModal = () => {
    setEditingFlight(null);
    setFlightFormData({
      airline: '',
      flight_number: '',
      departure_airport: '',
      arrival_airport: '',
      departure_time: '',
      price: 0,
      duration: ''
    });
    setShowFlightModal(true);
  };

  const handleOpenFlightEditModal = (flight) => {
    setEditingFlight(flight);
    let formattedDateTime = '';
    if (flight.departure_time) {
      const date = new Date(flight.departure_time);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
      formattedDateTime = localISOTime;
    }
    setFlightFormData({
      airline: flight.airline || '',
      flight_number: flight.flight_number || '',
      departure_airport: flight.departure_airport || '',
      arrival_airport: flight.arrival_airport || '',
      departure_time: formattedDateTime,
      price: flight.price || 0,
      duration: flight.duration || ''
    });
    setShowFlightModal(true);
  };

  const handleFlightFormChange = (e) => {
    const { name, value } = e.target;
    setFlightFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleSaveFlight = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const url = editingFlight 
      ? `http://localhost:5001/api/suppliers/flights/${editingFlight.id}` 
      : 'http://localhost:5001/api/suppliers/flights';
    const method = editingFlight ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(flightFormData)
      });

      const data = await res.json();
      if (res.ok) {
        await showAlert(
          lang === 'vi' 
            ? (editingFlight ? 'Cập nhật chuyến bay thành công!' : 'Đã tạo chuyến bay mới thành công!') 
            : (editingFlight ? 'Flight updated successfully!' : 'New flight created successfully!'),
          'success',
          lang === 'vi' ? 'Thành công' : 'Success'
        );
        setShowFlightModal(false);
        fetchFlights();
      } else {
        await showAlert(data.message || 'Lỗi khi lưu thông tin chuyến bay', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteFlight = async (flightId, flightNum) => {
    const confirmMsg = lang === 'vi'
      ? `Bạn có chắc chắn muốn xóa chuyến bay số hiệu "${flightNum}" không? Hành động này không thể hoàn tác.`
      : `Are you sure you want to delete flight "${flightNum}"? This action cannot be undone.`;

    const isConfirmed = await showConfirm(
      confirmMsg,
      lang === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete',
      'danger'
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5001/api/suppliers/flights/${flightId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        await showAlert(lang === 'vi' ? 'Đã xóa chuyến bay thành công!' : 'Flight deleted successfully!', 'success', lang === 'vi' ? 'Đã xóa' : 'Deleted');
        fetchFlights();
      } else {
        const data = await res.json();
        await showAlert(data.message || 'Lỗi khi xóa chuyến bay', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    }
  };

  const fetchAllBookings = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/bookings/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching system bookings:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error('Error fetching users list:', err);
    }
  };

  // Metrics helper
  const getMetrics = () => {
    const totalTours = tours.length;
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + parseFloat(b.total_price), 0);
    const uniqueUsers = usersList.length;

    return { totalTours, totalBookings, totalRevenue, uniqueUsers };
  };

  // Tour CRUD Actions
  const handleOpenCreateModal = () => {
    setEditingTour(null);
    setFormData({
      title: '',
      description: '',
      destination: '',
      duration_days: 1,
      duration_nights: 0,
      price: 0,
      image_url: '',
      start_date: '',
      max_participants: 20,
      highlights: '',
      itinerary_preview: ''
    });
    setShowTourModal(true);
  };

  const handleOpenEditModal = (tour) => {
    setEditingTour(tour);
    
    // Format start_date to YYYY-MM-DD for the date input field
    let formattedDate = '';
    if (tour.start_date) {
      formattedDate = new Date(tour.start_date).toISOString().split('T')[0];
    }

    setFormData({
      title: tour.title || '',
      description: tour.description || '',
      destination: tour.destination || '',
      duration_days: tour.duration_days || 1,
      duration_nights: tour.duration_nights || 0,
      price: tour.price || 0,
      image_url: tour.image_url || '',
      start_date: formattedDate,
      max_participants: tour.max_participants || 20,
      highlights: tour.highlights || '',
      itinerary_preview: tour.itinerary_preview || ''
    });
    setShowTourModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('duration') || name === 'price' || name === 'max_participants'
        ? Number(value)
        : value
    }));
  };

  const handleSaveTour = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const url = editingTour 
      ? `http://localhost:5001/api/tours/${editingTour.id}` 
      : 'http://localhost:5001/api/tours';
    const method = editingTour ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        await showAlert(
          lang === 'vi' 
            ? (editingTour ? 'Cập nhật tour thành công!' : 'Đã tạo tour mới thành công!') 
            : (editingTour ? 'Tour updated successfully!' : 'New tour created successfully!'),
          'success',
          lang === 'vi' ? 'Thành công' : 'Success'
        );
        setShowTourModal(false);
        fetchTours();
      } else {
        await showAlert(data.message || 'Lỗi khi lưu thông tin tour', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTour = async (tourId, tourTitle) => {
    const confirmMsg = lang === 'vi'
      ? `Bạn có chắc chắn muốn xóa tour "${tourTitle}" không? Hành động này không thể hoàn tác.`
      : `Are you sure you want to delete the tour "${tourTitle}"? This action cannot be undone.`;

    const isConfirmed = await showConfirm(
      confirmMsg,
      lang === 'vi' ? 'Xác nhận xóa' : 'Confirm Delete',
      'danger'
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5001/api/tours/${tourId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        await showAlert(lang === 'vi' ? 'Đã xóa tour thành công!' : 'Tour deleted successfully!', 'success', lang === 'vi' ? 'Đã xóa' : 'Deleted');
        fetchTours();
      } else {
        const data = await res.json();
        await showAlert(data.message || 'Lỗi khi xóa tour', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    }
  };

  // Booking Actions
  const handleCancelBooking = async (bookingId) => {
    const confirmMsg = lang === 'vi'
      ? `Bạn có chắc chắn muốn hủy đơn đặt chỗ #BK-${bookingId.toString().padStart(5, '0')} của hệ thống không?`
      : `Are you sure you want to cancel the booking #BK-${bookingId.toString().padStart(5, '0')}?`;

    const isConfirmed = await showConfirm(
      confirmMsg,
      lang === 'vi' ? 'Xác nhận hủy đơn hàng' : 'Confirm Booking Cancellation',
      'warning'
    );
    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5001/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        await showAlert(lang === 'vi' ? 'Đã hủy đặt chỗ thành công!' : 'Booking cancelled successfully!', 'success', lang === 'vi' ? 'Đã hủy' : 'Cancelled');
        fetchAllBookings();
      } else {
        const data = await res.json();
        await showAlert(data.message || 'Lỗi khi hủy đặt chỗ', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    }
  };

  // User/Owner role management actions
  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await fetch(`http://localhost:5001/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (res.ok) {
        await showAlert(
          lang === 'vi' ? 'Cập nhật vai trò tài khoản thành công!' : 'Account role updated successfully!', 
          'success', 
          lang === 'vi' ? 'Thành công' : 'Success'
        );
        fetchUsers();
      } else {
        await showAlert(data.message || 'Lỗi khi cập nhật vai trò', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    }
  };

  const handleDeleteUserAccount = async (userId, userName) => {
    const confirmMsg = lang === 'vi'
      ? `Bạn có chắc chắn muốn xóa tài khoản "${userName}" không? Thao tác này sẽ xóa tất cả dữ liệu liên quan.`
      : `Are you sure you want to delete account "${userName}"? This will delete all related records.`;
    
    const isConfirmed = await showConfirm(confirmMsg, lang === 'vi' ? 'Xác nhận xóa tài khoản' : 'Delete Account Confirmation', 'danger');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5001/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        await showAlert(
          lang === 'vi' ? 'Đã xóa tài khoản thành công!' : 'Account deleted successfully!', 
          'success',
          lang === 'vi' ? 'Thành công' : 'Success'
        );
        fetchUsers();
      } else {
        await showAlert(data.message || 'Lỗi khi xóa tài khoản', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    }
  };

  // Status badgers helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge badge-success">{lang === 'vi' ? 'Đã Xác Nhận' : 'Confirmed'}</span>;
      case 'pending':
        return <span className="badge badge-warning">{lang === 'vi' ? 'Chờ Xử Lý' : 'Pending'}</span>;
      case 'cancelled':
        return <span className="badge badge-danger">{lang === 'vi' ? 'Đã Hủy' : 'Cancelled'}</span>;
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
      case 'refunded':
        return <span className="badge badge-info">{lang === 'vi' ? 'Đã Hoàn Tiền' : 'Refunded'}</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ border: '4px solid #E2E8F0', borderTop: '4px solid var(--secondary-base)', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
        <p>{lang === 'vi' ? 'Đang tải dữ liệu trang quản trị...' : 'Loading admin portal data...'}</p>
      </div>
    );
  }

  // Double safety return
  if (!user || user.role !== 'admin') return null;

  const metrics = getMetrics();

  const t = {
    vi: {
      title: 'Hệ Thống Quản Trị Viên',
      desc: 'Quản lý tour du lịch, giám sát các hoạt động đặt chỗ, phân quyền tài khoản và xem tổng quan doanh thu.',
      tabOverview: 'Tổng Quan',
      tabTours: 'Quản Lý Tour',
      tabBookings: 'Quản Lý Đặt Chỗ',
      tabAccounts: 'Quản Lý Tài Khoản',
      cardTours: 'Tổng số Tour',
      cardBookings: 'Đơn Đặt Chỗ',
      cardRevenue: 'Tổng Doanh Thu',
      cardCustomers: 'Người Dùng Hệ Thống',
      addNewTour: 'Thêm Tour Mới',
      edit: 'Sửa',
      delete: 'Xóa',
      cancelBooking: 'Hủy Đơn',
      colTitle: 'Tên Tour / Điểm đến',
      colPrice: 'Đơn Giá',
      colDuration: 'Thời Lượng',
      colMaxPart: 'Tối Đa',
      colActions: 'Hành Động',
      colCustomer: 'Khách hàng',
      colService: 'Dịch vụ',
      colDate: 'Ngày Đặt',
      colStatus: 'Trạng Thái',
      colPayment: 'Thanh Toán',
      colEmail: 'Email',
      colPhone: 'Số Điện Thoại',
      colRole: 'Vai Trò',
      roleAdmin: 'Quản trị viên',
      roleOwner: 'Chủ khách sạn',
      roleUser: 'Thành viên',
      modalCreateTitle: 'TẠO TOUR DU LỊCH MỚI',
      modalEditTitle: 'CẬP NHẬT THÔNG TIN TOUR',
      formTitle: 'Tiêu đề Tour *',
      formDest: 'Điểm đến *',
      formPrice: 'Giá bán (VND) *',
      formDays: 'Số Ngày *',
      formNights: 'Số Đêm *',
      formMax: 'Giới hạn số khách *',
      formStartDate: 'Ngày Khởi Hành',
      formImage: 'Đường dẫn Ảnh đại diện',
      formDesc: 'Mô tả chi tiết',
      formHighlights: 'Điểm nổi bật (Cách nhau bởi dấu phẩy)',
      formItinerary: 'Lịch trình sơ bộ (Ngày 1: ... | Ngày 2: ...)',
      btnSave: 'Lưu thay đổi',
      btnCancel: 'Hủy bỏ',
      emptyTours: 'Không có tour nào trong cơ sở dữ liệu.',
      emptyBookings: 'Hệ thống chưa có đơn đặt chỗ nào.',
      emptyUsers: 'Không tìm thấy người dùng nào.'
    },
    en: {
      title: 'Administrator Dashboard',
      desc: 'Coordinate travel products, audit reservations, manage user accounts/roles, and monitor system sales.',
      tabOverview: 'Overview',
      tabTours: 'Tour Manager',
      tabBookings: 'Bookings Audit',
      tabAccounts: 'Account Manager',
      cardTours: 'Total Active Tours',
      cardBookings: 'Total Bookings',
      cardRevenue: 'Accumulated Revenue',
      cardCustomers: 'System Users',
      addNewTour: 'Create New Tour',
      edit: 'Edit',
      delete: 'Delete',
      cancelBooking: 'Cancel Order',
      colTitle: 'Tour Title / Location',
      colPrice: 'Price',
      colDuration: 'Duration',
      colMaxPart: 'Capacity',
      colActions: 'Actions',
      colCustomer: 'Customer',
      colService: 'Service',
      colDate: 'Order Date',
      colStatus: 'Status',
      colPayment: 'Payment',
      colEmail: 'Email Address',
      colPhone: 'Phone Number',
      colRole: 'System Role',
      roleAdmin: 'Admin',
      roleOwner: 'Hotel Owner',
      roleUser: 'User / Guest',
      modalCreateTitle: 'CREATE NEW TOUR ROUTE',
      modalEditTitle: 'EDIT TOUR PRODUCT DETAILS',
      formTitle: 'Tour Title *',
      formDest: 'Destination *',
      formPrice: 'Retail Price (VND) *',
      formDays: 'Duration Days *',
      formNights: 'Duration Nights *',
      formMax: 'Max Capacity *',
      formStartDate: 'Departure Date',
      formImage: 'Feature Image URL',
      formDesc: 'Full Description',
      formHighlights: 'Highlights (Separated by commas)',
      formItinerary: 'Itinerary Outline (Day 1: ... | Day 2: ...)',
      btnSave: 'Save Product',
      btnCancel: 'Cancel',
      emptyTours: 'No tour entities found in MySQL.',
      emptyBookings: 'No booking orders filed in system.',
      emptyUsers: 'No user accounts found.'
    }
  }[lang];

  const getFilteredRevenueBookings = () => {
    return bookings.filter(b => {
      const matchesSearch = 
        !revSearch || 
        b.user_name?.toLowerCase().includes(revSearch.toLowerCase()) ||
        b.user_email?.toLowerCase().includes(revSearch.toLowerCase()) ||
        b.service_name?.toLowerCase().includes(revSearch.toLowerCase()) ||
        `BK-${b.id.toString().padStart(5, '0')}`.toLowerCase().includes(revSearch.toLowerCase());

      const matchesType = revType === 'all' || b.type === revType;
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

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  };

  const handleExportCSV = () => {
    const filtered = getFilteredRevenueBookings();
    const headers = ['Ma Don', 'Khach hang', 'Email', 'Loai dich vu', 'Ten dich vu', 'Ngay Dat', 'Doanh thu (VND)', 'Trang thai', 'Thanh toan'];
    const rows = filtered.map(b => [
      `BK-${b.id.toString().padStart(5, '0')}`,
      b.user_name,
      b.user_email,
      b.type.toUpperCase(),
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
    link.setAttribute("download", `bao_cao_doanh_thu_admin_${new Date().toISOString().split('T')[0]}.csv`);
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
            <Shield size={32} color="var(--secondary-base)" />
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
          onClick={() => setActiveTab('tours')} 
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'tours' ? 'var(--primary-base)' : 'transparent', 
            color: activeTab === 'tours' ? 'white' : 'var(--text-main)',
            padding: '8px 16px',
            fontSize: '0.9rem'
          }}
        >
          {t.tabTours}
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
          onClick={() => setActiveTab('accounts')} 
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'accounts' ? 'var(--primary-base)' : 'transparent', 
            color: activeTab === 'accounts' ? 'white' : 'var(--text-main)',
            padding: '8px 16px',
            fontSize: '0.9rem'
          }}
        >
          {t.tabAccounts}
        </button>
        <button 
          onClick={() => setActiveTab('flights')} 
          className="btn" 
          style={{ 
            backgroundColor: activeTab === 'flights' ? 'var(--primary-base)' : 'transparent', 
            color: activeTab === 'flights' ? 'white' : 'var(--text-main)',
            padding: '8px 16px',
            fontSize: '0.9rem'
          }}
        >
          {lang === 'vi' ? 'Quản Lý Chuyến Bay' : 'Flight Tickets'}
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
      {activeTab === 'overview' && (
        <div>
          {/* Summary grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            
            <div className="glass-card hover-lift" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ backgroundColor: 'rgba(49, 151, 149, 0.1)', color: 'var(--secondary-base)', padding: '16px', borderRadius: '50%' }}>
                <Compass size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.cardTours}</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{metrics.totalTours}</h2>
              </div>
            </div>

            <div className="glass-card hover-lift" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ backgroundColor: 'rgba(26, 54, 93, 0.1)', color: 'var(--primary-base)', padding: '16px', borderRadius: '50%' }}>
                <Briefcase size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.cardBookings}</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{metrics.totalBookings}</h2>
              </div>
            </div>

            <div className="glass-card hover-lift" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ backgroundColor: 'rgba(56, 161, 105, 0.1)', color: 'var(--success-color)', padding: '16px', borderRadius: '50%' }}>
                <DollarSign size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.cardRevenue}</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success-color)' }}>
                  {metrics.totalRevenue.toLocaleString()}đ
                </h2>
              </div>
            </div>

            <div className="glass-card hover-lift" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ backgroundColor: 'rgba(214, 158, 46, 0.1)', color: 'var(--accent-base)', padding: '16px', borderRadius: '50%' }}>
                <Users size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.cardCustomers}</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{metrics.uniqueUsers}</h2>
              </div>
            </div>

          </div>

          {/* Quick lists */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', flexWrap: 'wrap' }}>
            {/* Recent Bookings */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{lang === 'vi' ? 'Giao Dịch Gần Đây' : 'Recent Bookings'}</span>
                <button onClick={() => setActiveTab('bookings')} style={{ background: 'none', border: 'none', color: 'var(--secondary-base)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                  {lang === 'vi' ? 'Xem tất cả' : 'View all'}
                </button>
              </h3>
              
              {bookings.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.emptyBookings}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {bookings.slice(0, 5).map(b => (
                    <div key={b.id} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem', display: 'block' }}>{b.service_name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user_name} ({new Date(b.booking_date).toLocaleDateString()})</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', color: 'var(--primary-base)' }}>
                          {parseInt(b.total_price).toLocaleString()}đ
                        </span>
                        {getStatusBadge(b.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Tours */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{lang === 'vi' ? 'Danh Sách Tour Hiện Tại' : 'Current Active Tours'}</span>
                <button onClick={() => setActiveTab('tours')} style={{ background: 'none', border: 'none', color: 'var(--secondary-base)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                  {lang === 'vi' ? 'Quản lý tour' : 'Manage tours'}
                </button>
              </h3>

              {tours.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.emptyTours}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tours.slice(0, 5).map(tour => (
                    <div key={tour.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={tour.image_url} alt={tour.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div>
                          <strong style={{ fontSize: '0.9rem', display: 'block' }}>{tour.title}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tour.destination}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--secondary-base)' }}>
                          {parseInt(tour.price).toLocaleString()}đ
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                          {tour.duration_days}N/{tour.duration_nights}Đ
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: TOURS MANAGEMENT */}
      {activeTab === 'tours' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>{lang === 'vi' ? 'Danh sách Gói Tour Du Lịch' : 'Active Tour Products'}</h3>
            <button onClick={handleOpenCreateModal} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={16} />
              {t.addNewTour}
            </button>
          </div>

          {tours.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ marginBottom: '10px' }} />
              <p>{t.emptyTours}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px 8px' }}>ID</th>
                    <th style={{ padding: '12px 8px' }}>{t.colTitle}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colDuration}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colPrice}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colMaxPart}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.map((tour) => (
                    <tr key={tour.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-muted)' }}>#{tour.id}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={tour.image_url} alt={tour.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          <div>
                            <strong style={{ display: 'block', color: 'var(--primary-base)' }}>{tour.title}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tour.destination}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                        {tour.duration_days}N/{tour.duration_nights}Đ
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--secondary-base)' }}>
                        {parseInt(tour.price).toLocaleString()}đ
                      </td>
                      <td style={{ padding: '12px 8px' }}>{tour.max_participants} {lang === 'vi' ? 'khách' : 'pax'}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleOpenEditModal(tour)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--primary-base)' }}>
                            <Edit2 size={12} /> {t.edit}
                          </button>
                          <button onClick={() => handleDeleteTour(tour.id, tour.title)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
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

      {/* TAB: FLIGHTS MANAGEMENT */}
      {activeTab === 'flights' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>{lang === 'vi' ? 'Danh sách Chuyến Bay Hệ Thống' : 'System Flight Database'}</h3>
            <button onClick={handleOpenFlightCreateModal} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={16} />
              {lang === 'vi' ? 'Thêm Chuyến Bay Mới' : 'Create Flight'}
            </button>
          </div>

          {flights.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ marginBottom: '10px' }} />
              <p>{lang === 'vi' ? 'Không có chuyến bay nào trong cơ sở dữ liệu.' : 'No flights found in database.'}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px 8px' }}>ID</th>
                    <th style={{ padding: '12px 8px' }}>{lang === 'vi' ? 'Hãng Hàng Không' : 'Airline'}</th>
                    <th style={{ padding: '12px 8px' }}>{lang === 'vi' ? 'Số Hiệu' : 'Flight Number'}</th>
                    <th style={{ padding: '12px 8px' }}>{lang === 'vi' ? 'Tuyến Bay' : 'Route'}</th>
                    <th style={{ padding: '12px 8px' }}>{lang === 'vi' ? 'Giờ Khởi Hành' : 'Departure Time'}</th>
                    <th style={{ padding: '12px 8px' }}>{lang === 'vi' ? 'Thời Lượng' : 'Duration'}</th>
                    <th style={{ padding: '12px 8px' }}>{lang === 'vi' ? 'Giá Vé' : 'Price'}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map((flight) => (
                    <tr key={flight.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-muted)' }}>#{flight.id}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--primary-base)' }}>{flight.airline}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 700 }}>{flight.flight_number}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ fontWeight: 500 }}>{flight.departure_airport}</span>
                        <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>&rarr;</span>
                        <span style={{ fontWeight: 500 }}>{flight.arrival_airport}</span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>{new Date(flight.departure_time).toLocaleString()}</td>
                      <td style={{ padding: '12px 8px' }}>{flight.duration}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--secondary-base)' }}>
                        {parseInt(flight.price).toLocaleString()}đ
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleOpenFlightEditModal(flight)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--primary-base)' }}>
                            <Edit2 size={12} /> {t.edit}
                          </button>
                          <button onClick={() => handleDeleteFlight(flight.id, flight.flight_number)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
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

      {/* TAB: BOOKINGS MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>{lang === 'vi' ? 'Lịch sử Đặt chỗ Toàn hệ thống' : 'All System Booking Invoices'}</h3>

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
                    <th style={{ padding: '12px 8px' }}>{t.colService}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colDate}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colPrice}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colStatus}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colPayment}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge badge-info">{booking.type.toUpperCase()}</span>
                          <span style={{ fontWeight: 500 }} title={booking.service_name}>
                            {booking.service_name && booking.service_name.length > 25 
                              ? booking.service_name.substr(0, 25) + '...' 
                              : booking.service_name}
                          </span>
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
                        {booking.status !== 'cancelled' ? (
                          <button 
                            onClick={() => handleCancelBooking(booking.id)} 
                            className="btn btn-outline" 
                            style={{ 
                              padding: '4px 10px', 
                              fontSize: '0.75rem', 
                              borderColor: 'var(--danger-color)', 
                              color: 'var(--danger-color)' 
                            }}
                          >
                            <X size={12} /> {t.cancelBooking}
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            {lang === 'vi' ? 'Đã hủy đơn' : 'Cancelled'}
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

      {/* TAB: ACCOUNTS MANAGEMENT (Users, Owners, Admins) */}
      {activeTab === 'accounts' && (
        <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>{lang === 'vi' ? 'Quản lý Tài khoản & Phân quyền' : 'Account Management & Authorization'}</h3>
          {usersList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <AlertCircle size={32} style={{ marginBottom: '10px' }} />
              <p>{t.emptyUsers}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '12px 8px' }}>UID</th>
                    <th style={{ padding: '12px 8px' }}>Tên người dùng</th>
                    <th style={{ padding: '12px 8px' }}>{t.colEmail}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colPhone}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colRole}</th>
                    <th style={{ padding: '12px 8px' }}>{t.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((usr) => (
                    <tr key={usr.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-muted)' }}>#{usr.id}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--primary-base)' }}>{usr.name}</td>
                      <td style={{ padding: '12px 8px' }}>{usr.email}</td>
                      <td style={{ padding: '12px 8px' }}>{usr.phone || 'N/A'}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <select 
                          value={usr.role}
                          disabled={usr.id === user.id} // Don't edit own role
                          onChange={(e) => handleUpdateRole(usr.id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            fontWeight: 600,
                            color: usr.role === 'admin' ? 'var(--danger-color)' : usr.role === 'hotel_owner' ? 'var(--secondary-base)' : 'var(--text-main)',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="user">{t.roleUser}</option>
                          <option value="hotel_owner">{t.roleOwner}</option>
                          <option value="admin">{t.roleAdmin}</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <button 
                          onClick={() => handleDeleteUserAccount(usr.id, usr.name)} 
                          disabled={usr.id === user.id} // Don't delete own account
                          className="btn btn-danger" 
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '0.75rem',
                            opacity: usr.id === user.id ? 0.5 : 1,
                            cursor: usr.id === user.id ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <Trash2 size={12} /> {t.delete}
                        </button>
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
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Từ {confirmedCnt} đơn hàng đã hoàn tất</span>
              </div>

              <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--secondary-base)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>GIÁ TRỊ TRUNG BÌNH</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary-base)', margin: '8px 0 4px' }}>
                  {Math.round(avgBooking).toLocaleString()}đ
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mỗi đơn hàng thành công</span>
              </div>

              <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent-base)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>HOA HỒNG HỆ THỐNG (10%)</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-base)', margin: '8px 0 4px' }}>
                  {commission.toLocaleString()}đ
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phí vận hành cổng thanh toán</span>
              </div>

              <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary-base)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>DOANH THU CHỜ DUYỆT</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-base)', margin: '8px 0 4px' }}>
                  {pendingRev.toLocaleString()}đ
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Giá trị các đơn hàng đang xử lý</span>
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

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm mã đơn, khách hàng, tên dịch vụ..." 
                    value={revSearch}
                    onChange={(e) => setRevSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                  />
                </div>

                <select 
                  value={revType} 
                  onChange={(e) => setRevType(e.target.value)}
                  style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', backgroundColor: 'white' }}
                >
                  <option value="all">Tất cả dịch vụ</option>
                  <option value="hotel">Khách sạn</option>
                  <option value="flight">Chuyến bay</option>
                  <option value="tour">Tour du lịch</option>
                </select>

                <select 
                  value={revStatus} 
                  onChange={(e) => setRevStatus(e.target.value)}
                  style={{ padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', backgroundColor: 'white' }}
                >
                  <option value="all">Tất cả thanh toán</option>
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
                  <p>Không có giao dịch nào khớp với bộ lọc.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <th style={{ padding: '12px 8px' }}>Mã Hóa Đơn</th>
                        <th style={{ padding: '12px 8px' }}>Khách Hàng</th>
                        <th style={{ padding: '12px 8px' }}>Dịch Vụ</th>
                        <th style={{ padding: '12px 8px' }}>Ngày Giao Dịch</th>
                        <th style={{ padding: '12px 8px' }}>Doanh Thu</th>
                        <th style={{ padding: '12px 8px' }}>Hoa Hồng (10%)</th>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="badge badge-info">{b.type.toUpperCase()}</span>
                              <span style={{ fontWeight: 500 }}>{b.service_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 8px' }}>{new Date(b.booking_date).toLocaleDateString()}</td>
                          <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--primary-base)' }}>
                            {parseInt(b.total_price).toLocaleString()}đ
                          </td>
                          <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--accent-base)' }}>
                            {(parseInt(b.total_price) * 0.10).toLocaleString()}đ
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

      {/* INVOICE DETAIL MODAL */}
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
              <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-base)', marginBottom: '4px' }}>HÓA ĐƠN DOANH THU</h3>
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
                <span style={{ color: 'var(--text-muted)' }}>Loại dịch vụ:</span>
                <span className="badge badge-info">{selectedInvoice.type.toUpperCase()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tên dịch vụ:</span>
                <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '250px' }}>{selectedInvoice.service_name}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ngày đặt hàng:</span>
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
                  <span style={{ fontWeight: 'bold' }}>Tổng thanh toán:</span>
                  <strong style={{ color: 'var(--secondary-base)', fontSize: '1.2rem' }}>
                    {parseInt(selectedInvoice.total_price).toLocaleString()}đ
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--accent-base)' }}>
                  <span>Chiết khấu hệ thống (10%):</span>
                  <strong>{(parseInt(selectedInvoice.total_price) * 0.1).toLocaleString()}đ</strong>
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

      {/* CREATE & EDIT TOUR MODAL */}
      {showTourModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '750px', width: '95%', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowTourModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              &times;
            </button>

            <h3 style={{ textAlign: 'center', marginBottom: '20px', letterSpacing: '0.5px' }}>
              {editingTour ? t.modalEditTitle : t.modalCreateTitle}
            </h3>

            <form onSubmit={handleSaveTour} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{t.formTitle}</label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{t.formDest}</label>
                <input 
                  type="text" 
                  name="destination"
                  required
                  value={formData.destination}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{t.formPrice}</label>
                <input 
                  type="number" 
                  name="price"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{t.formDays}</label>
                <input 
                  type="number" 
                  name="duration_days"
                  required
                  min="1"
                  value={formData.duration_days}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{t.formNights}</label>
                <input 
                  type="number" 
                  name="duration_nights"
                  required
                  min="0"
                  value={formData.duration_nights}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{t.formMax}</label>
                <input 
                  type="number" 
                  name="max_participants"
                  required
                  min="1"
                  value={formData.max_participants}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{t.formStartDate}</label>
                <input 
                  type="date" 
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{t.formImage}</label>
                <input 
                  type="text" 
                  name="image_url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{t.formDesc}</label>
                <textarea 
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', resize: 'vertical' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{t.formHighlights}</label>
                <input 
                  type="text" 
                  name="highlights"
                  placeholder="Hành trình 5 sao, Buffet hải sản cao cấp, Khám phá vịnh biển..."
                  value={formData.highlights}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{t.formItinerary}</label>
                <textarea 
                  name="itinerary_preview"
                  rows="2"
                  placeholder="Ngày 1: Hà Nội - Hạ Long | Ngày 2: Vịnh Hạ Long - Hà Nội"
                  value={formData.itinerary_preview}
                  onChange={handleFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', resize: 'vertical' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowTourModal(false)} 
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  {t.btnCancel}
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="btn btn-primary"
                  style={{ padding: '8px 24px', fontSize: '0.9rem' }}
                >
                  {formLoading ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...') : t.btnSave}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CREATE & EDIT FLIGHT MODAL */}
      {showFlightModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '650px', width: '95%', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setShowFlightModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              &times;
            </button>

            <h3 style={{ textAlign: 'center', marginBottom: '20px', letterSpacing: '0.5px' }}>
              {editingFlight ? (lang === 'vi' ? 'CẬP NHẬT THÔNG TIN CHUYẾN BAY' : 'EDIT FLIGHT DATA') : (lang === 'vi' ? 'TẠO CHUYẾN BAY MỚI' : 'CREATE NEW FLIGHT')}
            </h3>

            <form onSubmit={handleSaveFlight} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Hãng Hàng Không *' : 'Airline *'}</label>
                <input 
                  type="text" 
                  name="airline"
                  required
                  placeholder="e.g. Vietnam Airlines"
                  value={flightFormData.airline}
                  onChange={handleFlightFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Số Hiệu Chuyến Bay *' : 'Flight Number *'}</label>
                <input 
                  type="text" 
                  name="flight_number"
                  required
                  placeholder="e.g. VN213"
                  value={flightFormData.flight_number}
                  onChange={handleFlightFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Sân Bay Đi *' : 'Departure Airport *'}</label>
                <input 
                  type="text" 
                  name="departure_airport"
                  required
                  placeholder="e.g. HAN (Hà Nội)"
                  value={flightFormData.departure_airport}
                  onChange={handleFlightFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Sân Bay Đến *' : 'Arrival Airport *'}</label>
                <input 
                  type="text" 
                  name="arrival_airport"
                  required
                  placeholder="e.g. SGN (TP. HCM)"
                  value={flightFormData.arrival_airport}
                  onChange={handleFlightFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Thời Gian Khởi Hành *' : 'Departure Time *'}</label>
                <input 
                  type="datetime-local" 
                  name="departure_time"
                  required
                  value={flightFormData.departure_time}
                  onChange={handleFlightFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Thời Gian Bay *' : 'Flight Duration *'}</label>
                <input 
                  type="text" 
                  name="duration"
                  required
                  placeholder="e.g. 2h 10m"
                  value={flightFormData.duration}
                  onChange={handleFlightFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{lang === 'vi' ? 'Đơn Giá Vé (VND) *' : 'Ticket Price (VND) *'}</label>
                <input 
                  type="number" 
                  name="price"
                  required
                  min="0"
                  value={flightFormData.price}
                  onChange={handleFlightFormChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowFlightModal(false)} 
                  className="btn btn-outline"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  {t.btnCancel}
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="btn btn-primary"
                  style={{ padding: '8px 24px', fontSize: '0.9rem' }}
                >
                  {formLoading ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...') : t.btnSave}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default AdminDashboard;
