import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
  MapPin, Star, Calendar, Users, CheckCircle, MessageSquare, 
  ShieldAlert, Camera, Trash2, Home, CreditCard, ChevronRight 
} from 'lucide-react';

export const HotelDetail = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { showAlert } = useNotification();
  const navigate = useNavigate();
  
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Room Booking States
  const [bookingRoom, setBookingRoom] = useState(null); // Selected room object for booking
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [nightsCount, setNightsCount] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewImage, setReviewImage] = useState(null); // Base64 string of review image
  const [submittingReview, setSubmittingReview] = useState(false);

  // Lightbox State for Review Image
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  // Selected Room Detail Modal State
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);

  // Verification whether the user has booked this hotel
  const [hasBooked, setHasBooked] = useState(false);

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('lang') || 'vi');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  useEffect(() => {
    if (user) {
      setGuestName(user.name);
      setGuestPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (user && token && hotel) {
      checkUserBooking();
    }
  }, [user, token, hotel]);

  const checkUserBooking = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const bookings = await res.json();
        const bookedThisHotel = bookings.some(b => b.type === 'hotel' && b.reference_id === hotel.id);
        setHasBooked(bookedThisHotel);
      }
    } catch (err) {
      console.error('Error checking user booking:', err);
    }
  };

  const fetchHotelDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/api/suppliers/hotels/${id}`);
      if (res.ok) {
        const data = await res.json();
        setHotel(data);
        setActiveImageIdx(0);
      }
    } catch (err) {
      console.error('Error fetching hotel detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock secondary images for the hotel gallery to ensure premium visual experience
  const mockGalleryImages = [
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80', // Pool
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', // Dining
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', // Spa
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'  // Bar/Lounge
  ];

  const getGallery = () => {
    if (!hotel) return [];
    const mainImg = hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
    const customGallery = Array.isArray(hotel.images) && hotel.images.length > 0 ? hotel.images : [];
    
    if (customGallery.length > 0) {
      return [mainImg, ...customGallery];
    }
    return [mainImg, ...mockGalleryImages];
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limit size to 2MB to keep DB payload light
        showAlert(
          lang === 'vi' ? 'Dung lượng ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn!' : 'Image exceeds 2MB limit. Please choose a smaller file.',
          'warning',
          lang === 'vi' ? 'Ảnh quá lớn' : 'File Too Large'
        );
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      await showAlert(
        lang === 'vi' ? 'Vui lòng đăng nhập để đặt phòng khách sạn!' : 'Please login to book a hotel room!',
        'warning',
        lang === 'vi' ? 'Yêu cầu đăng nhập' : 'Authentication Required'
      );
      return;
    }

    const totalPrice = parseFloat(bookingRoom.price_per_night) * nightsCount;

    try {
      const res = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'hotel',
          referenceId: hotel.id,
          totalPrice,
          guestDetails: {
            guestName,
            guestPhone,
            roomType: bookingRoom.room_type,
            checkInDate,
            nights: nightsCount,
            occupancy: bookingRoom.max_occupancy
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        await showAlert(
          lang === 'vi' ? 'Đặt phòng thành công! Đang chuyển hướng đến trang đơn hàng...' : 'Hotel booked successfully! Navigating to My Bookings...',
          'success',
          lang === 'vi' ? 'Thành công' : 'Success'
        );
        setBookingRoom(null);
        navigate('/my-bookings');
      } else {
        await showAlert(data.message || 'Lỗi khi đặt phòng', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
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

    setSubmittingReview(true);
    try {
      const res = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          entityType: 'hotel',
          entityId: hotel.id,
          rating,
          comment,
          imageUrl: reviewImage
        })
      });

      const data = await res.json();
      if (res.ok) {
        await showAlert(
          lang === 'vi' ? 'Đã gửi đánh giá khách sạn thành công!' : 'Hotel review submitted successfully!',
          'success',
          lang === 'vi' ? 'Thành công' : 'Success'
        );
        setComment('');
        setReviewImage(null);
        fetchHotelDetails(); // Reload hotel to get updated reviews
      } else {
        await showAlert(data.message || 'Lỗi khi gửi đánh giá', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const t = {
    vi: {
      starRating: 'sao',
      perNight: 'đêm',
      maxGuests: 'Khách tối đa',
      roomsAvailable: 'Số phòng còn trống',
      bookBtn: 'Đặt phòng',
      bookRoomTitle: 'Xác Nhận Đặt Phòng',
      checkIn: 'Ngày nhận phòng',
      nights: 'Số đêm nghỉ',
      contactName: 'Tên người đại diện',
      contactPhone: 'Số điện thoại liên hệ',
      totalPrice: 'Tổng thanh toán',
      confirmBookingBtn: 'Hoàn tất đặt phòng',
      reviews: 'Bình luận & Đánh giá',
      writeReview: 'Viết Đánh Giá Của Bạn',
      starsLabel: 'Đánh giá số sao',
      commentLabel: 'Nội dung bình luận',
      uploadImageBtn: 'Đính kèm hình ảnh thực tế',
      submitReviewBtn: 'Gửi đánh giá',
      noReviews: 'Chưa có bình luận nào cho khách sạn này.',
      backToList: 'Quay lại danh sách',
      hotelDetail: 'Chi tiết khách sạn',
      features: 'Tiện ích nổi bật',
      roomsTitle: 'Hạng Phòng Khả Dụng',
      roomsDesc: 'Lựa chọn phòng phù hợp nhất cho chuyến đi của bạn.'
    },
    en: {
      starRating: 'stars',
      perNight: 'night',
      maxGuests: 'Max occupancy',
      roomsAvailable: 'Available rooms',
      bookBtn: 'Book Now',
      bookRoomTitle: 'Confirm Room Booking',
      checkIn: 'Check-in Date',
      nights: 'Number of nights',
      contactName: 'Guest name',
      contactPhone: 'Contact Phone',
      totalPrice: 'Total Price',
      confirmBookingBtn: 'Complete Reservation',
      reviews: 'Reviews & Ratings',
      writeReview: 'Write Your Review',
      starsLabel: 'Star Rating',
      commentLabel: 'Comment',
      uploadImageBtn: 'Attach real image',
      submitReviewBtn: 'Submit Review',
      noReviews: 'No reviews yet for this hotel.',
      backToList: 'Back to listing',
      hotelDetail: 'Hotel Details',
      features: 'Key features',
      roomsTitle: 'Available Room Types',
      roomsDesc: 'Select the best room that matches your accommodation plan.'
    }
  }[lang];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ border: '4px solid #E2E8F0', borderTop: '4px solid var(--secondary-base)', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
        <p>Đang tải chi tiết khách sạn...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Không tìm thấy thông tin khách sạn!</h2>
        <button onClick={() => navigate('/booking-services')} className="btn btn-primary" style={{ marginTop: '20px' }}>
          {t.backToList}
        </button>
      </div>
    );
  }

  const gallery = getGallery();

  return (
    <div className="container" style={{ marginTop: '30px', paddingBottom: '60px' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/booking-services')}>{lang === 'vi' ? 'Vé & Khách Sạn' : 'Hotels & Flights'}</span>
        <ChevronRight size={16} />
        <span style={{ color: 'var(--primary-base)', fontWeight: 600 }}>{hotel.name}</span>
      </div>

      {/* Main Grid: Images & Overview Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', marginBottom: '50px', alignItems: 'start' }}>
        {/* Left Column: Interactive Image Gallery */}
        <div>
          <div className="glass-card" style={{ overflow: 'hidden', height: '420px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
            <img 
              src={gallery[activeImageIdx]} 
              alt={hotel.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-smooth)' }} 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))', gap: '12px' }}>
            {gallery.map((imgUrl, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveImageIdx(idx)}
                style={{ 
                  height: '75px', 
                  borderRadius: 'var(--radius-sm)', 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  border: activeImageIdx === idx ? '3px solid var(--secondary-base)' : '1px solid var(--border-color)',
                  opacity: activeImageIdx === idx ? 1 : 0.7,
                  transition: 'var(--transition-smooth)'
                }}
              >
                <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Hotel Meta Information */}
        <div className="glass-card" style={{ padding: '35px', borderRadius: 'var(--radius-md)', minHeight: '510px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px', lineHeight: 1.2 }}>{hotel.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-base)' }}>
                  {[...Array(hotel.star_rating)].map((_, i) => <Star key={i} size={18} fill="var(--accent-base)" color="var(--accent-base)" />)}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({hotel.star_rating} {t.starRating})</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem', margin: '16px 0 24px' }}>
              <MapPin size={18} color="var(--secondary-base)" />
              <span>{hotel.location}</span>
            </div>

            <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>{t.hotelDetail}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '24px' }}>{hotel.description}</p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--primary-base)' }}>{t.features}</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['Free WiFi', 'Breakfast Included', 'Swimming Pool', 'Spa & Massage', 'Fitness Center', '24h Room Service'].map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--bg-main)', borderRadius: '30px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <CheckCircle size={14} color="var(--secondary-base)" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => {
                document.getElementById('available-rooms-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn btn-primary animate-pulse"
              style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              <CreditCard size={18} />
              {lang === 'vi' ? 'Xem phòng trống & Đặt ngay' : 'View Rooms & Book Now'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION: AVAILABLE ROOM TYPES */}
      <section id="available-rooms-section" style={{ marginBottom: '60px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{t.roomsTitle}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t.roomsDesc}</p>
        </div>

        {hotel.rooms && hotel.rooms.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {hotel.rooms.map(room => (
              <div key={room.id} className="glass-card" style={{ display: 'flex', overflow: 'hidden', flexWrap: 'wrap' }}>
                <img 
                  src={room.image_url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'} 
                  alt={room.room_type} 
                  onClick={() => setSelectedRoomDetail(room)}
                  style={{ width: '280px', objectFit: 'cover', minHeight: '190px', cursor: 'pointer', transition: 'var(--transition-smooth)' }} 
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.03)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <h3 
                        onClick={() => setSelectedRoomDetail(room)}
                        style={{ fontSize: '1.25rem', cursor: 'pointer', color: 'var(--primary-base)', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.target.style.color = 'var(--secondary-base)'}
                        onMouseLeave={(e) => e.target.style.color = 'var(--primary-base)'}
                      >
                        {room.room_type}
                      </h3>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary-base)', display: 'block' }}>{parseInt(room.price_per_night).toLocaleString()}đ</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {t.perNight}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '8px 0 16px' }}>{room.description}</p>
                    
                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} /> {t.maxGuests}: {room.max_occupancy}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Home size={16} /> {t.roomsAvailable}: {room.total_rooms}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '15px' }}>
                    <button 
                      onClick={() => setBookingRoom(room)} 
                      className="btn btn-primary"
                      style={{ padding: '10px 24px' }}
                    >
                      {t.bookBtn}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShieldAlert size={36} style={{ marginBottom: '12px' }} />
            <p>{lang === 'vi' ? 'Không có phòng nào đang được chào bán tại khách sạn này.' : 'No rooms currently listed for sale at this hotel.'}</p>
          </div>
        )}
      </section>

      {/* SECTION: REVIEWS & FEEDBACKS */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'start' }}>
        {/* Left Column: Reviews List */}
        <div className="glass-card" style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={24} /> {t.reviews} ({hotel.reviews?.length || 0})
          </h2>

          {hotel.reviews && hotel.reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {hotel.reviews.map((rev) => (
                <div key={rev.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{rev.user_name}</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < rev.rating ? 'var(--accent-base)' : 'none'} color="var(--accent-base)" />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{rev.comment}</p>
                  
                  {/* Render review image (bình luận bằng hình ảnh) */}
                  {rev.image_url && (
                    <div style={{ marginTop: '12px' }}>
                      <img 
                        src={rev.image_url} 
                        alt="Review attachment" 
                        onClick={() => setActiveLightboxImg(rev.image_url)}
                        style={{ 
                          maxWidth: '150px', 
                          maxHeight: '100px', 
                          borderRadius: 'var(--radius-sm)', 
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: '1px solid var(--border-color)',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'transform 0.2s'
                        }} 
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.03)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    </div>
                  )}

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '8px' }}>
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t.noReviews}</p>
          )}
        </div>

        {/* Right Column: Write Review Form with Image Attachments */}
        <div className="glass-card" style={{ padding: '30px' }}>
          {user ? (
            !hasBooked ? (
              <div style={{ padding: '24px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', color: 'var(--danger-color)', border: '1px dashed var(--danger-color)', fontSize: '0.9rem' }}>
                <ShieldAlert size={36} color="var(--danger-color)" />
                <span style={{ fontWeight: 600 }}>
                  {lang === 'vi' 
                    ? 'Chỉ khách hàng đã đặt phòng tại khách sạn này mới được viết đánh giá!' 
                    : 'Only guests who have booked a room at this hotel can write a review!'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>{t.writeReview}</h3>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>{t.starsLabel}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <Star size={26} fill={star <= rating ? 'var(--accent-base)' : 'none'} color="var(--accent-base)" />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.commentLabel}</label>
                  <textarea 
                    rows="4" 
                    value={comment} 
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder={lang === 'vi' ? 'Nhập chia sẻ chi tiết của bạn...' : 'Enter your comments here...'}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', outline: 'none', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Upload image for review (bình luận bằng hình ảnh) */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>{t.uploadImageBtn}</label>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <label 
                      className="btn btn-outline" 
                      style={{ 
                        padding: '10px 16px', 
                        fontSize: '0.85rem', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <Camera size={18} />
                      <span>{lang === 'vi' ? 'Chọn ảnh từ máy' : 'Choose Image'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                      />
                    </label>

                    {reviewImage && (
                      <button 
                        type="button" 
                        onClick={() => setReviewImage(null)}
                        className="btn btn-danger" 
                        style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {reviewImage && (
                    <div style={{ marginTop: '12px', position: 'relative', width: '120px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={reviewImage} alt="Attachment preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={submittingReview}
                  style={{ width: '100%', padding: '12px' }}
                >
                  {submittingReview ? (lang === 'vi' ? 'Đang gửi...' : 'Submitting...') : t.submitReviewBtn}
                </button>
              </form>
            )
          ) : (
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <ShieldAlert size={36} color="var(--text-muted)" />
              <span>{lang === 'vi' ? 'Vui lòng đăng nhập để viết bình luận kèm hình ảnh cho khách sạn này.' : 'Please login to write a review with images for this hotel.'}</span>
            </div>
          )}
        </div>
      </section>

      {/* BOOKING MODAL */}
      {bookingRoom && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '460px', padding: '30px', position: 'relative' }}>
            <button 
              onClick={() => setBookingRoom(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              &times;
            </button>

            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', textAlign: 'center' }}>{t.bookRoomTitle}</h3>
            
            <div style={{ backgroundColor: 'var(--bg-main)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--primary-base)' }}>{bookingRoom.room_type}</div>
              <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{hotel.name}</div>
            </div>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.checkIn}</label>
                <input 
                  type="date" 
                  value={checkInDate} 
                  onChange={(e) => setCheckInDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.nights}</label>
                <input 
                  type="number" 
                  min="1" 
                  max="30"
                  value={nightsCount} 
                  onChange={(e) => setNightsCount(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.contactName} *</label>
                <input 
                  type="text" 
                  required 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{t.contactPhone} *</label>
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
                  <span style={{ fontWeight: 'bold' }}>{t.totalPrice}</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary-base)' }}>
                    {(parseFloat(bookingRoom.price_per_night) * nightsCount).toLocaleString()}đ
                  </span>
                </div>

                <button type="submit" className="btn btn-accent" style={{ width: '100%', padding: '12px' }}>
                  {t.confirmBookingBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE LIGHTBOX FOR REVIEW IMAGE */}
      {activeLightboxImg && (
        <div 
          onClick={() => setActiveLightboxImg(null)}
          className="modal-overlay" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', cursor: 'zoom-out' }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img 
              src={activeLightboxImg} 
              alt="Review Fullsize" 
              style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }} 
            />
            <button 
              onClick={() => setActiveLightboxImg(null)}
              style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* ROOM DETAIL MODAL */}
      {selectedRoomDetail && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '600px', padding: '0', overflow: 'hidden', position: 'relative', borderRadius: 'var(--radius-md)' }}>
            <button 
              onClick={() => setSelectedRoomDetail(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0, 0, 0, 0.5)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', cursor: 'pointer', color: 'white', zIndex: 10 }}
            >
              &times;
            </button>

            <div style={{ height: '300px', overflow: 'hidden' }}>
              <img 
                src={selectedRoomDetail.image_url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'} 
                alt={selectedRoomDetail.room_type} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            <div style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--primary-base)' }}>{selectedRoomDetail.room_type}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '20px' }}>{selectedRoomDetail.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', backgroundColor: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{t.maxGuests}</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{selectedRoomDetail.max_occupancy} {lang === 'vi' ? 'người' : 'guests'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{t.roomsAvailable}</span>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{selectedRoomDetail.total_rooms} {lang === 'vi' ? 'phòng' : 'rooms'}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lang === 'vi' ? 'Giá phòng' : 'Room Price'}</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary-base)' }}>
                    {parseInt(selectedRoomDetail.price_per_night).toLocaleString()}đ
                    <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '4px' }}>/ {t.perNight}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setBookingRoom(selectedRoomDetail);
                    setSelectedRoomDetail(null);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '12px 28px', marginLeft: 'auto' }}
                >
                  {t.bookBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetail;
