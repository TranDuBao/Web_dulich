import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Calendar, Plus, Trash2, Save, Download, Sparkles, Move, Eye } from 'lucide-react';

export const TripBuilder = () => {
  const { user, token } = useAuth();
  const { showAlert } = useNotification();
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'vi');

  // Plan Details
  const [title, setTitle] = useState('Hành trình tự thiết kế 2026');
  const [destination, setDestination] = useState('Đà Nẵng');
  const [daysCount, setDaysCount] = useState(3);
  const [itineraryDays, setItineraryDays] = useState([
    { day: 1, items: ['Check-in Khách sạn', 'Dạo chơi biển Mỹ Khê'] },
    { day: 2, items: ['Tham quan Bà Nà Hills & Cầu Vàng', 'Ăn tối hải sản'] },
    { day: 3, items: ['Khám phá Ngũ Hành Sơn', 'Mua sắm đặc sản Chợ Hàn'] }
  ]);

  // Suggested Activities Pool to drag from
  const [suggestedActivities, setSuggestedActivities] = useState([
    { id: 'act-1', name: 'Ngắm hoàng hôn Bán đảo Sơn Trà' },
    { id: 'act-2', name: 'Du thuyền sông Hàn ngắm Cầu Rồng' },
    { id: 'act-3', name: 'Lặn ngắm san hô Cù Lao Chàm' },
    { id: 'act-4', name: 'Khám phá Phố cổ Hội An về đêm' },
    { id: 'act-5', name: 'Thưởng thức mì Quảng và chè cung đình' },
    { id: 'act-6', name: 'Thăm Đại Nội Kinh thành Huế' }
  ]);

  // New Custom Activity Input
  const [newActivity, setNewActivity] = useState('');

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('lang') || 'vi');
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  // Sync daysCount changes by resizing the itineraryDays array
  useEffect(() => {
    if (daysCount > itineraryDays.length) {
      const diff = daysCount - itineraryDays.length;
      const newDays = [...itineraryDays];
      for (let i = 0; i < diff; i++) {
        newDays.push({
          day: itineraryDays.length + i + 1,
          items: []
        });
      }
      setItineraryDays(newDays);
    } else if (daysCount < itineraryDays.length) {
      setItineraryDays(itineraryDays.slice(0, daysCount));
    }
  }, [daysCount]);

  // Drag and Drop Logic
  const handleDragStart = (e, activityName, sourceIndex = null, itemIndex = null) => {
    e.dataTransfer.setData('text/plain', activityName);
    e.dataTransfer.setData('sourceIndex', sourceIndex !== null ? String(sourceIndex) : '');
    e.dataTransfer.setData('itemIndex', itemIndex !== null ? String(itemIndex) : '');
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Enable drop callback
  };

  const handleDrop = (e, targetDayIndex) => {
    e.preventDefault();
    const activityName = e.dataTransfer.getData('text/plain');
    const sourceIndexStr = e.dataTransfer.getData('sourceIndex');
    const itemIndexStr = e.dataTransfer.getData('itemIndex');

    if (!activityName) return;

    const updatedDays = [...itineraryDays];

    // If drag source was another day, remove the item from there (move behavior)
    if (sourceIndexStr !== '') {
      const sourceDayIdx = parseInt(sourceIndexStr);
      const itemIdx = parseInt(itemIndexStr);
      updatedDays[sourceDayIdx].items.splice(itemIdx, 1);
    }

    // Add activity to target day
    updatedDays[targetDayIndex].items.push(activityName);
    setItineraryDays(updatedDays);
  };

  const addCustomActivity = () => {
    if (!newActivity.trim()) return;
    setSuggestedActivities([
      ...suggestedActivities,
      { id: `custom-${Date.now()}`, name: newActivity.trim() }
    ]);
    setNewActivity('');
  };

  const deleteActivity = (dayIndex, itemIndex) => {
    const updatedDays = [...itineraryDays];
    updatedDays[dayIndex].items.splice(itemIndex, 1);
    setItineraryDays(updatedDays);
  };

  const handleSaveItinerary = async () => {
    if (!user) {
      await showAlert(
        lang === 'vi' ? 'Vui lòng đăng nhập để lưu lịch trình!' : 'Please login to save itinerary!',
        'warning',
        lang === 'vi' ? 'Yêu cầu đăng nhập' : 'Authentication Required'
      );
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/itineraries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          destination,
          start_date: new Date().toISOString().split('T')[0],
          content: itineraryDays
        })
      });

      if (res.ok) {
        await showAlert(
          lang === 'vi' ? 'Đã lưu lịch trình vào tài khoản thành công! ✅' : 'Itinerary saved successfully! ✅',
          'success',
          lang === 'vi' ? 'Thành công' : 'Success'
        );
      } else {
        const data = await res.json();
        await showAlert(data.message || 'Lỗi khi lưu lịch trình', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
      }
    } catch (err) {
      await showAlert(lang === 'vi' ? 'Lỗi kết nối máy chủ' : 'Server connection error', 'error', lang === 'vi' ? 'Lỗi' : 'Error');
    }
  };

  const handleExportPDF = () => {
    window.print(); // Native PDF exporter triggered with index.css print stylesheets
  };

  const t = {
    vi: {
      title: 'Thiết Kế Lịch Trình Cá Nhân Hóa',
      subtitle: 'Kéo thả các địa danh, hoạt động nổi bật vào các ngày để tự xây dựng chuyến đi mơ ước.',
      config: 'Thông tin chuyến đi',
      tripName: 'Tên chuyến đi',
      dest: 'Điểm đến',
      days: 'Số ngày',
      activitiesPool: 'Gợi Ý Địa Điểm & Trải Nghiệm',
      dragTip: '💡 Kéo các hoạt động này thả vào các ô Ngày bên phải.',
      customAct: 'Tự thêm hoạt động khác',
      addBtn: 'Thêm',
      saveBtn: 'Lưu lịch trình',
      pdfBtn: 'Xuất PDF',
      dayLabel: 'Ngày',
      emptyDay: 'Chưa có hoạt động. Kéo thả hoạt động vào đây!',
      deleteTip: 'Xóa hoạt động',
      authTip: 'Đăng nhập để đồng bộ lịch trình đám mây.'
    },
    en: {
      title: 'Personalized Trip Planner',
      subtitle: 'Drag and drop highlights or custom activities into days to coordinate your dream vacation.',
      config: 'Trip Configuration',
      tripName: 'Trip Name',
      dest: 'Destination',
      days: 'Duration (Days)',
      activitiesPool: 'Suggested Activities Pool',
      dragTip: '💡 Drag activities and drop them into the Day columns on the right.',
      customAct: 'Add custom activity',
      addBtn: 'Add',
      saveBtn: 'Save to Cloud',
      pdfBtn: 'Export PDF',
      dayLabel: 'Day',
      emptyDay: 'No activities yet. Drag and drop items here!',
      deleteTip: 'Delete item',
      authTip: 'Login to save itineraries to your profile.'
    }
  }[lang];

  return (
    <div className="container" style={{ marginTop: '40px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }} className="no-print">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }} className="gradient-text">{t.title}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t.subtitle}</p>
      </div>

      {/* Print Only Header Banner */}
      <div className="print-only" style={{ display: 'none', borderBottom: '2px solid #2D3748', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ color: 'black', fontSize: '2.2rem' }}>DuBaoTravel - KẾ HOẠCH LỊCH TRÌNH DU LỊCH</h1>
        <p style={{ fontSize: '1.1rem', margin: '6px 0 0 0' }}><strong>{t.tripName}:</strong> {title} | <strong>{t.dest}:</strong> {destination}</p>
        {user && <p style={{ fontSize: '0.9rem', color: '#4A5568' }}>Tạo bởi khách hàng: {user.name} ({user.email})</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', alignItems: 'start' }}>
        {/* Left Control Panel & Activities list */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="no-print">
          {/* Trip configuration */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} /> {t.config}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>{t.tripName}</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>{t.dest}</label>
                <input 
                  type="text" 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>{t.days}</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={daysCount} 
                  onChange={(e) => setDaysCount(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            </div>
          </div>

          {/* Draggable activities pool */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} /> {t.activitiesPool}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{t.dragTip}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }}>
              {suggestedActivities.map((act) => (
                <div
                  key={act.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, act.name)}
                  style={{ 
                    padding: '10px', 
                    backgroundColor: 'var(--bg-main)', 
                    border: '1px dashed var(--border-color)', 
                    borderRadius: 'var(--radius-sm)', 
                    cursor: 'grab', 
                    fontSize: '0.85rem', 
                    fontWeight: 500,
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}
                >
                  <Move size={14} color="var(--text-muted)" />
                  {act.name}
                </div>
              ))}
            </div>

            {/* Custom activity adding */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>{t.customAct}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Đi chùa Linh Ứng..." 
                  value={newActivity} 
                  onChange={(e) => setNewActivity(e.target.value)}
                  style={{ flex: 1, padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
                />
                <button onClick={addCustomActivity} className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Planner Canvas (Days Columns) */}
        <div>
          {/* Action Row */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginBottom: '24px' }} className="no-print">
            <button onClick={handleSaveItinerary} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={18} /> {t.saveBtn}
            </button>
            <button onClick={handleExportPDF} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} /> {t.pdfBtn}
            </button>
          </div>

          {/* Days content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {itineraryDays.map((dayData, dayIdx) => (
              <div
                key={dayData.day}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dayIdx)}
                className="glass-card itinerary-day-card"
                style={{ padding: '24px', transition: 'all 0.2s', border: '2px dashed transparent' }}
                onDragEnter={(e) => e.target.closest('.itinerary-day-card').style.borderColor = 'var(--secondary-base)'}
                onDragLeave={(e) => e.target.closest('.itinerary-day-card').style.borderColor = 'transparent'}
                onDropCapture={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-base)' }}>
                  <Calendar size={18} />
                  {t.dayLabel} {dayData.day}
                </h3>

                {dayData.items.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {t.emptyDay}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {dayData.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item, dayIdx, itemIdx)}
                        style={{ 
                          padding: '12px 16px', 
                          backgroundColor: 'white', 
                          border: '1px solid var(--border-color)', 
                          borderRadius: 'var(--radius-sm)', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          cursor: 'grab',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 500 }}>
                          <Move size={14} color="var(--text-muted)" className="no-print" />
                          <span>{item}</span>
                        </div>
                        <button
                          onClick={() => deleteActivity(dayIdx, itemIdx)}
                          title={t.deleteTip}
                          className="no-print"
                          style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default TripBuilder;
