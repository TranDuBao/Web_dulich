import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { InteractiveMap } from '../components/InteractiveMap';
import { Hotel, Plane, Search, MapPin, Calendar, Star, ShieldAlert } from 'lucide-react';

export const BookingServices = () => {
  const { user, token } = useAuth();
  const { showAlert } = useNotification();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hotel'); // 'hotel' or 'flight'
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');

  // Hotels states
  const [hotels, setHotels] = useState([]);
  const [hotelLocation, setHotelLocation] = useState('');
  const [hotelStars, setHotelStars] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [hotelLoading, setHotelLoading] = useState(false);

  // Flights states
  const [flights, setFlights] = useState([]);
  const [flightFrom, setFlightFrom] = useState('');
  const [flightTo, setFlightTo] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [flightLoading, setFlightLoading] = useState(false);

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('lang') || 'vi');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  useEffect(() => {
    if (activeTab === 'hotel') {
      fetchHotels();
    } else {
      fetchFlights();
    }
  }, [activeTab, hotelLocation, hotelStars, checkInDate, flightFrom, flightTo, flightDate]);

  const fetchHotels = async () => {
    setHotelLoading(true);
    try {
      const queryParams = new URLSearchParams({
        location: hotelLocation,
        stars: hotelStars,
        checkInDate
      });
      const res = await fetch(`http://localhost:5001/api/suppliers/hotels?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHotels(data);
      }
    } catch (err) {
      console.error('Error fetching hotels:', err);
    } finally {
      setHotelLoading(false);
    }
  };

  const fetchFlights = async () => {
    setFlightLoading(true);
    try {
      const queryParams = new URLSearchParams({
        from: flightFrom,
        to: flightTo,
        date: flightDate
      });
      const res = await fetch(`http://localhost:5001/api/suppliers/flights?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFlights(data);
      }
    } catch (err) {
      console.error('Error fetching flights:', err);
    } finally {
      setFlightLoading(false);
    }
  };

  const handleBook = async (serviceType, serviceId, basePrice, serviceName) => {
    if (!user) {
      await showAlert(
        lang === 'vi' ? 'Vui lòng đăng nhập để đặt dịch vụ!' : 'Please login to reserve services!',
        'warning',
        lang === 'vi' ? 'Yêu cầu đăng nhập' : 'Authentication Required'
      );
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: serviceType,
          referenceId: serviceId,
          totalPrice: basePrice,
          guestDetails: {
            guestName: user.name,
            guestPhone: user.phone || '0900000000',
            date: serviceType === 'hotel' ? checkInDate : flightDate
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        await showAlert(
          lang === 'vi' ? `Đặt ${serviceName} thành công! Đang chuyển hướng...` : `Reserved ${serviceName}! Redirecting...`,
          'success',
          lang === 'vi' ? 'Thành công' : 'Success'
        );
        navigate('/my-bookings');
      } else {
        await showAlert(data.message || 'Lỗi đặt dịch vụ', 'error', lang === 'vi' ? 'Lỗi đặt dịch vụ' : 'Booking Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    }
  };

  const t = {
    vi: {
      hotelsTab: 'Khách Sạn',
      flightsTab: 'Vé Máy Bay',
      searchLoc: 'Tìm theo địa điểm...',
      searchFrom: 'Điểm đi (HAN, SGN...)',
      searchTo: 'Điểm đến (DAD, SGN...)',
      checkIn: 'Ngày nhận phòng',
      flightDate: 'Ngày bay',
      stars: 'Số sao',
      allStars: 'Tất cả hạng sao',
      bookBtn: 'Đặt phòng',
      bookFlightBtn: 'Đặt vé',
      usdPrice: 'hoặc {usd} USD',
      hotTitle: 'Danh sách khách sạn & bản đồ vị trí',
      fltTitle: 'Danh sách chuyến bay nội địa',
      noHotels: 'Không tìm thấy khách sạn nào.',
      noFlights: 'Không tìm thấy chuyến bay nào.',
      dynamicPriceNotice: '💡 Giá có thể thay đổi linh hoạt phụ thuộc vào thời điểm đặt phòng và mùa du lịch cao điểm.'
    },
    en: {
      hotelsTab: 'Hotels',
      flightsTab: 'Flights',
      searchLoc: 'Search location...',
      searchFrom: 'Departure (HAN, SGN...)',
      searchTo: 'Destination (DAD, SGN...)',
      checkIn: 'Check-in Date',
      flightDate: 'Flight Date',
      stars: 'Star Rating',
      allStars: 'All Stars',
      bookBtn: 'Book Room',
      bookFlightBtn: 'Book Flight',
      usdPrice: 'or {usd} USD',
      hotTitle: 'Hotel Listing & Coordinates Map',
      fltTitle: 'Domestic Flights Aggregator',
      noHotels: 'No hotels found.',
      noFlights: 'No flights found.',
      dynamicPriceNotice: '💡 Prices are dynamic based on season and urgency factors.'
    }
  }[lang];

  return (
    <div className="container" style={{ marginTop: '40px' }}>
      {/* Toggles */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveTab('hotel')}
          className={`btn ${activeTab === 'hotel' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '12px 24px', borderRadius: '50px' }}
        >
          <Hotel size={18} /> {t.hotelsTab}
        </button>
        <button 
          onClick={() => setActiveTab('flight')}
          className={`btn ${activeTab === 'flight' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '12px 24px', borderRadius: '50px' }}
        >
          <Plane size={18} /> {t.flightsTab}
        </button>
      </div>
      {/* HOTELS MODULE */}
      {activeTab === 'hotel' && (
        <div>
          {/* Hotels Search Filters */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '30px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>{t.searchLoc}</label>
              <input 
                type="text" 
                value={hotelLocation} 
                onChange={(e) => setHotelLocation(e.target.value)} 
                placeholder="Ví dụ: Phú Quốc, Hà Nội..."
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>{t.checkIn}</label>
              <input 
                type="date" 
                value={checkInDate} 
                onChange={(e) => setCheckInDate(e.target.value)} 
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>{t.stars}</label>
              <select 
                value={hotelStars} 
                onChange={(e) => setHotelStars(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'white' }}
              >
                <option value="">{t.allStars}</option>
                <option value="5">5 ⭐⭐⭐⭐⭐</option>
                <option value="4">4 ⭐⭐⭐⭐</option>
                <option value="3">3 ⭐⭐⭐</option>
              </select>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(49, 151, 149, 0.08)', color: 'var(--secondary-base)', padding: '12px 20px', borderRadius: 'var(--radius-sm)', marginBottom: '30px', fontSize: '0.9rem', fontWeight: 500 }}>
            {t.dynamicPriceNotice}
          </div>

          {/* Hotels Content Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px', gap: '30px', alignItems: 'start' }}>
            {/* List */}
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>{t.hotTitle}</h2>
              {hotelLoading ? (
                <p>Đang tải danh sách khách sạn...</p>
              ) : hotels.length === 0 ? (
                <p>{t.noHotels}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {hotels.map(hotel => (
                    <div key={hotel.id} className="glass-card" style={{ display: 'flex', overflow: 'hidden' }}>
                      <img src={hotel.image_url} alt={hotel.name} style={{ width: '180px', height: '140px', objectFit: 'cover' }} />
                      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ fontSize: '1.1rem' }}>{hotel.name}</h3>
                            <span style={{ display: 'flex', gap: '2px', color: 'var(--accent-base)' }}>
                              {[...Array(hotel.star_rating)].map((_, i) => <Star key={i} size={14} fill="var(--accent-base)" />)}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 8px' }}>📍 {hotel.location}</p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{hotel.description}</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                          <div>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--secondary-base)' }}>{parseInt(hotel.price_per_night).toLocaleString()}đ</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{t.usdPrice.replace('{usd}', hotel.price_usd)}</span>
                          </div>
                          <button onClick={() => handleBook('hotel', hotel.id, hotel.price_per_night, hotel.name)} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                            {t.bookBtn}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <InteractiveMap items={hotels} height="500px" />
            </div>
          </div>
        </div>
      )}

      {/* FLIGHTS MODULE */}
      {activeTab === 'flight' && (
        <div>
          {/* Flights Filters */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '30px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>{t.searchFrom}</label>
              <input 
                type="text" 
                value={flightFrom} 
                onChange={(e) => setFlightFrom(e.target.value)} 
                placeholder="Ví dụ: HAN, SGN..."
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>{t.searchTo}</label>
              <input 
                type="text" 
                value={flightTo} 
                onChange={(e) => setFlightTo(e.target.value)} 
                placeholder="Ví dụ: DAD, PQC..."
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>{t.flightDate}</label>
              <input 
                type="date" 
                value={flightDate} 
                onChange={(e) => setFlightDate(e.target.value)} 
                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>{t.fltTitle}</h2>
            {flightLoading ? (
              <p>Đang quét các chuyến bay từ hãng hàng không...</p>
            ) : flights.length === 0 ? (
              <p>{t.noFlights}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {flights.map(flight => (
                  <div key={flight.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--primary-base)', color: 'white', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>
                        {flight.airline.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', margin: 0 }}>{flight.airline}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mã bay: {flight.flight_number}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, display: 'block' }}>{new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{flight.departure_airport}</span>
                    </div>

                    <div style={{ textAlign: 'center', flex: 1, maxWidth: '120px', position: 'relative' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{flight.duration}</span>
                      <div style={{ height: '2px', backgroundColor: 'var(--border-color)', margin: '4px 0', position: 'relative' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--secondary-base)', position: 'absolute', right: 0, top: '-2px' }} />
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, display: 'block' }}>--:--</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{flight.arrival_airport}</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--secondary-base)', display: 'block' }}>{parseInt(flight.price).toLocaleString()}đ</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>{t.usdPrice.replace('{usd}', flight.price_usd)}</span>
                      <button onClick={() => handleBook('flight', flight.id, flight.price, `${flight.airline} ${flight.flight_number}`)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        {t.bookFlightBtn}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default BookingServices;
