import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { MapPin, Clock, Star, Calendar, Users, CheckCircle, MessageSquare, ShieldAlert } from 'lucide-react';

export const TourDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { showAlert } = useNotification();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');

  // Booking form states
  const [guestsCount, setGuestsCount] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('lang') || 'vi');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  useEffect(() => {
    fetchTourDetails();
  }, [id]);

  const fetchTourDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/api/tours/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTour(data);
        // Pre-populate guest name if user is logged in
        if (user) {
          setGuestName(user.name);
          setPhoneField(user.phone || '');
        }
      }
    } catch (err) {
      console.error('Error fetching tour detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper helper to set phone safely
  const setPhoneField = (val) => {
    setGuestPhone(val);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      await showAlert(
        lang === 'vi' ? 'Vui lòng đăng nhập để thực hiện đặt tour!' : 'Please login to reserve this tour!',
        'warning',
        lang === 'vi' ? 'Yêu cầu đăng nhập' : 'Authentication Required'
      );
      return;
    }

    const totalPrice = parseFloat(tour.price) * guestsCount;

    try {
      const res = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'tour',
          referenceId: tour.id,
          totalPrice,
          guestDetails: {
            guestName,
            guestPhone,
            guestsCount
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        await showAlert(
          lang === 'vi' ? 'Đặt chỗ thành công! Đang chuyển đến trang Đơn hàng...' : 'Booking created! Navigating to Bookings...',
          'success',
          lang === 'vi' ? 'Thành công' : 'Success'
        );
        navigate('/my-bookings');
      } else {
        await showAlert(data.message || 'Lỗi đặt chỗ', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      await showAlert(
        lang === 'vi' ? 'Vui lòng đăng nhập để gửi đánh giá!' : 'Please login to submit a review!',
        'warning',
        lang === 'vi' ? 'Yêu cầu đăng nhập' : 'Authentication Required'
      );
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          entityType: 'tour',
          entityId: tour.id,
          rating,
          comment
        })
      });

      const data = await res.json();
      if (res.ok) {
        await showAlert(
          lang === 'vi' ? 'Đã gửi đánh giá của bạn thành công!' : 'Review submitted successfully!',
          'success',
          lang === 'vi' ? 'Thành công' : 'Success'
        );
        setComment('');
        fetchTourDetails(); // Refresh reviews list
      } else {
        await showAlert(data.message || 'Lỗi khi gửi đánh giá', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    }
  };

  const t = {
    vi: {
      days: 'ngày',
      nights: 'đêm',
      rating: 'Đánh giá',
      highlights: 'Điểm Nhấn Nổi Bật',
      itinerary: 'Lịch Trình Chi Tiết',
      bookTitle: 'Đặt Tour Ngay',
      guests: 'Số người tham gia',
      guestName: 'Tên người liên hệ',
      guestPhone: 'Số điện thoại',
      total: 'Tổng giá trị',
      bookBtn: 'Xác nhận đặt tour',
      loginRequired: 'Đăng nhập để đặt tour',
      reviews: 'Đánh Giá Từ Khách Hàng',
      writeReview: 'Viết Đánh Giá Của Bạn',
      ratingLabel: 'Số sao',
      commentLabel: 'Nội dung nhận xét',
      submitReview: 'Gửi đánh giá',
      noReviews: 'Chưa có đánh giá nào cho tour này.',
      successReview: 'Đã gửi đánh giá của bạn thành công!',
      pricePerGuest: 'Giá mỗi khách'
    },
    en: {
      days: 'days',
      nights: 'nights',
      rating: 'Rating',
      highlights: 'Tour Highlights',
      itinerary: 'Itinerary details',
      bookTitle: 'Book This Tour',
      guests: 'Number of Guests',
      guestName: 'Contact Name',
      guestPhone: 'Phone Number',
      total: 'Total Price',
      bookBtn: 'Confirm Reservation',
      loginRequired: 'Login to reserve',
      reviews: 'Customer Reviews',
      writeReview: 'Write a Review',
      ratingLabel: 'Rating',
      commentLabel: 'Review comment',
      submitReview: 'Submit Review',
      noReviews: 'No reviews yet for this tour.',
      successReview: 'Review submitted successfully!',
      pricePerGuest: 'Price per guest'
    }
  }[lang];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ border: '4px solid #E2E8F0', borderTop: '4px solid var(--secondary-base)', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
        <p>Đang tải chi tiết hành trình...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Không tìm thấy hành trình du lịch yêu cầu!</h2>
      </div>
    );
  }

  // Parse custom highlights and itinerary preview details
  const highlightsList = tour.highlights ? tour.highlights.split(',') : [];
  const itineraryDays = tour.itinerary_preview ? tour.itinerary_preview.split('|') : [];

  return (
    <div className="container" style={{ marginTop: '40px' }}>
      {/* Banner Card */}
      <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '40px' }}>
        <div style={{ position: 'relative', height: '400px' }}>
          <img src={tour.image_url} alt={tour.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)', padding: '30px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', color: '#A0AEC0', marginBottom: '8px' }}>
              <MapPin size={16} />
              <span>{tour.destination}</span>
            </div>
            <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '10px' }}>{tour.title}</h1>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={18} /> {tour.duration_days} {t.days} {tour.duration_nights} {t.nights}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={18} fill="var(--accent-base)" color="var(--accent-base)" /> {parseFloat(tour.rating).toFixed(1)} / 5 ({tour.reviews?.length || 0} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '40px', alignItems: 'start' }}>
        {/* Left column: highlights, itinerary, reviews */}
        <div>
          {/* Highlights */}
          {highlightsList.length > 0 && (
            <section className="glass-card" style={{ padding: '30px', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>{t.highlights}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {highlightsList.map((hl, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={20} color="var(--secondary-base)" />
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{hl.trim()}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Itinerary */}
          {itineraryDays.length > 0 && (
            <section className="glass-card" style={{ padding: '30px', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>{t.itinerary}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {itineraryDays.map((day, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--primary-base)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', zIndex: 2 }}>
                        {idx + 1}
                      </div>
                      {idx !== itineraryDays.length - 1 && (
                        <div style={{ width: '2px', backgroundColor: 'var(--border-color)', flex: 1, margin: '8px 0' }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: '10px', flex: 1 }}>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--primary-light)', marginBottom: '6px' }}>{day.split(':')[0]}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{day.split(':').slice(1).join(':').trim()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews List */}
          <section className="glass-card" style={{ padding: '30px', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={24} /> {t.reviews}
            </h2>

            {tour.reviews && tour.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
                {tour.reviews.map((rev) => (
                  <div key={rev.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{rev.user_name}</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < rev.rating ? 'var(--accent-base)' : 'none'} color="var(--accent-base)" />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{rev.comment}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '30px' }}>{t.noReviews}</p>
            )}

            {/* Write Review Form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>{t.writeReview}</h3>
                
                {reviewError && <div style={{ color: 'var(--danger-color)', marginBottom: '12px', fontSize: '0.9rem' }}>{reviewError}</div>}
                {reviewSuccess && <div style={{ color: 'var(--success-color)', marginBottom: '12px', fontSize: '0.9rem' }}>{t.successReview}</div>}

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>{t.ratingLabel}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Star size={24} fill={star <= rating ? 'var(--accent-base)' : 'none'} color="var(--accent-base)" />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.commentLabel}</label>
                  <textarea 
                    rows="4" 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary">{t.submitReview}</button>
              </form>
            ) : (
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <ShieldAlert size={18} />
                <span>Vui lòng đăng nhập để viết đánh giá cho tour này.</span>
              </div>
            )}
          </section>
        </div>

        {/* Right column: booking form */}
        <aside className="glass-card" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            {t.bookTitle}
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block' }}>{t.pricePerGuest}</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary-base)' }}>{parseInt(tour.price).toLocaleString()}đ</span>
          </div>
          <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.guests}</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={guestsCount} 
                onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.guestName} *</label>
              <input 
                type="text" 
                required 
                value={guestName} 
                onChange={(e) => setGuestName(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.guestPhone} *</label>
              <input 
                type="tel" 
                required 
                value={guestPhone} 
                onChange={(e) => setGuestPhone(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontWeight: 'bold' }}>{t.total}</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-base)' }}>
                  {(parseFloat(tour.price) * guestsCount).toLocaleString()}đ
                </span>
              </div>

              <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '14px' }}>
                {t.bookBtn}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
};
export default TourDetail;
