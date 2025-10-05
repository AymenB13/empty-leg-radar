export type NotificationChannel = {
  slack?: string;
  email?: string;
};

export type UserPreferences = {
  airports: string[];
  probThreshold: number;
  notifications: NotificationChannel;
  timezone: string;
};
