import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Lock, Award, CreditCard, 
  Camera, BarChart2, CheckCircle, Clock, XCircle, ChevronRight,
  TrendingUp, Compass, Hotel, Plane
} from 'lucide-react';

export const Profile = () => {
  const { user, token, setUser } = useAuth();
  const { showAlert } = useNotification();
  const navigate = useNavigate();

  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'password', 'stats'

  // Profile Edit States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Change States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Statistics State
  const [stats, setStats] = useState({
    tourSpent: 0,
    hotelSpent: 0,
    flightSpent: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    rank: 'Bronze',
    nextRankThreshold: 5000000,
    bookingsCount: { pending: 0, confirmed: 0, cancelled: 0 }
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('lang') || 'vi');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    setName(user.name);
    setPhone(user.phone || '');
    setAvatar(user.avatar_url || '');
    fetchProfileStats();
  }, [user]);

  const fetchProfileStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/profile-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching profile stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) { // 1.5MB limit
        showAlert(
          lang === 'vi' ? 'Dung lượng ảnh vượt quá 1.5MB. Vui lòng chọn ảnh nhỏ hơn!' : 'Avatar file size exceeds 1.5MB limit.',
          'warning',
          lang === 'vi' ? 'Ảnh quá lớn' : 'File Too Large'
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result); // Set preview local
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          phone,
          avatarUrl: avatar
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user); // Update Context user object globally
        await showAlert(
          lang === 'vi' ? 'Cập nhật thông tin cá nhân thành công!' : 'Profile updated successfully!',
          'success',
          lang === 'vi' ? 'Thành công' : 'Success'
        );
      } else {
        await showAlert(data.message || 'Lỗi khi cập nhật thông tin', 'error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showAlert(
        lang === 'vi' ? 'Mật khẩu mới nhập lại không khớp!' : 'Passwords do not match.',
        'warning',
        lang === 'vi' ? 'Lỗi nhập liệu' : 'Input Error'
      );
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        await showAlert(
          lang === 'vi' ? 'Đổi mật khẩu thành công!' : 'Password changed successfully!',
          'success',
          lang === 'vi' ? 'Thành công' : 'Success'
        );
      } else {
        await showAlert(data.message || 'Mật khẩu cũ không chính xác', 'error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Rank Styling Helpers
  const getRankBadgeStyle = (rank) => {
    switch (rank) {
      case 'Platinum':
        return {
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #475569 100%)',
          border: '1px solid #94a3b8',
          textShadow: '0 0 10px rgba(255,255,255,0.3)',
          color: '#ffffff'
        };
      case 'Gold':
        return {
          background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
          border: '1px solid #fbbf24',
          textShadow: '0 0 10px rgba(251,191,36,0.3)',
          color: '#ffffff'
        };
      case 'Silver':
        return {
          background: 'linear-gradient(135deg, #475569 0%, #64748b 50%, #cbd5e1 100%)',
          border: '1px solid #e2e8f0',
          textShadow: '0 0 10px rgba(226,232,240,0.3)',
          color: '#ffffff'
        };
      default: // Bronze
        return {
          background: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #c2410c 100%)',
          border: '1px solid #ea580c',
          textShadow: '0 0 10px rgba(249,115,22,0.3)',
          color: '#ffffff'
        };
    }
  };

  const getRankPercentage = () => {
    if (stats.rank === 'Platinum') return 100;
    const current = stats.totalSpent;
    const max = stats.nextRankThreshold;
    if (max === 0) return 100;
    return Math.min(Math.round((current / max) * 100), 100);
  };

  const getCategoryPercent = (amount) => {
    if (stats.totalSpent === 0) return 0;
    return Math.round((amount / stats.totalSpent) * 100);
  };

  const t = {
    vi: {
      title: 'Hồ Sơ Thành Viên',
      desc: 'Quản lý thông tin tài khoản, xem cấp bậc thành viên và biểu đồ chi tiêu tích lũy.',
      membershipCard: 'THẺ THÀNH VIÊN DUBBOTRAVEL',
      memberTier: 'Hạng thẻ',
      points: 'Điểm tích lũy',
      pointsDesc: '1 điểm mỗi 100.000đ chi tiêu hợp lệ',
      nextTierInfo: 'Chi tiêu thêm {needed}đ để thăng cấp hạng thẻ tiếp theo!',
      currentTotalSpend: 'Tích lũy chi tiêu',
      statsTitle: 'Phân Tích Chi Tiêu',
      totalSpentLabel: 'Tổng đã chi tiêu',
      tourSpend: 'Chi tiêu Tour',
      hotelSpend: 'Chi tiêu Khách sạn',
      flightSpend: 'Vé máy bay',
      bookingStatusSummary: 'Tóm tắt đơn đặt chỗ',
      pendingBookings: 'Đang xử lý',
      confirmedBookings: 'Đã xác nhận',
      cancelledBookings: 'Đã hủy',
      tabInfo: 'Thông tin cá nhân',
      tabPassword: 'Đổi mật khẩu',
      tabStats: 'Thống kê chi tiêu',
      fullName: 'Họ và tên',
      phoneNum: 'Số điện thoại',
      emailAddr: 'Địa chỉ Email',
      saveInfoBtn: 'Lưu thay đổi',
      oldPassword: 'Mật khẩu hiện tại',
      newPassword: 'Mật khẩu mới',
      confirmNewPassword: 'Xác nhận mật khẩu mới',
      changePassBtn: 'Cập nhật mật khẩu',
      rankBronze: 'Đồng (Bronze)',
      rankSilver: 'Bạc (Silver)',
      rankGold: 'Vàng (Gold)',
      rankPlatinum: 'Bạch Kim (Platinum)',
      joinedDate: 'Ngày tham gia',
      pointsShort: 'điểm',
      manageBookingsBtn: 'Xem chi tiết tất cả đơn hàng'
    },
    en: {
      title: 'Member Profile',
      desc: 'Manage your profile parameters, view membership loyalty rewards card and billing analytics.',
      membershipCard: 'DUBAOTRAVEL MEMBERSHIP CARD',
      memberTier: 'Tier',
      points: 'Loyalty Points',
      pointsDesc: '1 pt per 100k VND valid purchases',
      nextTierInfo: 'Spend {needed} VND more to reach the next tier status!',
      currentTotalSpend: 'Cumulative Spending',
      statsTitle: 'Spendings Analysis',
      totalSpentLabel: 'Total Spent',
      tourSpend: 'Tour Bookings',
      hotelSpend: 'Hotels spent',
      flightSpend: 'Flight tickets',
      bookingStatusSummary: 'Booking History Summary',
      pendingBookings: 'Pending',
      confirmedBookings: 'Confirmed',
      cancelledBookings: 'Cancelled',
      tabInfo: 'Edit Profile',
      tabPassword: 'Security',
      tabStats: 'Spend Statistics',
      fullName: 'Full name',
      phoneNum: 'Phone number',
      emailAddr: 'Email Address',
      saveInfoBtn: 'Save Changes',
      oldPassword: 'Current Password',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm new password',
      changePassBtn: 'Update Password',
      rankBronze: 'Bronze',
      rankSilver: 'Silver',
      rankGold: 'Gold',
      rankPlatinum: 'Platinum',
      joinedDate: 'Joined Date',
      pointsShort: 'pts',
      manageBookingsBtn: 'Manage and view all bookings'
    }
  }[lang];

  return (
    <div className="container" style={{ marginTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '35px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{t.title}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px', alignItems: 'start' }}>
        {/* LEFT COLUMN: User Card & Loyalty Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Avatar and Info Card */}
          <div className="glass-card" style={{ padding: '30px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 20px' }}>
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={user?.name} 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-color)' }} 
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--secondary-base)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'bold', 
                  fontSize: '2.5rem' 
                }}>
                  {user?.name[0].toUpperCase()}
                </div>
              )}
              {/* Photo Upload Trigger */}
              <label 
                style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  right: 0, 
                  backgroundColor: 'var(--primary-base)', 
                  color: 'white', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  border: '2px solid white',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <Camera size={14} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>

            <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{user?.name}</h3>
            <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '16px' }}>
              {user?.role === 'admin' ? t.rankPlatinum : user?.role === 'hotel_owner' ? t.rankGold : t.rankBronze}
            </span>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '10px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <Mail size={16} />
                <span>{user?.email}</span>
              </div>
              {user?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <Phone size={16} />
                  <span>{user?.phone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <Clock size={16} />
                <span>{t.joinedDate}: {new Date(user?.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* LOYALTY PROGRAM CARD */}
          <div 
            className="glass-card" 
            style={{ 
              padding: '24px', 
              borderRadius: 'var(--radius-md)', 
              boxShadow: 'var(--shadow-lg)',
              ...getRankBadgeStyle(stats.rank)
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px', opacity: 0.8, marginBottom: '20px' }}>
              {t.membershipCard}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', opacity: 0.7, display: 'block' }}>{t.memberTier}</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase' }}>{stats.rank} Member</span>
              </div>
              <Award size={36} style={{ opacity: 0.9 }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '0.75rem', opacity: 0.7, display: 'block', marginBottom: '4px' }}>{t.points}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.loyaltyPoints}</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>{t.pointsShort}</span>
              </div>
              <span style={{ fontSize: '0.65rem', opacity: 0.6, display: 'block', marginTop: '2px' }}>{t.pointsDesc}</span>
            </div>

            {/* Next Level progress bar */}
            {stats.rank !== 'Platinum' && stats.nextRankThreshold > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', opacity: 0.8, marginBottom: '6px' }}>
                  <span>{t.currentTotalSpend}</span>
                  <span>{getRankPercentage()}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ width: `${getRankPercentage()}%`, height: '100%', backgroundColor: 'white', borderRadius: '10px' }} />
                </div>
                <span style={{ fontSize: '0.65rem', opacity: 0.8, display: 'block', lineHeight: 1.3 }}>
                  {t.nextTierInfo.replace('{needed}', (stats.nextRankThreshold - stats.totalSpent).toLocaleString())}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Profile details, Password change, Spending Statistics tabs */}
        <div>
          {/* Tab Selection */}
          <div className="glass-card" style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '30px' }}>
            <button 
              onClick={() => setActiveTab('info')}
              className={`btn ${activeTab === 'info' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <User size={16} /> {t.tabInfo}
            </button>
            <button 
              onClick={() => setActiveTab('password')}
              className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Lock size={16} /> {t.tabPassword}
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-outline'}`}
              style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <BarChart2 size={16} /> {t.tabStats}
            </button>
          </div>

          {/* TAB CONTENT: Personal Info */}
          {activeTab === 'info' && (
            <div className="glass-card" style={{ padding: '35px' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={22} color="var(--secondary-base)" /> {t.tabInfo}
              </h2>

              <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.fullName} *</label>
                    <input 
                      type="text" 
                      required 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.phoneNum}</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.emailAddr}</label>
                  <input 
                    type="email" 
                    disabled 
                    value={user?.email || ''} 
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit" disabled={updatingProfile} className="btn btn-primary" style={{ padding: '12px 30px' }}>
                    {updatingProfile ? (lang === 'vi' ? 'Đang lưu...' : 'Saving...') : t.saveInfoBtn}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB CONTENT: Password Change */}
          {activeTab === 'password' && (
            <div className="glass-card" style={{ padding: '35px' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={22} color="var(--secondary-base)" /> {t.tabPassword}
              </h2>

              <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.oldPassword} *</label>
                  <input 
                    type="password" 
                    required 
                    value={oldPassword} 
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.newPassword} *</label>
                    <input 
                      type="password" 
                      required 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.confirmNewPassword} *</label>
                    <input 
                      type="password" 
                      required 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit" disabled={updatingPassword} className="btn btn-primary" style={{ padding: '12px 30px' }}>
                    {updatingPassword ? (lang === 'vi' ? 'Đang xử lý...' : 'Updating...') : t.changePassBtn}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB CONTENT: Spend Statistics */}
          {activeTab === 'stats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Stat Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={14} color="var(--secondary-base)" /> {t.totalSpentLabel}</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary-base)', marginTop: '8px' }}>{stats.totalSpent.toLocaleString()}đ</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Compass size={14} color="var(--secondary-base)" /> {t.tourSpend}</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>{stats.tourSpent.toLocaleString()}đ</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Hotel size={14} color="var(--secondary-base)" /> {t.hotelSpend}</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>{stats.hotelSpent.toLocaleString()}đ</span>
                </div>
                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Plane size={14} color="var(--secondary-base)" /> {t.flightSpend}</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '8px' }}>{stats.flightSpent.toLocaleString()}đ</span>
                </div>
              </div>

              {/* Graphical CSS breakdown & details */}
              <div className="glass-card" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '20px' }}>{t.statsTitle}</h3>
                
                {stats.totalSpent > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Visual Segment Bar Chart */}
                    <div style={{ width: '100%', height: '24px', borderRadius: '12px', overflow: 'hidden', display: 'flex', backgroundColor: 'var(--bg-main)' }}>
                      <div 
                        style={{ 
                          width: `${getCategoryPercent(stats.tourSpent)}%`, 
                          backgroundColor: '#319795', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: 'white', 
                          fontSize: '0.7rem', 
                          fontWeight: 700 
                        }} 
                        title={`Tour: ${getCategoryPercent(stats.tourSpent)}%`}
                      >
                        {getCategoryPercent(stats.tourSpent) > 10 ? 'Tour' : ''}
                      </div>
                      <div 
                        style={{ 
                          width: `${getCategoryPercent(stats.hotelSpent)}%`, 
                          backgroundColor: '#2b6cb0', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: 'white', 
                          fontSize: '0.7rem', 
                          fontWeight: 700 
                        }} 
                        title={`Khách sạn: ${getCategoryPercent(stats.hotelSpent)}%`}
                      >
                        {getCategoryPercent(stats.hotelSpent) > 10 ? 'Hotel' : ''}
                      </div>
                      <div 
                        style={{ 
                          width: `${getCategoryPercent(stats.flightSpent)}%`, 
                          backgroundColor: '#d69e2e', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: 'white', 
                          fontSize: '0.7rem', 
                          fontWeight: 700 
                        }} 
                        title={`Máy bay: ${getCategoryPercent(stats.flightSpent)}%`}
                      >
                        {getCategoryPercent(stats.flightSpent) > 10 ? 'Flight' : ''}
                      </div>
                    </div>

                    {/* Chart Legend */}
                    <div style={{ display: 'flex', gap: '30px', fontSize: '0.85rem', marginTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#319795' }} />
                        <span style={{ fontWeight: 600 }}>Tour ({getCategoryPercent(stats.tourSpent)}%)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#2b6cb0' }} />
                        <span style={{ fontWeight: 600 }}>Khách sạn ({getCategoryPercent(stats.hotelSpent)}%)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#d69e2e' }} />
                        <span style={{ fontWeight: 600 }}>Vé máy bay ({getCategoryPercent(stats.flightSpent)}%)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                    {lang === 'vi' ? 'Bạn chưa có chi tiêu thanh toán hợp lệ nào để phân tích.' : 'No purchase spending data available yet.'}
                  </p>
                )}
              </div>

              {/* BOOKINGS HISTORY STATUS SUMMARY CARD */}
              <div className="glass-card" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{t.bookingStatusSummary}</h3>
                  <button 
                    onClick={() => navigate('/my-bookings')} 
                    className="btn btn-outline" 
                    style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>{t.manageBookingsBtn}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center' }}>
                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                    <Clock size={24} color="var(--secondary-base)" style={{ margin: '0 auto 8px' }} />
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.pendingBookings}</span>
                    <strong style={{ display: 'block', fontSize: '1.6rem', marginTop: '4px' }}>{stats.bookingsCount.pending}</strong>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                    <CheckCircle size={24} color="#38A169" style={{ margin: '0 auto 8px' }} />
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.confirmedBookings}</span>
                    <strong style={{ display: 'block', fontSize: '1.6rem', marginTop: '4px' }}>{stats.bookingsCount.confirmed}</strong>
                  </div>

                  <div style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
                    <XCircle size={24} color="#E53E3E" style={{ margin: '0 auto 8px' }} />
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.cancelledBookings}</span>
                    <strong style={{ display: 'block', fontSize: '1.6rem', marginTop: '4px' }}>{stats.bookingsCount.cancelled}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
