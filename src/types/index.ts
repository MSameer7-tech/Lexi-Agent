import type { AgentEvent } from '../components/agent/ActivityTimeline';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
  events?: AgentEvent[];
  dictionary?: any | null;
}

export interface Session {
  id: string;
  title: string;
  preview?: string;
  topic?: string;
  isPinned?: boolean;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ApiResponse {
  response: string;
  sessionId: string;
}

export interface ApiRequest {
  message: string;
  sessionId: string;
}
