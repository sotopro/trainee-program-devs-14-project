export type NotificationVariant = 'info' | 'success' | 'error';

export type NotificationPayload = {
  title: string;
  description?: string;
  variant?: NotificationVariant;
};

export const NOTIFICATION_EVENT = 'learnpath:notification';

export const notify = (payload: NotificationPayload) => {
  window.dispatchEvent(new CustomEvent<NotificationPayload>(NOTIFICATION_EVENT, { detail: payload }));
};

export const notifyError = (error: Error, source: string) => {
  notify({
    title: 'Se capturo un error',
    description: `${source}: ${error.message}`,
    variant: 'error',
  });
};
