
declare global {
  const chrome: any;
}

export type ScreenState = 'welcome' | 'login' | 'dashboard' | 'assistant' | 'permission_request';

export interface IdentityStatus {
  verified: boolean;
  score: number;
  threatLevel: 'Low' | 'Medium' | 'High';
  lastScan: string;
}

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}
