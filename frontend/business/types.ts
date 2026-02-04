
export enum AppStatus {
  VERIFIED = 'Verified',
  MAINTENANCE = 'Maintenance',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  users: string;
  status: AppStatus;
  website: string;
  logoInitial: string;
  color: string;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  app: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}

export interface WebhookLog {
  id: string;
  status: string;
  timestamp: string;
  action: string;
  statusCode: number;
}
