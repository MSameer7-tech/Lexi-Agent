import type { AgentEvent } from '../components/agent/ActivityTimeline';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
  events?: AgentEvent[];
}

export interface Session {
  id: string;
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
