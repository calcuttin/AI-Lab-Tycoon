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
          success: { bg: '#a5c992', border: '#425637', text: '#24311d' },
          info: { bg: '#b7d98e', border: '#536b3e', text: '#24311d' },
          warning: { bg: '#d9b778', border: '#b45309', text: '#24311d' },
          error: { bg: '#e49a8e', border: '#b91c1c', text: '#24311d' },
        };

        const color = colors[notif.type];

        return (
          <div
            key={notif.id}
            className="px-5 py-3 rounded-lg relative overflow-hidden"
            role={notif.type === 'error' ? 'alert' : 'status'}
            style={{
              background: `linear-gradient(180deg, ${color.bg} 0%, ${color.bg}dd 100%)`,
              border: `1px solid ${color.border}`,
              boxShadow: 'none',
              color: color.text,
              minWidth: 280,
              maxWidth: 400,
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 'bold', textShadow: 'none' }}>
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
