export interface NotificationData {
  title: string;
  message: string;
  datetime: Date;
  imageUrl?: string;
}

export interface NotificationOptions {
  id?: string;
  duration?: number;
  data: NotificationData;
}
