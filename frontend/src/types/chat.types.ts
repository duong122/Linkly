// src/types/chat.types.ts

export interface User {
  id: number;
  username: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Participant {
  userId: number;
  user: User;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  sender?: User; // Thông tin sender có thể được join từ backend
  content: string;
  messageType: 'text' | 'image' | 'video' | 'file';
  createdAt: string; // Sử dụng string (ISO 8601 format) để dễ dàng serialize
}

export interface Conversation {
  id: number;
  participants: Participant[];
  lastMessage: Message | null;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TypingIndicator {
  conversationId: number;
  userId: number;
  username: string;
  isTyping: boolean;
}

// ---- API Request/Response Types ----

export interface SendMessageRequest {
  conversationId: number;
  content: string;
  messageType?: 'text' | 'image' | 'video' | 'file';
}

// FIX: Thêm định nghĩa cho CreateConversationRequest để sửa lỗi trong chatApi.service
export interface CreateConversationRequest {
  participantIds: number[];
  initialMessage?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Thêm interface này vào cuối file
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    // ... các trường khác
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: any;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface MessageRequest {
  recipientId: number;
  content: string;
}

// Định nghĩa kiểu dữ liệu trả về cho Conversations
export type ConversationResponse = Conversation[] | PageResponse<Conversation>;

// Định nghĩa kiểu dữ liệu trả về cho getConversations
export type ConversationApiData = PageResponse<Conversation>;