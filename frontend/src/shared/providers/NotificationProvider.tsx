import { useEffect, useState, type ReactNode } from 'react';
import {
  NOTIFICATION_EVENT,
  type NotificationPayload,
} from './notificationEvents';

type NotificationItem = NotificationPayload & {
  id: number;
  variant: NonNullable<NotificationPayload['variant']>;
};

type NotificationProviderProps = {
  children: ReactNode;
};

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const { detail } = event as CustomEvent<NotificationPayload>;
      const id = Date.now();

      setNotifications((current) => [
        ...current,
        {
          id,
          title: detail.title,
          description: detail.description,
          variant: detail.variant ?? 'info',
        },
      ]);

      window.setTimeout(() => {
        setNotifications((current) => current.filter((notification) => notification.id !== id));
      }, 5000);
    };

    window.addEventListener(NOTIFICATION_EVENT, handleNotification);

    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, handleNotification);
    };
  }, []);

  return (
    <>
      {children}
      <div className="notification-stack" aria-live="polite" aria-atomic="false">
        {notifications.map((notification) => (
          <div
            className={`notification-toast notification-toast--${notification.variant}`}
            key={notification.id}
          >
            <strong>{notification.title}</strong>
            {notification.description ? <p>{notification.description}</p> : null}
          </div>
        ))}
      </div>
    </>
  );
}
