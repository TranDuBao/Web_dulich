import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { TourDetail } from './pages/TourDetail';
import { BookingServices } from './pages/BookingServices';
import { TripBuilder } from './pages/TripBuilder';
import { MyBookings } from './pages/MyBookings';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ flex: 1 }} className="no-print">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tours/:id" element={<TourDetail />} />
                <Route path="/booking-services" element={<BookingServices />} />
                <Route path="/trip-builder" element={<TripBuilder />} />
                <Route path="/my-bookings" element={<MyBookings />} />
              </Routes>
            </div>
            {/* For PDF printing, we render a standalone printable block */}
            <Routes>
              <Route path="/trip-builder" element={
                <div className="print-only" style={{ display: 'none' }}>
                  {/* Print layout is styled strictly via index.css */}
                </div>
              } />
            </Routes>
            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
