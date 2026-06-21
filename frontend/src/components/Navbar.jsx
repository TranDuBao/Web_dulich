import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Globe, User, LogOut, Briefcase, Calendar, Compass, 
  Shield, Building, ChevronDown, Settings, CreditCard 
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, login, register } = useAuth();
  const { showAlert } = useNotification();
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Scrolled & Location states
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const isTransparentPage = ['/', '/booking-services', '/trip-builder'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'vi' ? 'en' : 'vi';
    setLang(nextLang);
    localStorage.setItem('lang', nextLang);
    window.dispatchEvent(new Event('languageChange'));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(name, email, password, phone);
        setShowAuthModal(false);
        resetForm();
        await showAlert(
          lang === 'vi' ? 'Đăng ký tài khoản thành công! Chào mừng bạn đến với DuBaoTravel.' : 'Account registered successfully! Welcome to DuBaoTravel.',
          'success',
          lang === 'vi' ? 'Đăng ký thành công' : 'Registration Successful'
        );
      } else {
        await login(email, password);
        setShowAuthModal(false);
        resetForm();
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Xác thực thất bại. Vui lòng thử lại.');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError('');
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const t = {
    vi: {
      tours: 'Tìm Tour',
      hotelsFlights: 'Vé & Khách Sạn',
      tripBuilder: 'Thiết Kế Lịch Trình',
      myBookings: 'Đơn hàng của tôi',
      login: 'Đăng nhập',
      logout: 'Đăng xuất',
      register: 'Đăng ký',
      name: 'Họ và tên',
      password: 'Mật khẩu',
      phone: 'Số điện thoại',
      noAccount: 'Chưa có tài khoản? Đăng ký ngay',
      hasAccount: 'Đã có tài khoản? Đăng nhập',
      authTitle: isRegister ? 'TẠO TÀI KHOẢN MỚI' : 'ĐĂNG NHẬP HỆ THỐNG',
      adminPanel: 'Trang quản trị',
      partnerPanel: 'Kênh đối tác',
      hello: 'Xin chào',
      roleAdmin: 'Quản trị viên',
      roleOwner: 'Chủ đối tác',
      roleUser: 'Thành viên'
    },
    en: {
      tours: 'Find Tours',
      hotelsFlights: 'Flights & Hotels',
      tripBuilder: 'Trip Builder',
      myBookings: 'My Bookings',
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      name: 'Full Name',
      password: 'Password',
      phone: 'Phone Number',
      noAccount: "Don't have an account? Register",
      hasAccount: 'Already have an account? Login',
      authTitle: isRegister ? 'CREATE AN ACCOUNT' : 'LOGIN TO PORTAL',
      adminPanel: 'Admin Panel',
      partnerPanel: 'Partner Portal',
      hello: 'Hello',
      roleAdmin: 'System Admin',
      roleOwner: 'Hotel Partner',
      roleUser: 'Standard Member'
    }
  }[lang];

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return t.roleAdmin;
      case 'hotel_owner': return t.roleOwner;
      default: return t.roleUser;
    }
  };

  return (
    <nav className={`navbar ${isTransparentPage ? (scrolled ? 'navbar-scrolled' : 'navbar-transparent') : 'navbar-solid'}`}>
      {/* Animated Characters & Plane */}
      <div className="navbar-animation-container">
        {/* Walker 1: tourist carrying flag */}
        <div className="navbar-walker">
          <span style={{ fontSize: '1.2rem' }}>🚶‍♂️</span>
          <span style={{ fontSize: '0.85rem', transform: 'translateY(-5px) rotate(5deg)' }}>🇻🇳</span>
        </div>
        {/* Walker 2: hiker carrying flag */}
        <div className="navbar-walker-2">
          <span style={{ fontSize: '0.85rem', transform: 'translateY(-5px) rotate(-5deg)' }}>🇻🇳</span>
          <span style={{ fontSize: '1.1rem' }}>🏃‍♀️</span>
        </div>
        {/* Flying plane */}
        <div className="navbar-plane">
          <span>✈️</span>
        </div>
      </div>

      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', position: 'relative', zIndex: 2 }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.6rem', fontWeight: 800 }}>
          <Compass size={34} color="var(--secondary-base)" />
          <span style={{ letterSpacing: '-0.5px' }} className="gradient-text">DuBaoTravel</span>
        </Link>

        {/* Central Clean Spaced Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-base)', transition: 'var(--transition-smooth)' }} className="hover-lift">
            <Compass size={18} color="var(--secondary-base)" /> {t.tours}
          </Link>
          <Link to="/booking-services" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-base)', transition: 'var(--transition-smooth)' }} className="hover-lift">
            <Briefcase size={18} color="var(--secondary-base)" /> {t.hotelsFlights}
          </Link>
          <Link to="/trip-builder" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-base)', transition: 'var(--transition-smooth)' }} className="hover-lift">
            <Calendar size={18} color="var(--secondary-base)" /> {t.tripBuilder}
          </Link>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Language Selector */}
          <button onClick={toggleLanguage} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-color)', borderRadius: '30px' }}>
            <Globe size={16} />
            <span style={{ fontWeight: 700 }}>{lang.toUpperCase()}</span>
          </button>

          {/* User Auth Info with Premium Dropdown */}
          {user ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <div 
                onClick={() => setShowDropdown(!showDropdown)} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '30px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'white',
                  transition: 'var(--transition-smooth)'
                }}
                className="hover-lift"
              >
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name} 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--secondary-base)', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    {user.name[0].toUpperCase()}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '120px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {getRoleText(user.role)}
                  </span>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" style={{ transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </div>

              {/* Premium Glassmorphism Dropdown Menu */}
              {showDropdown && (
                <div 
                  className="glass-card animate-fade-in" 
                  style={{ 
                    position: 'absolute', 
                    top: '52px', 
                    right: 0, 
                    width: '240px', 
                    padding: '12px 0', 
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 200,
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                >
                  <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-base)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{user.email}</div>
                  </div>

                  <Link 
                    to="/profile" 
                    onClick={() => setShowDropdown(false)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '10px 20px', 
                      fontSize: '0.9rem', 
                      color: 'var(--text-main)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-main)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <User size={16} color="var(--secondary-base)" />
                    {lang === 'vi' ? 'Thông tin cá nhân' : 'Personal Profile'}
                  </Link>

                  <Link 
                    to="/my-bookings" 
                    onClick={() => setShowDropdown(false)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '10px 20px', 
                      fontSize: '0.9rem', 
                      color: 'var(--text-main)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-main)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <CreditCard size={16} color="var(--secondary-base)" />
                    {t.myBookings}
                  </Link>

                  {(user.role === 'hotel_owner' || user.role === 'admin') && (
                    <Link 
                      to="/partner" 
                      onClick={() => setShowDropdown(false)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '10px 20px', 
                        fontSize: '0.9rem', 
                        color: 'var(--text-main)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-main)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <Building size={16} color="var(--secondary-base)" />
                      {t.partnerPanel}
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setShowDropdown(false)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '10px 20px', 
                        fontSize: '0.9rem', 
                        color: 'var(--text-main)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-main)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <Shield size={16} color="var(--secondary-base)" />
                      {t.adminPanel}
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '8px' }}>
                    <button 
                      onClick={handleLogout}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '10px 20px', 
                        fontSize: '0.9rem', 
                        color: 'var(--danger-color)',
                        width: '100%',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(229, 62, 62, 0.05)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={16} color="var(--danger-color)" />
                      {t.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => { setIsRegister(false); setShowAuthModal(true); }} 
              className="btn btn-primary" 
              style={{ padding: '10px 20px', borderRadius: '30px' }}
            >
              <User size={16} />
              {t.login}
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ position: 'relative' }}>
            <button 
              onClick={() => { setShowAuthModal(false); resetForm(); }}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              &times;
            </button>
            
            <h3 style={{ textAlign: 'center', marginBottom: '24px', letterSpacing: '1px' }}>{t.authTitle}</h3>
            
            {error && (
              <div style={{ backgroundColor: 'rgba(229, 62, 62, 0.1)', color: 'var(--danger-color)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.name} *</label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} 
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Email *</label>
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.password} *</label>
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} 
                />
              </div>

              {isRegister && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.phone}</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }} 
                  />
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', width: '100%' }}>
                {isRegister ? t.register : t.login}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
              <button 
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--secondary-base)', cursor: 'pointer', fontWeight: 600 }}
              >
                {isRegister ? t.hasAccount : t.noAccount}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
