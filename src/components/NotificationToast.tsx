import { useEffect, useState } from 'react';
import { subscribeToNotifications, type NotificationPayload } from '../systems/feedback';

interface Notification extends NotificationPayload {
  id: string;
}

export default function NotificationToast() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    return subscribeToNotifications((notification) => {
      setNotifications((prev) => [...prev, notification]);

      window.setTimeout(() => {
        setNotifications((prev) => prev.filter((entry) => entry.id !== notification.id));
      }, notification.duration ?? 3000);
    });
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div
      className="fixed top-20 right-4 z-[400] space-y-3"
      style={{ fontFamily: 'var(--font-pixel)' }}
      aria-live="polite"
      aria-atomic="true"
    >
      {notifications.map((notif) => {
        const colors = {
          success: { bg: '#22c55e', border: '#15803d', text: '#fff' },
          info: { bg: '#0ea5e9', border: '#0369a1', text: '#fff' },
          warning: { bg: '#f59e0b', border: '#b45309', text: '#fff' },
          error: { bg: '#ef4444', border: '#b91c1c', text: '#fff' },
        };

        const color = colors[notif.type];

        return (
          <div
            key={notif.id}
            className="px-5 py-3 rounded relative overflow-hidden"
            role={notif.type === 'error' ? 'alert' : 'status'}
            style={{
              background: `linear-gradient(180deg, ${color.bg} 0%, ${color.bg}dd 100%)`,
              border: `4px solid ${color.border}`,
              boxShadow: '5px 5px 0 rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.2)',
              color: color.text,
              minWidth: 280,
              maxWidth: 400,
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 'bold', textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
              {notif.message}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
