import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  DollarSign, 
  Filter, 
  Hotel, 
  Plane, 
  Award, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles 
} from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
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

  // Search Tab States
  const [activeSearchTab, setActiveSearchTab] = useState('tour');
  const [hotelSearchLoc, setHotelSearchLoc] = useState('');
  const [hotelSearchStars, setHotelSearchStars] = useState('');
  const [flightSearchFrom, setFlightSearchFrom] = useState('');
  const [flightSearchTo, setFlightSearchTo] = useState('');
  const [flightSearchDate, setFlightSearchDate] = useState('');

  // Hotels State for showcase
  const [hotels, setHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(true);

  // Testimonials Carousel State
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Background Slideshow State
  const [heroBgIndex, setHeroBgIndex] = useState(0);
  const heroBackgrounds = [
    'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1920&q=80', // Hạ Long
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', // Phú Quốc
    'https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=1920&q=80', // Hà Giang
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1920&q=80'  // Đà Nẵng
  ];

  // Popular locations for suggestions
  const destinationsSeed = ['Hạ Long', 'Hà Giang', 'Phú Quốc', 'Đà Nẵng', 'Hội An', 'Huế'];

  const popularDestinations = [
    {
      name: 'Hạ Long',
      desc: { vi: 'Kỳ quan vịnh biển thế giới', en: 'World natural bay wonder' },
      image: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Phú Quốc',
      desc: { vi: 'Thiên đường đảo ngọc cát trắng', en: 'White sand emerald island' },
      image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Hà Giang',
      desc: { vi: 'Hùng vĩ cao nguyên đá cực Bắc', en: 'Majestic Northern stone plateau' },
      image: 'https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Đà Nẵng',
      desc: { vi: 'Thành phố của những cây cầu', en: 'Modern city of bridges' },
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const testimonials = [
    {
      name: 'Nguyễn Bích Phương',
      role: 'Du khách Hà Nội',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      comment: {
        vi: 'Chuyến đi Hạ Long vô cùng ý nghĩa! Du thuyền 5 sao chuẩn chỉ từ dịch vụ đến phòng nghỉ. Chắc chắn sẽ quay lại ủng hộ tiếp!',
        en: 'The Halong bay trip was amazing! The 5-star cruise was perfect in both service and rooms. Highly recommended!'
      },
      rating: 5
    },
    {
      name: 'Marcus Aurelius',
      role: 'Du khách Australia',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      comment: {
        vi: 'Phong cảnh Hà Giang rất hùng vĩ, hướng dẫn viên nhiệt tình chia sẻ nhiều nét văn hóa độc đáo. Đặt dịch vụ qua DuBaoTravel rất nhanh gọn.',
        en: 'Ha Giang scenery is majestic, the guide was enthusiastic and shared unique cultural facts. Booking via DuBaoTravel was fast and smooth.'
      },
      rating: 5
    },
    {
      name: 'Trần Minh Tâm',
      role: 'Du khách Đà Nẵng',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      comment: {
        vi: 'Khách sạn Vinpearl Phú Quốc rất tuyệt vời, hồ bơi rộng và bãi biển đẹp. Dịch vụ đặt phòng linh hoạt, giá cả hợp lý hơn các bên khác.',
        en: 'Vinpearl Phu Quoc hotel is wonderful, large pool and nice beach. Flexible booking service with better prices than other platforms.'
      },
      rating: 5
    }
  ];

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

  useEffect(() => {
    fetchHotels();
  }, []);

  // Auto testimonial rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx(prev => (prev + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Auto background slideshow rotation
  useEffect(() => {
    const bgTimer = setInterval(() => {
      setHeroBgIndex(prev => (prev + 1) % heroBackgrounds.length);
    }, 6000);
    return () => clearInterval(bgTimer);
  }, []);

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

  const fetchHotels = async () => {
    setHotelsLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/suppliers/hotels');
      if (res.ok) {
        const data = await res.json();
        setHotels(data);
      }
    } catch (err) {
      console.error('Error fetching hotels:', err);
    } finally {
      setHotelsLoading(false);
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

  const handleDestinationClick = (name) => {
    setDestination(name);
    setTimeout(() => {
      document.getElementById('tours-search-panel')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const nextTestimonial = () => {
    setTestimonialIdx((testimonialIdx + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setTestimonialIdx((testimonialIdx - 1 + testimonials.length) % testimonials.length);
  };

  const t = {
    vi: {
      heroTitle: 'Khám Phá Hành Trình Kỳ Diệu',
      heroSub: 'Tìm kiếm và so sánh hàng trăm tour du lịch, phòng khách sạn và vé bay với mức giá tốt nhất.',
      searchPlaceholder: 'Tìm tour, trải nghiệm...',
      destPlaceholder: 'Điểm đến...',
      searchBtn: 'Tìm kiếm ngay',
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
      reset: 'Xóa lọc',
      
      // New additions
      tourTab: 'Tours Trọn Gói',
      hotelTab: 'Khách Sạn & Resort',
      flightTab: 'Vé Máy Bay',
      hotelSearchPlaceholder: 'Khách sạn tại Phú Quốc, Hà Nội...',
      allStars: 'Tất cả hạng sao',
      flightFromPlaceholder: 'Điểm đi (HAN, SGN...)',
      flightToPlaceholder: 'Điểm đến (DAD, SGN...)',
      
      destinationsTitle: '📍 Điểm Đến Thịnh Hành',
      destinationsSub: 'Khám phá những điểm du lịch hấp dẫn nhất được gợi ý riêng cho bạn',
      
      statsTitle: 'DuBaoTravel Qua Những Con Số',
      statsSub: 'Sự tin tưởng và hài lòng của khách hàng là động lực lớn nhất của chúng tôi',
      statsCustomers: 'Khách hàng tin tưởng',
      statsToursCount: 'Tours du lịch trọn gói',
      statsHotelsCount: 'Khách sạn đối tác',
      statsRatingVal: 'Đánh giá chất lượng',
      
      hotelsTitle: '🏨 Khách Sạn & Resort Sang Trọng',
      hotelsSub: 'Lựa chọn điểm nghỉ dưỡng lý tưởng với chất lượng dịch vụ đẳng cấp 5 sao',
      pricePerNight: 'Giá phòng từ',
      viewHotelBtn: 'Xem phòng',
      
      reviewsTitle: '✨ Trải Nghiệm Của Khách Hàng',
      reviewsSub: 'Những đánh giá chân thực nhất từ du khách sau mỗi chuyến đi kỳ diệu',
      exploreBtn: 'Khám phá ngay'
    },
    en: {
      heroTitle: 'Discover Magical Journeys',
      heroSub: 'Search and compare hundreds of tours, hotels, and flights with the best premium prices.',
      searchPlaceholder: 'Search tours, experiences...',
      destPlaceholder: 'Destination...',
      searchBtn: 'Search Now',
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
      reset: 'Reset Filters',
      
      // New additions
      tourTab: 'Package Tours',
      hotelTab: 'Hotels & Resorts',
      flightTab: 'Flights',
      hotelSearchPlaceholder: 'Hotels in Phu Quoc, Hanoi...',
      allStars: 'All Stars',
      flightFromPlaceholder: 'From (HAN, SGN...)',
      flightToPlaceholder: 'To (DAD, SGN...)',
      
      destinationsTitle: '📍 Popular Destinations',
      destinationsSub: 'Explore the most attractive travel spots tailored just for you',
      
      statsTitle: 'DuBaoTravel In Numbers',
      statsSub: 'Customer trust and satisfaction are our greatest achievements',
      statsCustomers: 'Happy Customers',
      statsToursCount: 'Fascinating Tours',
      statsHotelsCount: 'Partner Hotels',
      statsRatingVal: 'Quality Rating',
      
      hotelsTitle: '🏨 Luxury Hotels & Resorts',
      hotelsSub: 'Select the ideal holiday destination with 5-star standard quality',
      pricePerNight: 'Rooms from',
      viewHotelBtn: 'View Room',
      
      reviewsTitle: '✨ Customer Testimonials',
      reviewsSub: 'Genuine reviews from travelers after each magical journey',
      exploreBtn: 'Explore now'
    }
  }[lang];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '80px' }}>
      
      {/* Animated Hero Section */}
      <section className="hero-gradient-animated" style={{ padding: '160px 0 120px', color: 'white', textAlign: 'center', position: 'relative' }}>
        
        {/* Dynamic Slideshow Background */}
        <div className="hero-slideshow-container">
          {heroBackgrounds.map((bgUrl, idx) => (
            <div 
              key={idx}
              className={`hero-slide ${heroBgIndex === idx ? 'active' : ''}`}
              style={{ backgroundImage: `url(${bgUrl})` }}
            />
          ))}
        </div>
        
        {/* Dark overlay for contrast */}
        <div className="hero-overlay-gradient" />

        {/* Floating circles backgrounds */}
        <div className="hero-blob hero-blob-1" style={{ zIndex: 1 }} />
        <div className="hero-blob hero-blob-2" style={{ zIndex: 1 }} />

        <div className="container animate-scale-up" style={{ maxWidth: '900px', position: 'relative', zIndex: 2 }}>
          <h1 style={{ color: 'white', fontSize: '3.6rem', fontWeight: 800, marginBottom: '16px', textShadow: '0 2px 12px rgba(0,0,0,0.7), 0 4px 30px rgba(0,0,0,0.4)', letterSpacing: '-0.5px', lineHeight: '1.2' }}>
            {t.heroTitle}
          </h1>
          <p style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '45px', maxWidth: '700px', margin: '0 auto 45px', textShadow: '0 2px 8px rgba(0,0,0,0.8)', fontWeight: 500 }}>
            {t.heroSub}
          </p>

          {/* Search Panel Widget */}
          <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.25)', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.2)' }}>
            
            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '0 10px' }}>
              <button 
                className={`search-tab-btn ${activeSearchTab === 'tour' ? 'active' : ''}`}
                onClick={() => setActiveSearchTab('tour')}
              >
                <Sparkles size={16} /> {t.tourTab}
              </button>
              <button 
                className={`search-tab-btn ${activeSearchTab === 'hotel' ? 'active' : ''}`}
                onClick={() => setActiveSearchTab('hotel')}
              >
                <Hotel size={16} /> {t.hotelTab}
              </button>
              <button 
                className={`search-tab-btn ${activeSearchTab === 'flight' ? 'active' : ''}`}
                onClick={() => setActiveSearchTab('flight')}
              >
                <Plane size={16} /> {t.flightTab}
              </button>
            </div>

            {/* Dynamic Search Content based on Tab */}
            <div style={{ padding: '24px' }}>
              {activeSearchTab === 'tour' && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Tour Keyword Search */}
                  <div style={{ flex: 1.2, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#4A5568' }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input 
                      type="text" 
                      placeholder={t.searchPlaceholder} 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' }} 
                    />
                  </div>

                  {/* Destination with Typeahead */}
                  <div style={{ flex: 1, minWidth: '200px', position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#4A5568' }}>
                    <MapPin size={20} color="var(--text-muted)" />
                    <input 
                      type="text" 
                      placeholder={t.destPlaceholder} 
                      value={destination} 
                      onChange={(e) => handleDestinationInput(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' }} 
                    />
                    
                    {/* Suggestions list */}
                    {suggestions.length > 0 && (
                      <ul className="glass-card animate-scale-up" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', zIndex: 10, listStyle: 'none', padding: '8px 0', textAlign: 'left', color: 'var(--text-main)' }}>
                        {suggestions.map((sug, idx) => (
                          <li 
                            key={idx} 
                            onClick={() => selectSuggestion(sug)}
                            style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--border-color)', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#EDF2F7'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            {sug}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      document.getElementById('tours-search-panel')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn btn-primary animate-pulse-glow" 
                    style={{ padding: '12px 28px', borderRadius: 'var(--radius-sm)' }}
                  >
                    {t.searchBtn}
                  </button>
                </div>
              )}

              {activeSearchTab === 'hotel' && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Destination */}
                  <div style={{ flex: 1.2, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#4A5568' }}>
                    <MapPin size={20} color="var(--text-muted)" />
                    <input 
                      type="text" 
                      placeholder={t.hotelSearchPlaceholder} 
                      value={hotelSearchLoc}
                      onChange={(e) => setHotelSearchLoc(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' }} 
                    />
                  </div>

                  {/* Stars Rating */}
                  <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#4A5568' }}>
                    <Star size={20} color="var(--text-muted)" />
                    <select
                      value={hotelSearchStars}
                      onChange={(e) => setHotelSearchStars(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem', backgroundColor: 'transparent' }}
                    >
                      <option value="">{t.allStars}</option>
                      <option value="5">5 ⭐⭐⭐⭐⭐</option>
                      <option value="4">4 ⭐⭐⭐⭐</option>
                      <option value="3">3 ⭐⭐⭐</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => {
                      const url = `/booking-services?tab=hotel&location=${encodeURIComponent(hotelSearchLoc)}&stars=${hotelSearchStars}`;
                      navigate(url);
                    }}
                    className="btn btn-primary" 
                    style={{ padding: '12px 28px', borderRadius: 'var(--radius-sm)' }}
                  >
                    {t.searchBtn}
                  </button>
                </div>
              )}

              {activeSearchTab === 'flight' && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* From */}
                  <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#4A5568' }}>
                    <MapPin size={20} color="var(--text-muted)" />
                    <input 
                      type="text" 
                      placeholder={t.flightFromPlaceholder} 
                      value={flightSearchFrom}
                      onChange={(e) => setFlightSearchFrom(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' }} 
                    />
                  </div>

                  {/* To */}
                  <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#4A5568' }}>
                    <MapPin size={20} color="var(--text-muted)" />
                    <input 
                      type="text" 
                      placeholder={t.flightToPlaceholder} 
                      value={flightSearchTo}
                      onChange={(e) => setFlightSearchTo(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' }} 
                    />
                  </div>

                  {/* Date */}
                  <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#4A5568' }}>
                    <Calendar size={20} color="var(--text-muted)" />
                    <input 
                      type="date" 
                      value={flightSearchDate}
                      onChange={(e) => setFlightSearchDate(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem' }} 
                    />
                  </div>

                  <button 
                    onClick={() => {
                      const url = `/booking-services?tab=flight&from=${encodeURIComponent(flightSearchFrom)}&to=${encodeURIComponent(flightSearchTo)}&date=${flightSearchDate}`;
                      navigate(url);
                    }}
                    className="btn btn-primary" 
                    style={{ padding: '12px 28px', borderRadius: 'var(--radius-sm)' }}
                  >
                    {t.searchBtn}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Popular Destinations Grid Section */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-base)', marginBottom: '8px' }}>
            {t.destinationsTitle}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            {t.destinationsSub}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
          {popularDestinations.map((dest, idx) => (
            <div 
              key={idx} 
              className="destination-card"
              onClick={() => handleDestinationClick(dest.name)}
            >
              <img src={dest.image} alt={dest.name} loading="lazy" />
              <div className="destination-overlay">
                <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{dest.name}</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', margin: '4px 0 0' }}>{dest.desc[lang]}</p>
                <span className="explore-btn">
                  {t.exploreBtn} <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Tours Listing with Sidebar Facet Filters */}
      <section className="container" id="tours-search-panel" style={{ scrollMarginTop: '100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
          
          {/* Faceted Filter Sidebar */}
          <aside className="glass-card" style={{ padding: '24px', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '24px', border: '1px solid var(--border-color)', position: 'sticky', top: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-base)' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
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

          {/* Search Results Grid */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--primary-base)' }}>
                {t.found.replace('{count}', tours.length)}
              </h2>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ border: '4px solid #E2E8F0', borderTop: '4px solid var(--secondary-base)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-muted)' }}>Đang tải danh sách tour...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : tours.length === 0 ? (
              <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '1.1rem' }}>{t.noTour}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {tours.map((tour) => (
                  <article key={tour.id} className="glass-card hover-lift" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)' }}>
                    
                    {/* Image block */}
                    <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                      <img 
                        src={tour.image_url} 
                        alt={tour.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        loading="lazy"
                      />
                      <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(26, 54, 93, 0.85)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px', color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        <Star size={14} fill="var(--accent-base)" color="var(--accent-base)" />
                        {parseFloat(tour.rating).toFixed(1)}
                      </div>
                      
                      {/* Floating hot badge */}
                      {parseFloat(tour.rating) >= 4.8 && (
                        <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: 'var(--success-color)', color: 'white', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={12} /> Hot
                        </div>
                      )}
                    </div>

                    {/* Content block */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          <MapPin size={14} />
                          <span>{tour.destination}</span>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', lineHeight: '1.4', color: 'var(--primary-base)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '45px' }}>
                          {tour.title}
                        </h3>

                        {/* highlights info preview */}
                        {tour.highlights && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                            {tour.highlights.split(',').slice(0, 2).map((hl, i) => (
                              <span key={i} style={{ fontSize: '0.7rem', backgroundColor: '#EDF2F7', color: 'var(--primary-light)', padding: '3px 8px', borderRadius: '4px', fontWeight: 500 }}>
                                ✓ {hl.trim()}
                              </span>
                            ))}
                          </div>
                        )}

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
                        <Link to={`/tours/${tour.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
                          {t.details}
                        </Link>
                      </div>
                    </div>

                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Luxury Hotels Showcase Section */}
      <section 
        className="hotels-section-bg" 
        style={{ 
          position: 'relative', 
          backgroundImage: "url('https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: '80px 0'
        }}
      >
        {/* Semi-transparent mask overlay to ensure text readability */}
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            backgroundColor: 'rgba(255, 255, 255, 0.85)', 
            backdropFilter: 'blur(4px)',
            zIndex: 0 
          }} 
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{ color: 'var(--secondary-base)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>Premium Resorts</span>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-base)', marginBottom: '8px' }}>
              {t.hotelsTitle}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              {t.hotelsSub}
            </p>
          </div>

          {hotelsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ border: '4px solid #E2E8F0', borderTop: '4px solid var(--secondary-base)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Đang tải danh sách khách sạn...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>Không có khách sạn nào.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
              {hotels.slice(0, 4).map(hotel => (
                <div 
                  key={hotel.id} 
                  className="glass-card hover-lift" 
                  style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.7)', height: '100%' }}
                >
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <img src={hotel.image_url} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    
                    {/* Star rating tag */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: '12px', display: 'flex', gap: '2px' }}>
                      {[...Array(hotel.star_rating)].map((_, i) => (
                        <Star key={i} size={12} fill="var(--accent-base)" color="var(--accent-base)" />
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-base)', marginBottom: '6px' }}>{hotel.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} color="var(--secondary-base)" /> {hotel.location}
                      </p>
                      <p style={{ fontSize: '0.9rem', color: '#4A5568', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '20px' }}>
                        {hotel.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.pricePerNight}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--secondary-base)' }}>{parseInt(hotel.price_per_night).toLocaleString()}đ</span>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/hotels/${hotel.id}`)}
                        className="btn btn-primary"
                        style={{ padding: '8px 20px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
                      >
                        {t.viewHotelBtn}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interactive Statistics Dashboard Section */}
      <section className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          
          <div className="glass-card stat-card" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: 'rgba(49, 151, 149, 0.1)', color: 'var(--secondary-base)', marginBottom: '16px' }}>
              <Users size={28} />
            </div>
            <div className="stat-number">10.000+</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.statsCustomers}</div>
          </div>

          <div className="glass-card stat-card" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: 'rgba(214, 158, 46, 0.1)', color: 'var(--accent-base)', marginBottom: '16px' }}>
              <TrendingUp size={28} />
            </div>
            <div className="stat-number">500+</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.statsToursCount}</div>
          </div>

          <div className="glass-card stat-card" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: 'rgba(26, 54, 93, 0.1)', color: 'var(--primary-base)', marginBottom: '16px' }}>
              <Hotel size={28} />
            </div>
            <div className="stat-number">200+</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.statsHotelsCount}</div>
          </div>

          <div className="glass-card stat-card" style={{ border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: 'rgba(56, 161, 105, 0.1)', color: 'var(--success-color)', marginBottom: '16px' }}>
              <Award size={28} />
            </div>
            <div className="stat-number">4.9 ★</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t.statsRatingVal}</div>
          </div>

        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(to bottom, #FFFFFF, var(--bg-main))' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-base)', marginBottom: '8px' }}>
              {t.reviewsTitle}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
              {t.reviewsSub}
            </p>
          </div>

          {/* Testimonial card slider */}
          <div style={{ position: 'relative' }}>
            
            <div className="testimonial-card animate-scale-up" style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              
              <div style={{ display: 'flex', gap: '2px', color: 'var(--accent-base)', marginBottom: '16px' }}>
                {[...Array(testimonials[testimonialIdx].rating)].map((_, i) => (
                  <Star key={i} size={18} fill="var(--accent-base)" color="var(--accent-base)" />
                ))}
              </div>

              <blockquote style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontStyle: 'italic', marginBottom: '24px', lineHeight: '1.6' }}>
                "{testimonials[testimonialIdx].comment[lang]}"
              </blockquote>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img 
                  src={testimonials[testimonialIdx].avatar} 
                  alt={testimonials[testimonialIdx].name} 
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--secondary-base)' }}
                />
                <div>
                  <cite style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-base)', fontStyle: 'normal', display: 'block' }}>
                    {testimonials[testimonialIdx].name}
                  </cite>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {testimonials[testimonialIdx].role}
                  </span>
                </div>
              </div>
            </div>

            {/* Slider navigations */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '30px' }}>
              <button 
                onClick={prevTestimonial}
                className="btn btn-outline"
                style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={20} />
              </button>
              
              {/* Pagination Dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 10px' }}>
                {testimonials.map((_, idx) => (
                  <span 
                    key={idx}
                    onClick={() => setTestimonialIdx(idx)}
                    style={{ 
                      width: testimonialIdx === idx ? '24px' : '8px', 
                      height: '8px', 
                      borderRadius: '4px', 
                      backgroundColor: testimonialIdx === idx ? 'var(--secondary-base)' : 'var(--border-color)', 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>

              <button 
                onClick={nextTestimonial}
                className="btn btn-outline"
                style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronRight size={20} />
              </button>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
