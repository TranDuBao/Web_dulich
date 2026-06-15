import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert', // 'alert' or 'confirm'
    severity: 'info', // 'success', 'error', 'warning', 'info'
    resolve: null
  });

  const showAlert = (message, severity = 'info', title = 'Thông báo') => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        title,
        message,
        type: 'alert',
        severity,
        resolve
      });
    });
  };

  const showConfirm = (message, title = 'Xác nhận', severity = 'warning') => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        title,
        message,
        type: 'confirm',
        severity,
        resolve
      });
    });
  };

  const handleClose = (value) => {
    if (modal.resolve) {
      modal.resolve(value);
    }
    setModal({
      isOpen: false,
      title: '',
      message: '',
      type: 'alert',
      severity: 'info',
      resolve: null
    });
  };

  return (
    <NotificationContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-card animate-fade-in" style={{ maxWidth: '400px', width: '90%', padding: '24px', textAlign: 'center' }}>
            <h3 style={{ 
              marginBottom: '16px', 
              fontSize: '1.25rem', 
              color: modal.severity === 'error' ? 'var(--danger-color)' : 
                     modal.severity === 'success' ? 'var(--success-color)' : 
                     modal.severity === 'warning' ? 'var(--warning-color)' : 'var(--primary-base)'
            }}>
              {modal.title}
            </h3>
            <p style={{ marginBottom: '24px', fontSize: '0.95rem', color: 'var(--text-main)' }}>{modal.message}</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {modal.type === 'confirm' && (
                <button 
                  onClick={() => handleClose(false)} 
                  className="btn btn-outline" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Hủy (Cancel)
                </button>
              )}
              <button 
                onClick={() => handleClose(true)} 
                className="btn btn-primary"
                style={{ 
                  padding: '8px 20px', 
                  fontSize: '0.85rem',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  backgroundColor: modal.severity === 'error' ? 'var(--danger-color)' :
                                   modal.severity === 'success' ? 'var(--success-color)' :
                                   modal.severity === 'warning' ? 'var(--warning-color)' : 'var(--secondary-base)'
                }}
              >
                Xác nhận (OK)
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
export default NotificationContext;
