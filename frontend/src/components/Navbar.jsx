import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Globe, User, LogOut, Briefcase, Calendar, Map, Compass } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, login, register } = useAuth();
  const { showAlert } = useNotification();
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const toggleLanguage = () => {
    const nextLang = lang === 'vi' ? 'en' : 'vi';
    setLang(nextLang);
    localStorage.setItem('lang', nextLang);
    // Dispatch event to notify other components of language change
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
    navigate('/');
  };

  const t = {
    vi: {
      tours: 'Tìm Tour',
      hotelsFlights: 'Vé & Khách Sạn',
      tripBuilder: 'Thiết Kế Lịch Trình',
      myBookings: 'Đơn Hàng',
      login: 'Đăng nhập',
      logout: 'Đăng xuất',
      register: 'Đăng ký',
      name: 'Họ và tên',
      password: 'Mật khẩu',
      phone: 'Số điện thoại',
      noAccount: 'Chưa có tài khoản? Đăng ký ngay',
      hasAccount: 'Đã có tài khoản? Đăng nhập',
      authTitle: isRegister ? 'TẠO TÀI KHOẢN MỚI' : 'ĐĂNG NHẬP HỆ THỐNG',
      adminPanel: 'Trang Admin'
    },
    en: {
      tours: 'Find Tours',
      hotelsFlights: 'Flights & Hotels',
      tripBuilder: 'Trip Builder',
      myBookings: 'Bookings',
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      name: 'Full Name',
      password: 'Password',
      phone: 'Phone Number',
      noAccount: "Don't have an account? Register",
      hasAccount: 'Already have an account? Login',
      authTitle: isRegister ? 'CREATE AN ACCOUNT' : 'LOGIN TO PORTAL',
      adminPanel: 'Admin Panel'
    }
  }[lang];

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 800 }}>
          <Compass size={32} color="#319795" />
          <span style={{ letterSpacing: '-0.5px' }} className="gradient-text">DuBaoTravel</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-light)' }}>
            <Compass size={18} /> {t.tours}
          </Link>
          <Link to="/booking-services" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-light)' }}>
            <Briefcase size={18} /> {t.hotelsFlights}
          </Link>
          <Link to="/trip-builder" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-light)' }}>
            <Calendar size={18} /> {t.tripBuilder}
          </Link>
          {user && (
            <Link to="/my-bookings" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary-light)' }}>
              <Briefcase size={18} /> {t.myBookings}
            </Link>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={toggleLanguage} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={16} />
            {lang.toUpperCase()}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--secondary-base)', color: 'white', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {user.name[0].toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role === 'admin' ? t.adminPanel : 'Thành viên'}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 12px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => { setIsRegister(false); setShowAuthModal(true); }} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)' }}>
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
