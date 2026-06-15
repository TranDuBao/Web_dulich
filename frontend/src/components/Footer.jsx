import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Compass, Facebook, Instagram, Twitter } from 'lucide-react';

export const Footer = () => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('lang') || 'vi');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const t = {
    vi: {
      desc: 'Hệ thống đặt chỗ và quản lý du lịch toàn diện số 1 Việt Nam.',
      quickLinks: 'Liên Kết Nhanh',
      support: 'Hỗ Trợ',
      contact: 'Liên Hệ',
      tours: 'Tìm kiếm Tour',
      builder: 'Tự lập kế hoạch',
      booking: 'Khách sạn & Vé máy bay',
      policy: 'Chính sách bảo mật',
      terms: 'Điều khoản dịch vụ',
      address: 'Tòa nhà VinaTravel, Cầu Giấy, Hà Nội'
    },
    en: {
      desc: 'The leading comprehensive travel booking and management portal in Vietnam.',
      quickLinks: 'Quick Links',
      support: 'Support',
      contact: 'Contact Us',
      tours: 'Find Tours',
      builder: 'Trip Planner',
      booking: 'Hotels & Flights',
      policy: 'Privacy Policy',
      terms: 'Terms of Service',
      address: 'VinaTravel Building, Cau Giay, Hanoi'
    }
  }[lang];

  return (
    <footer style={{ backgroundColor: 'var(--primary-base)', color: 'white', padding: '60px 0 30px', marginTop: '60px' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Compass size={28} color="#319795" />
            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>VinaTravel</h3>
          </div>
          <p style={{ color: '#A0AEC0', fontSize: '0.9rem', marginBottom: '20px' }}>{t.desc}</p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <a href="#" style={{ color: '#A0AEC0' }}><Facebook size={20} /></a>
            <a href="#" style={{ color: '#A0AEC0' }}><Instagram size={20} /></a>
            <a href="#" style={{ color: '#A0AEC0' }}><Twitter size={20} /></a>
          </div>
        </div>
        <div>
          <h4 style={{ color: 'white', marginBottom: '20px', fontSize: '1.1rem' }}>{t.quickLinks}</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#A0AEC0' }}>
            <li><a href="/">{t.tours}</a></li>
            <li><a href="/booking-services">{t.booking}</a></li>
            <li><a href="/trip-builder">{t.builder}</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: 'white', marginBottom: '20px', fontSize: '1.1rem' }}>{t.support}</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#A0AEC0' }}>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">{t.policy}</a></li>
            <li><a href="#">{t.terms}</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: 'white', marginBottom: '20px', fontSize: '1.1rem' }}>{t.contact}</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: '#A0AEC0' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={18} /> {t.address}</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={18} /> +84 90 123 4567</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={18} /> support@vinatravel.com</li>
          </ul>
        </div>
      </div>
      <div className="container" style={{ borderTop: '1px solid #2D3748', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#718096' }}>
        <p>&copy; 2026 VinaTravel Portal. All rights reserved.</p>
      </div>
    </footer>
  );
};
