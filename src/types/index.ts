
export interface DictionaryDefinition {
  definition: string;
  example: string | null;
}

export interface DictionaryMeaning {
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryPronunciation {
  phonetic: string;
  audioUrl?: string | null;
}

export interface DictionaryData {
  word: string;
  phonetic: string | null;
  pronunciations?: DictionaryPronunciation[];
  meanings: DictionaryMeaning[];
  synonyms?: string[];
  antonyms?: string[];
}
import type { AgentEvent } from '../components/agent/ActivityTimeline';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
  events?: AgentEvent[];
  dictionary?: DictionaryData | null;
}

export interface Session {
  id: string;
  title: string;
  preview?: string;
  topic?: string;
  isPinned?: boolean;
  isLoaded?: boolean;
  hasMoreMessages?: boolean;
  nextMessageCursor?: any;
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
