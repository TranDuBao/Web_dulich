import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { CreditCard, CheckCircle, XCircle, AlertCircle, RefreshCw, Calendar, Tag, ArrowRight } from 'lucide-react';

export const MyBookings = () => {
  const { user, token } = useAuth();
  const { showAlert, showConfirm } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');

  // Payment Modal States
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [payMethod, setPayMethod] = useState('VNPAY');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('lang') || 'vi');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  // SePay automated payment webhook status checker
  useEffect(() => {
    let intervalId;
    if (showPayModal && activeBooking && activeBooking.payment_status !== 'paid') {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:5001/api/bookings/${activeBooking.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.payment_status === 'paid') {
              setPaySuccessMsg(lang === 'vi' ? 'Thanh toán thành công! Hệ thống đã xác nhận hóa đơn của bạn. ✅' : 'Payment successful! System confirmed your invoice. ✅');
              clearInterval(intervalId);
              setTimeout(() => {
                setShowPayModal(false);
                fetchBookings();
              }, 2000);
            }
          }
        } catch (err) {
          console.error('Error polling booking status:', err);
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showPayModal, activeBooking, token, lang]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    const confirmMsg = lang === 'vi' 
      ? 'Bạn có chắc chắn muốn hủy đơn đặt chỗ này không? Nếu đã thanh toán, bạn sẽ được hoàn trả tiền trong 3-5 ngày làm việc.'
      : 'Are you sure you want to cancel this booking? If paid, you will be refunded within 3-5 working days.';
    
    const isConfirmed = await showConfirm(confirmMsg, lang === 'vi' ? 'Xác nhận hủy đặt chỗ' : 'Cancel Confirmation', 'warning');
    if (!isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5001/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        await showAlert(lang === 'vi' ? 'Hủy đặt chỗ thành công!' : 'Booking cancelled successfully!', 'success', lang === 'vi' ? 'Thành công' : 'Success');
        fetchBookings();
      } else {
        const data = await res.json();
        await showAlert(data.message || 'Lỗi khi hủy đặt chỗ', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    }
  };

  const openPaymentModal = (booking) => {
    setActiveBooking(booking);
    setShowPayModal(true);
    setPaySuccessMsg('');
  };

  const submitPayment = async () => {
    setPaymentLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/bookings/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: activeBooking.id,
          paymentMethod: payMethod
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPaySuccessMsg(lang === 'vi' ? 'Thanh toán thành công! Hệ thống đã xác nhận hóa đơn của bạn. ✅' : 'Payment successful! System confirmed your invoice. ✅');
        setTimeout(() => {
          setShowPayModal(false);
          fetchBookings();
        }, 2000);
      } else {
        await showAlert(data.message || 'Lỗi xử lý thanh toán', 'error', lang === 'vi' ? 'Lỗi thanh toán' : 'Payment Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    } finally {
      setPaymentLoading(false);
    }
  };

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

  const t = {
    vi: {
      title: 'Đơn Hàng Của Tôi',
      desc: 'Quản lý trạng thái, lịch sử, chi tiết đặt phòng/flight và cổng thanh toán giao dịch.',
      empty: 'Bạn chưa có đặt chỗ nào trên hệ thống.',
      code: 'Mã đơn',
      date: 'Ngày đặt',
      total: 'Tổng thanh toán',
      actions: 'Thao tác',
      payBtn: 'Thanh toán ngay',
      cancelBtn: 'Hủy đặt chỗ',
      modalTitle: 'CỔNG THANH TOÁN DỊCH VỤ',
      modalMethod: 'Chọn phương thức thanh toán',
      qrTitle: 'QUÉT MÃ QR ĐỂ CHUYỂN KHOẢN',
      qrDesc: 'Quét mã QR bằng ứng dụng ngân hàng di động của bạn để thanh toán.',
      bankName: 'Ngân hàng',
      accountNum: 'Số tài khoản',
      accountName: 'Chủ tài khoản',
      amountLabel: 'Số tiền chuyển',
      descriptionLabel: 'Nội dung chuyển khoản',
      confirmPayBtn: 'Xác nhận đã chuyển khoản',
      waitPayMsg: 'Đang xử lý giao dịch qua cổng thanh toán...'
    },
    en: {
      title: 'My Bookings',
      desc: 'Manage and coordinate your tours, hotels and flight reservations and invoice payments.',
      empty: 'No active reservations found.',
      code: 'Booking Code',
      date: 'Booking Date',
      total: 'Total Price',
      actions: 'Actions',
      payBtn: 'Pay Now',
      cancelBtn: 'Cancel Reservation',
      modalTitle: 'GATEWAY PAYMENT PROCESSOR',
      modalMethod: 'Choose payment method',
      qrTitle: 'SCAN BANKING QR TO TRANSFER',
      qrDesc: 'Open your banking app to scan and complete payment transfer.',
      bankName: 'Bank',
      accountNum: 'Account Number',
      accountName: 'Beneficiary Name',
      amountLabel: 'Amount',
      descriptionLabel: 'Transfer description',
      confirmPayBtn: 'I have transferred funds',
      waitPayMsg: 'Processing payment gateway transaction...'
    }
  }[lang];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ border: '4px solid #E2E8F0', borderTop: '4px solid var(--secondary-base)', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
        <p>Đang tải lịch sử đặt chỗ...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '40px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{t.title}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <AlertCircle size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <p>{t.empty}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {bookings.map((booking) => (
            <div key={booking.id} className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden', alignItems: 'stretch' }}>
              <img 
                src={booking.service_image || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80'} 
                alt={booking.service_name} 
                style={{ width: '220px', objectFit: 'cover', minHeight: '160px' }} 
              />
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <span className="badge badge-info" style={{ marginBottom: '6px' }}>{booking.type.toUpperCase()}</span>
                      <h3 style={{ fontSize: '1.25rem' }}>{booking.service_name}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {getStatusBadge(booking.status)}
                      {getPaymentBadge(booking.payment_status)}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <div>
                      <span>{t.code}:</span>
                      <strong style={{ display: 'block', color: 'var(--text-main)' }}>#BK-{booking.id.toString().padStart(5, '0')}</strong>
                    </div>
                    <div>
                      <span>{t.date}:</span>
                      <strong style={{ display: 'block', color: 'var(--text-main)' }}>{new Date(booking.booking_date).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span>{t.total}:</span>
                      <strong style={{ display: 'block', color: 'var(--secondary-base)', fontSize: '1.1rem', fontWeight: 800 }}>
                        {parseInt(booking.total_price).toLocaleString()}đ
                      </strong>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                  {booking.status !== 'cancelled' && (
                    <button onClick={() => handleCancel(booking.id)} className="btn btn-outline" style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)', padding: '8px 16px', fontSize: '0.85rem' }}>
                      {t.cancelBtn}
                    </button>
                  )}

                  {booking.status === 'pending' && booking.payment_status === 'unpaid' && (
                    <button onClick={() => openPaymentModal(booking)} className="btn btn-accent" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                      <CreditCard size={16} />
                      {t.payBtn}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Gateway QR Modal */}
      {showPayModal && activeBooking && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '600px', width: '90%', position: 'relative' }}>
            <button 
              onClick={() => setShowPayModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              &times;
            </button>

            <h3 style={{ textAlign: 'center', marginBottom: '24px', letterSpacing: '0.5px' }}>{t.modalTitle}</h3>

            {paySuccessMsg ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--success-color)', fontSize: '1.1rem', fontWeight: 600 }}>
                {paySuccessMsg}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'center' }}>
                {/* QR Code Column */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                    {payMethod === 'BANK_TRANSFER' ? 'QUÉT MÃ VIETQR TỰ ĐỘNG' : t.qrTitle}
                  </span>
                  <img 
                    src={
                      payMethod === 'BANK_TRANSFER'
                        ? `https://qr.sepay.vn/img?acc=1234567890&bank=MBBank&amount=${activeBooking.total_price}&des=BK%20${activeBooking.id}`
                        : `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                            `2ef1b93f-c30f-4889-a292-1262dcfb8ef4|BANK_MB|1234567890|${activeBooking.total_price}|BK_${activeBooking.id}`
                          )}`
                    } 
                    alt="Payment QR Code" 
                    style={{ width: '180px', height: '180px', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '8px', backgroundColor: 'white' }} 
                  />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    {payMethod === 'BANK_TRANSFER' ? 'Hệ thống tự động duyệt sau 3-5 giây chuyển khoản.' : t.qrDesc}
                  </p>
                </div>

                {/* Account Details Column */}
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.modalMethod}</label>
                    <select 
                      value={payMethod} 
                      onChange={(e) => setPayMethod(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'white', marginTop: '4px' }}
                    >
                      <option value="BANK_TRANSFER">Chuyển khoản tự động (SePay VietQR)</option>
                      <option value="VNPAY">VNPay QR Gateway</option>
                      <option value="MOMO">Momo E-Wallet</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: '8px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{t.bankName}:</span>
                      <strong style={{ float: 'right' }}>MB Bank (Ngân hàng Quân Đội)</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{t.accountNum}:</span>
                      <strong style={{ float: 'right' }}>1234567890</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{t.accountName}:</span>
                      <strong style={{ float: 'right' }}>CONG TY DUBAOTRAVEL CO.LTD</strong>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t.amountLabel}:</span>
                      <strong style={{ float: 'right', color: 'var(--secondary-base)', fontSize: '1rem' }}>
                        {parseInt(activeBooking.total_price).toLocaleString()}đ
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>{t.descriptionLabel}:</span>
                      <strong style={{ float: 'right', color: 'var(--accent-base)' }}>BK {activeBooking.id}</strong>
                    </div>
                  </div>

                  <button 
                    onClick={submitPayment} 
                    disabled={paymentLoading}
                    className="btn btn-accent" 
                    style={{ width: '100%', marginTop: '16px', padding: '12px' }}
                  >
                    {paymentLoading ? t.waitPayMsg : t.confirmPayBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default MyBookings;
