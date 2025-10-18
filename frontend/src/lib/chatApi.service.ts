// services/chatApi.service.ts

import type { 
  Conversation, 
  Message, 
  SendMessageRequest, 
  CreateConversationRequest,
  ApiResponse,
    Page,
    User,
    ConversationResponse,
    ConversationApiData
    
} from '../types/chat.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http:/localhost:8080';

class ChatApiService {
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  private async fetchWithAuth<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        // Cố gắng đọc lỗi từ body
        const errorBody = await response.text();
        console.error('API Error Body:', errorBody);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // ⭐️ FIX: Trả về trực tiếp data đã parse
      // API của bạn đã trả về đúng định dạng ApiResponse (success, data, error)
      // nên chúng ta chỉ cần trả về nó, không cần gói lại.
      const data: ApiResponse<T> = await response.json();
      return data;

    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null as T, // Đảm bảo kiểu dữ liệu
      };
    }
  }
  // 1. POST /api/messages - Gửi tin nhắn
  async sendMessage(request: SendMessageRequest): Promise<ApiResponse<Message>> {
    return this.fetchWithAuth<Message>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

// 2. GET /api/messages/conversations - Lấy danh sách conversations
  async getConversations(): Promise<ApiResponse<ConversationApiData>> {
    return this.fetchWithAuth<ConversationApiData>('/api/messages/conversations');
  }
// 3. GET /api/messages/conversations/{id} - Lấy tin nhắn trong conversation
async getConversationMessages(
  conversationId: number,
  page: number = 0,
  size: number = 20
// ✅ FIX: Đã đổi sang Page<Message>
): Promise<ApiResponse<Page<Message>>> { 
  return this.fetchWithAuth<Page<Message>>(
    `/api/messages/conversations/${conversationId}?page=${page}&size=${size}`
  );
}

  // 4. DELETE /api/messages/{id} - Xóa tin nhắn
  async deleteMessage(messageId: number): Promise<ApiResponse<void>> {
    return this.fetchWithAuth<void>(`/api/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  // Tạo conversation mới (nếu API có hỗ trợ)
  async createConversation(
    request: CreateConversationRequest
  ): Promise<ApiResponse<Conversation>> {
    return this.fetchWithAuth<Conversation>('/api/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const token = this.getAuthToken();
    if (!token) {
      return { success: false, error: 'Authentication token not found.', data: undefined };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch user' }));
        return { success: false, error: errorData.message || `Error status: ${response.status}`, data: undefined };
      }

      // API trả về trực tiếp đối tượng User, chúng ta sẽ "gói" nó lại
      const userData: User = await response.json();
      
      return { success: true, data: userData };

    } catch (error) {
      console.error('Get current user failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred.',
        data: undefined,
      };
    }
  }
    
}

export const chatApiService = new ChatApiService();
export default chatApiService;