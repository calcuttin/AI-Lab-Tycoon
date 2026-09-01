export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface NotificationPayload {
  message: string;
  type: NotificationType;
  duration?: number;
}

export interface ParticlePayload {
  type: 'money' | 'reputation' | 'celebration';
  x: number;
  y: number;
}

type NotificationListener = (notification: NotificationPayload & { id: string }) => void;
type ParticleListener = (payload: ParticlePayload) => void;

let notificationIdCounter = 0;
const notificationListeners = new Set<NotificationListener>();
const particleListeners = new Set<ParticleListener>();

export function subscribeToNotifications(listener: NotificationListener) {
  notificationListeners.add(listener);
  return () => {
    notificationListeners.delete(listener);
  };
}

export function subscribeToParticles(listener: ParticleListener) {
  particleListeners.add(listener);
  return () => {
    particleListeners.delete(listener);
  };
}

export function showNotification(
  message: string,
  type: NotificationType = 'info',
  duration?: number,
) {
  const notification = {
    id: `notif-${notificationIdCounter++}`,
    message,
    type,
    duration: duration ?? 3000,
  };
  notificationListeners.forEach((listener) => listener(notification));
}

export function emitNotification(detail: NotificationPayload) {
  showNotification(detail.message, detail.type, detail.duration);
}

export function triggerParticleEffect(type: ParticlePayload['type'], x: number, y: number) {
  const payload = { type, x, y };
  particleListeners.forEach((listener) => listener(payload));
}
