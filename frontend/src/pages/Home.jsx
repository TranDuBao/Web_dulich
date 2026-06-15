import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Clock, Star, DollarSign, Filter } from 'lucide-react';

export const Home = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [rating, setRating] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Popular locations for suggestions
  const destinationsSeed = ['Hạ Long', 'Hà Giang', 'Phú Quốc', 'Đà Nẵng', 'Hội An', 'Huế'];

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('lang') || 'vi');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  useEffect(() => {
    fetchTours();
  }, [search, destination, duration, maxPrice, rating]);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        destination,
        duration,
        maxPrice,
        rating
      });
      const res = await fetch(`http://localhost:5001/api/tours?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTours(data);
      }
    } catch (err) {
      console.error('Error fetching tours:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationInput = (value) => {
    setDestination(value);
    if (value) {
      const filtered = destinationsSeed.filter(dest => 
        dest.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (value) => {
    setDestination(value);
    setSuggestions([]);
  };

  const resetFilters = () => {
    setSearch('');
    setDestination('');
    setDuration('');
    setMaxPrice(10000000);
    setRating('');
  };

  const t = {
    vi: {
      heroTitle: 'Khám Phá Hành Trình Kỳ Diệu',
      heroSub: 'Tìm kiếm và so sánh hàng trăm tour du lịch, phòng khách sạn và vé bay với mức giá tốt nhất.',
      searchPlaceholder: 'Tìm tour, trải nghiệm...',
      destPlaceholder: 'Điểm đến...',
      searchBtn: 'Tìm kiếm',
      filters: 'Bộ Lọc Facet',
      duration: 'Thời gian',
      all: 'Tất cả',
      short: '1 - 3 ngày (Ngắn ngày)',
      medium: '4 - 7 ngày (Trung bình)',
      long: 'Trên 7 ngày (Dài ngày)',
      price: 'Giá tối đa',
      rating: 'Đánh giá tối thiểu',
      found: 'Tìm thấy {count} tour phù hợp',
      noTour: 'Không tìm thấy tour nào khớp với bộ lọc của bạn.',
      star: 'Sao',
      days: 'ngày',
      nights: 'đêm',
      priceFrom: 'Giá từ',
      details: 'Xem chi tiết',
      reset: 'Xóa lọc'
    },
    en: {
      heroTitle: 'Discover Magical Journeys',
      heroSub: 'Search and compare hundreds of tours, hotels, and flights with the best premium prices.',
      searchPlaceholder: 'Search tours, experiences...',
      destPlaceholder: 'Destination...',
      searchBtn: 'Search',
      filters: 'Faceted Filters',
      duration: 'Duration',
      all: 'All Durations',
      short: '1 - 3 days (Short)',
      medium: '4 - 7 days (Medium)',
      long: 'Over 7 days (Long)',
      price: 'Maximum Price',
      rating: 'Minimum Rating',
      found: 'Found {count} matching tours',
      noTour: 'No tours found matching your criteria.',
      star: 'Star',
      days: 'days',
      nights: 'nights',
      priceFrom: 'From',
      details: 'View Details',
      reset: 'Reset Filters'
    }
  }[lang];

  return (
    <div>
      {/* Hero Search Section */}
      <section className="gradient-bg" style={{ padding: '80px 0', color: 'white', textAlign: 'center', position: 'relative' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: 800, marginBottom: '16px' }} className="animate-fade-in">
            {t.heroTitle}
          </h1>
          <p style={{ color: '#E2E8F0', fontSize: '1.2rem', marginBottom: '40px' }}>
            {t.heroSub}
          </p>

          {/* Predictive Search Bar */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#4A5568' }}>
              <Search size={20} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' }} 
              />
            </div>

            <div style={{ flex: 1, minWidth: '200px', position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#4A5568' }}>
              <MapPin size={20} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder={t.destPlaceholder} 
                value={destination} 
                onChange={(e) => handleDestinationInput(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' }} 
              />
              
              {/* Typeahead Suggestions */}
              {suggestions.length > 0 && (
                <ul className="glass-card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', zIndex: 10, listStyle: 'none', padding: '8px 0', textAlign: 'left', color: 'var(--text-main)' }}>
                  {suggestions.map((sug, idx) => (
                    <li 
                      key={idx} 
                      onClick={() => selectSuggestion(sug)}
                      style={{ padding: '10px 16px', cursor: 'pointer', hover: { backgroundColor: '#EDF2F7' }, borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--border-color)' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#EDF2F7'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Faceted Search Panel */}
      <main className="container" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px', marginTop: '40px' }}>
        {/* Faceted Filter Sidebar */}
        <aside className="glass-card" style={{ padding: '24px', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} /> {t.filters}
            </h3>
            <button 
              onClick={resetFilters} 
              style={{ background: 'none', border: 'none', color: 'var(--secondary-base)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {t.reset}
            </button>
          </div>

          {/* Duration Filter */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--primary-light)' }}>{t.duration}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="radio" name="duration" checked={duration === ''} onChange={() => setDuration('')} />
                {t.all}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="radio" name="duration" checked={duration === 'short'} onChange={() => setDuration('short')} />
                {t.short}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="radio" name="duration" checked={duration === 'medium'} onChange={() => setDuration('medium')} />
                {t.medium}
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="radio" name="duration" checked={duration === 'long'} onChange={() => setDuration('long')} />
                {t.long}
              </label>
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--primary-light)' }}>{t.price}</h4>
            <input 
              type="range" 
              min="1000000" 
              max="10000000" 
              step="500000" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--secondary-base)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>1.000.000đ</span>
              <span style={{ fontWeight: 'bold', color: 'var(--secondary-base)' }}>{maxPrice.toLocaleString()}đ</span>
            </div>
          </div>

          {/* Star Rating Filter */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--primary-light)' }}>{t.rating}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                <input type="radio" name="rating" checked={rating === ''} onChange={() => setRating('')} />
                {t.all}
              </label>
              {[5, 4, 3].map((star) => (
                <label key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input type="radio" name="rating" checked={rating === String(star)} onChange={() => setRating(String(star))} />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {star} <Star size={14} fill="var(--accent-base)" color="var(--accent-base)" /> ({t.star}+)
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Search Results */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem' }}>
              {t.found.replace('{count}', tours.length)}
            </h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ border: '4px solid #E2E8F0', borderTop: '4px solid var(--secondary-base)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Đang tải danh sách tour...</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : tours.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '1.1rem' }}>{t.noTour}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {tours.map((tour) => (
                <article key={tour.id} className="glass-card hover-lift" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img 
                      src={tour.image_url} 
                      alt={tour.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(26, 54, 93, 0.85)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <Star size={14} fill="var(--accent-base)" color="var(--accent-base)" />
                      {parseFloat(tour.rating).toFixed(1)}
                    </div>
                  </div>

                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <MapPin size={14} />
                        <span>{tour.destination}</span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '45px' }}>
                        {tour.title}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} />
                          {tour.duration_days} {t.days} {tour.duration_nights} {t.nights}
                        </span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.priceFrom}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary-base)' }}>
                          {parseInt(tour.price).toLocaleString()}đ
                        </span>
                      </div>
                      <Link to={`/tours/${tour.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        {t.details}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
export default Home;
