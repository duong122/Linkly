// src/stores/chatStore.ts

import { create } from 'zustand';
import chatApiService from '../lib/chatApi.service'; // Giả sử bạn di chuyển file service vào đây
import websocketService from '../lib/websocket.service'; // Giả sử bạn di chuyển file service vào đây
import type { Conversation, Message, User, TypingIndicator } from '../types/chat.types';



interface ChatState {
  currentUser: User | null;
  conversations: Conversation[];
  messagesByConversation: Record<number, Message[]>;
  activeConversationId: number | null;
  typingIndicators: TypingIndicator[];
  connected: boolean;
  loading: boolean;
  error: string | null;
}

interface ChatActions {
  setCurrentUser: (user: User) => void;
  connectWebSocket: (token: string) => void;
  loadConversations: () => Promise<void>;
  setActiveConversation: (conversationId: number) => Promise<void>;
  loadCurrentUser: () => Promise<void>;
  sendMessage: (content: string) => void;
  deleteMessage: (messageId: number) => Promise<void>;
  sendTypingIndicator: (isTyping: boolean) => void;
  setError: (error: string | null) => void;
}



export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  // ---- Initial State ----
  currentUser: null,
  conversations: [],
  messagesByConversation: {},
  activeConversationId: null,
  typingIndicators: [],
  connected: false,
  loading: false,
  error: null,


  // ---- Actions ----
  setCurrentUser: (user) => set({ currentUser: user }),
  setError: (error) => set({ error }),  

 loadCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const result = await chatApiService.getCurrentUser(); 
      
      if (result.success && result.data) {
        set({ currentUser: result.data, loading: false }); 
      } else {
        // ⭐️ FIX: Lấy 'message' từ API nếu 'error' không tồn tại
        // API của bạn dường như dùng 'message' để báo lỗi (dựa theo ví dụ getConversations)
        const errorMessage = (result as any).message || result.error || 'Failed to load current user';
        
        set({ 
          error: errorMessage, // Dùng errorMessage rõ ràng hơn
          loading: false,
          currentUser: null // Đảm bảo User là null nếu lỗi
        });
        // ⭐️ FIX: Log lỗi 'errorMessage'
        console.error("Failed to load user:", errorMessage); 
      }
    } catch (error) {
      set({ error: 'System error during user load', loading: false, currentUser: null });
      console.error("Load Current User FAILED:", error);
    }
  },

loadConversations: async () => {
    set({ loading: true, error: null });

    // ⭐️ FIX: Lấy currentUser TỪ TRONG STORE
    // Chúng ta cần thông tin này để xây dựng mảng 'participants'
    const currentUser = get().currentUser;

    // Nếu chưa load được user, không thể xử lý conversation
    if (!currentUser) {
      set({ 
        error: 'Người dùng chưa được tải, không thể tải cuộc trò chuyện.', 
        loading: false 
      });
      console.warn("loadConversations: Bỏ qua vì currentUser là null.");
      return; 
    }

    try {
      const result = await chatApiService.getConversations();
      
      if (result.success && result.data) {
        let conversationsData: Conversation[] = [];

        // Kiểm tra định dạng Phân trang (Page<T>)
        if (
          typeof result.data === 'object' && 
          'content' in result.data && 
          Array.isArray(result.data.content)
        ) {
          // Dữ liệu thô từ API (mảng các conversation "phẳng")
          const apiConversations: any[] = result.data.content;

          // Tạo participant cho chính người dùng hiện tại
          // Component ConversationItem cần điều này để lọc ra "người kia"
          const currentUserParticipant = {
            userId: currentUser.id,
            user: {
              id: currentUser.id,
              username: currentUser.username,
              fullName: currentUser.fullName,
              avatarUrl: currentUser.avatarUrl,
            },
          };

          // ⭐️ FIX: CHUYỂN ĐỔI DỮ LIỆU TỪ API
          // Biến đổi mảng "phẳng" thành mảng có "participants"
          const transformedConversations: Conversation[] = apiConversations.map((apiConv) => {
            
            // Bắt đầu mảng participants với user hiện tại
            const participants = [currentUserParticipant];

            // Chỉ thêm "người kia" nếu họ tồn tại
            if (apiConv.otherUserId) {
              participants.push({
                userId: apiConv.otherUserId,
                user: {
                  id: apiConv.otherUserId,
                  username: apiConv.otherUsername,
                  // Component dùng 'fullName', nhưng API chỉ có 'otherUsername'
                  // Chúng ta sẽ ánh xạ 'otherUsername' vào 'fullName'
                  fullName: apiConv.otherUsername || 'Người dùng', 
                  avatarUrl: apiConv.otherUserAvatarUrl,
                }
              });
            }
            // (Nếu sau này có group chat, logic ở đây sẽ phức tạp hơn)

            // Trả về đối tượng Conversation hoàn chỉnh
            return {
              id: apiConv.id,
              lastMessage: apiConv.lastMessage,
              updatedAt: apiConv.updatedAt,
              
              // ⭐️ FIX: Thêm 'createdAt'
              // Gán bằng 'updatedAt' vì API không cung cấp trường 'createdAt' riêng
              createdAt: apiConv.updatedAt, 

              unreadCount: apiConv.unreadCount || 0, 
              participants: participants, 
            };
          });
          
          conversationsData = transformedConversations;

        } else if (Array.isArray(result.data)) {
          // (Giữ lại logic cũ phòng trường hợp API trả về mảng trực tiếp)
          conversationsData = result.data;

        } else {
           set({ 
             error: 'Không thể tải danh sách cuộc trò chuyện (Dữ liệu không hợp lệ).', 
             loading: false 
           });
           return;
        }

        // Cập nhật state với dữ liệu ĐÃ ĐƯỢC CHUYỂN ĐỔI
        set({ 
          conversations: conversationsData, 
          loading: false,
          activeConversationId: 
            get().activeConversationId || conversationsData[0]?.id || null, 
        });

      } else {
        set({ error: result.error || 'Lỗi tải cuộc trò chuyện.', loading: false });
      }
    } catch (error) {
      set({ error: 'Lỗi hệ thống khi tải cuộc trò chuyện.', loading: false });
    }
  },

 setActiveConversation: async (conversationId) => {
    set({ activeConversationId: conversationId, loading: true });
    const response = await chatApiService.getConversationMessages(conversationId);

    if (response.success && response.data) {
      const messagesPage = response.data;

      set((state) => ({ // <--- Sử dụng set từ Zustand
        // ✅ Khắc phục lỗi: Đảm bảo bạn đang trả về đối tượng messagesByConversation mới
        messagesByConversation: { 
          ...state.messagesByConversation,
          [conversationId]: messagesPage.content.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ),
        },
      }));
    } else {
      set({ error: 'Không thể tải tin nhắn.' });
    }
    set({ loading: false });
},



sendMessage: (content: string) => {
  const { activeConversationId, conversations, currentUser } = get();
  
  if (!activeConversationId) {
    console.error('❌ No active conversation');
    set({ error: 'Chưa chọn cuộc trò chuyện' });
    return;
  }

  if (!currentUser) {
    console.error('❌ No current user');
    set({ error: 'Người dùng chưa được tải' });
    return;
  }

  // ⭐ TÌM CONVERSATION ĐỂ LẤY RECIPIENT ID
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  
  if (!activeConversation) {
    console.error('❌ Active conversation not found');
    set({ error: 'Không tìm thấy cuộc trò chuyện' });
    return;
  }

  // ⭐ LẤY RECIPIENT ID (người nhận = người kia trong conversation)
  const recipientParticipant = activeConversation.participants.find(
    p => p.userId !== currentUser.id
  );

  if (!recipientParticipant) {
    console.error('❌ Recipient not found in conversation');
    set({ error: 'Không tìm thấy người nhận' });
    return;
  }

  const recipientId = recipientParticipant.userId;

  console.log('📤 Sending message:');
  console.log('  - Conversation ID:', activeConversationId);
  console.log('  - Recipient ID:', recipientId);
  console.log('  - Content:', content);

  // ⭐ GỬI VỚI RECIPIENT ID, KHÔNG PHẢI CONVERSATION ID
  websocketService.sendMessage(recipientId, content);
},

sendTypingIndicator: (isTyping: boolean) => {
  const { activeConversationId, conversations, currentUser } = get();
  
  if (!activeConversationId || !currentUser) {
    return;
  }

  // Tìm recipientId giống như ở trên
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  if (!activeConversation) return;

  const recipientParticipant = activeConversation.participants.find(
    p => p.userId !== currentUser.id
  );

  if (!recipientParticipant) return;

  websocketService.sendTypingIndicator(recipientParticipant.userId, isTyping);
},
  deleteMessage: async (messageId) => {
     const { activeConversationId } = get();
     if (!activeConversationId) return;

     const response = await chatApiService.deleteMessage(messageId);
     if (response.success) {
        set(state => ({
            messagesByConversation: {
                ...state.messagesByConversation,
                [activeConversationId]: state.messagesByConversation[activeConversationId].filter(msg => msg.id !== messageId)
            }
        }))
     } else {
        set({ error: 'Không thể xóa tin nhắn.' });
     }
  },


connectWebSocket: (token) => {
  websocketService.connect(token).catch(err => {
    set({ error: "Không thể kết nối tới máy chủ chat." })
  });

  websocketService.onConnect(() => {
    console.log('🎉 WebSocket connection established in store');
    set({ connected: true });
  });

  websocketService.onDisconnect(() => {
    console.log('❌ WebSocket disconnected in store');
    set({ connected: false });
  });

  websocketService.onError((error) => {
    console.error('❌ WebSocket error in store:', error);
    set({ error });
  });

  // ⭐ QUAN TRỌNG: onMessage phải xử lý đúng
  websocketService.onMessage((message) => {
    console.log('📨 MESSAGE RECEIVED IN STORE:', message);
    console.log('📨 Message details:', {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt
    });
    
    set((state) => {
      const conversationId = message.conversationId;
      
      if (!conversationId) {
        console.error('❌ Message has no conversationId:', message);
        return state;
      }

      const existingMessages = state.messagesByConversation[conversationId] || [];
      
      // ⭐ Kiểm tra trùng lặp
      const isDuplicate = existingMessages.some(m => m.id === message.id);
      
      if (isDuplicate) {
        console.log('⚠️ Duplicate message ignored:', message.id);
        return state;
      }

      console.log('✅ Adding new message to conversation:', conversationId);
      
      // ⭐ Thêm message mới vào cuối mảng và sắp xếp
      const updatedMessages = [...existingMessages, message].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      console.log('📊 Updated messages count:', updatedMessages.length);

      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: updatedMessages,
        },
        // ⭐ Cập nhật lastMessage trong danh sách conversations
        conversations: state.conversations.map(c => 
          c.id === conversationId 
            ? { 
                ...c, 
                lastMessage: message, 
                updatedAt: message.createdAt 
              } 
            : c
        ).sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      };
    });
  });

  websocketService.onTyping((typing) => {
    console.log('⌨️ Typing indicator received:', typing);
    set((state) => ({
      typingIndicators: [
        ...state.typingIndicators.filter(t => t.userId !== typing.userId),
        typing,
      ],
    }));
  });
},
}));