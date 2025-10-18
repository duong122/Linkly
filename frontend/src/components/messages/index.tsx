import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Phone, Video, MoreVertical, Search, Plus, Copy, Trash2, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import type { Conversation, Message, User, TypingIndicator } from '../../types/chat.types';

// ConversationItem Component
const ConversationItem: React.FC<{
  conversation: Conversation;
  currentUser: User;
  isActive: boolean;
  onClick: () => void;
}> = ({ conversation, currentUser, isActive, onClick }) => {
  const otherParticipants = conversation.participants.filter((p) => p.userId !== currentUser.id);
  const displayName = otherParticipants.length === 1
    ? otherParticipants[0].user.fullName
    : otherParticipants.map((p) => p.user.fullName).join(', ');
  const avatarUrl = otherParticipants.length === 1 ? otherParticipants[0].user.avatarUrl : undefined;

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getLastMessagePreview = (): string => {
    if (!conversation.lastMessage) return 'Chưa có tin nhắn';
    const { content, senderId, messageType } = conversation.lastMessage;
    const isCurrentUser = senderId === currentUser.id;
    const prefix = isCurrentUser ? 'Bạn: ' : '';
    if (messageType === 'image') return `${prefix}Đã gửi một ảnh`;
    if (messageType === 'video') return `${prefix}Đã gửi một video`;
    if (messageType === 'file') return `${prefix}Đã gửi một file`;
    return `${prefix}${content}`;
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="relative flex-shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        {otherParticipants.length > 1 && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
            {otherParticipants.length + 1}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate text-sm">{displayName}</h3>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{formatTime(conversation.updatedAt)}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate">{getLastMessagePreview()}</p>
          {conversation.unreadCount && conversation.unreadCount > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ConversationList Component
const ConversationList: React.FC<{
  conversations: Conversation[];
  activeConversationId: number | null;
  currentUser: User;
  onSelectConversation: (id: number) => void;
  loading?: boolean;
}> = ({ conversations, activeConversationId, currentUser, onSelectConversation, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(conversations);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = conversations.filter((conv) => {
        const otherParticipants = conv.participants.filter((p) => p.userId !== currentUser.id);
        return otherParticipants.some((p) =>
          p.user.fullName.toLowerCase().includes(query) || p.user.username.toLowerCase().includes(query)
        );
      });
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations, currentUser.id]);

  const safeConversations = conversations ?? [];

  const sortedConversations = [...safeConversations].sort((a, b) => {
    const timeA = new Date(a.updatedAt).getTime();
    const timeB = new Date(b.updatedAt).getTime();
    return timeB - timeA;
  });

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Tin nhắn</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <p className="text-sm text-center">{searchQuery ? 'Không tìm thấy' : 'Chưa có cuộc trò chuyện'}</p>
          </div>
        ) : (
          sortedConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              currentUser={currentUser}
              isActive={activeConversationId === conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// MessageBubble Component
const MessageBubble: React.FC<{
  message: Message;
  currentUser: User;
  showAvatar: boolean;
  onDelete: (id: number) => void;
}> = ({ message, currentUser, showAvatar, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);
  const isCurrentUser = message.senderId === currentUser.id;

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowOptions(false);
  };

  const handleDelete = () => {
    if (window.confirm('Xóa tin nhắn này?')) {
      onDelete(message.id);
      setShowOptions(false);
    }
  };

  return (
    <div className={`flex gap-2 mb-3 group ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && showAvatar && (
        <div className="flex-shrink-0">
          {message.sender?.avatarUrl ? (
            <img src={message.sender.avatarUrl} alt={message.sender.fullName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white text-xs font-semibold">
              {message.sender?.fullName?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
      )}
      {!isCurrentUser && !showAvatar && <div className="w-8" />}
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && showAvatar && message.sender && (
          <p className="text-xs text-gray-500 mb-1 ml-2">{message.sender.fullName}</p>
        )}
        <div className="relative">
          <div className={`px-4 py-2 rounded-2xl ${isCurrentUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
            <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className={`absolute top-0 ${isCurrentUser ? 'right-full mr-2' : 'left-full ml-2'} opacity-0 group-hover:opacity-100 transition-opacity`}>
            <div className="relative">
              <button onClick={() => setShowOptions(!showOptions)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
              {showOptions && (
                <div className={`absolute ${isCurrentUser ? 'right-0' : 'left-0'} mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10`}>
                  <button onClick={handleCopy} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <Copy className="w-4 h-4" />Sao chép
                  </button>
                  {isCurrentUser && (
                    <button onClick={handleDelete} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 text-red-600">
                      <Trash2 className="w-4 h-4" />Xóa
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          <span>{formatTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

// MessageList Component
const MessageList: React.FC<{
  messages: Message[];
  currentUser: User;
  loading?: boolean;
  onDeleteMessage: (id: number) => void;
}> = ({ messages, currentUser, loading, onDeleteMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach((message) => {
      const date = new Date(message.createdAt);
      const dateKey = date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">👋</p>
          <p>Chưa có tin nhắn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
      {Object.entries(messageGroups).map(([date, msgs]) => (
        <div key={date}>
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">{date}</div>
          </div>
          {msgs.map((message, index) => {
            const prevMessage = index > 0 ? msgs[index - 1] : null;
            const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
            return (
              <MessageBubble
                key={message.id}
                message={message}
                currentUser={currentUser}
                showAvatar={showAvatar}
                onDelete={onDeleteMessage}
              />
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

// MessageInput Component
const MessageInput: React.FC<{
  onSendMessage: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}> = ({ onSendMessage, onTypingStart, onTypingStop }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTypingStart();
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTypingStop();
      }
    }, 2000);
  };

  const handleSend = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      onSendMessage(trimmedValue);
      setInputValue('');
      if (isTyping) {
        setIsTyping(false);
        onTypingStop();
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex items-end gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 max-h-32 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="w-full bg-transparent resize-none outline-none text-sm max-h-28 overflow-y-auto"
            rows={1}
            style={{ minHeight: '24px' }}
          />
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Smile className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className={`p-2 rounded-full transition-colors ${inputValue.trim() ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ChatWindow Component
const ChatWindow: React.FC<{
  conversation: Conversation | null;
  messages: Message[];
  currentUser: User;
  typingIndicators: TypingIndicator[];
  onSendMessage: (content: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onDeleteMessage: (id: number) => void;
  loading?: boolean;
}> = ({ conversation, messages, currentUser, typingIndicators, onSendMessage, onTypingStart, onTypingStop, onDeleteMessage, loading }) => {
  const [showOptions, setShowOptions] = useState(false);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Chọn một cuộc trò chuyện</h3>
          <p className="text-gray-500">Chọn conversation để bắt đầu</p>
        </div>
      </div>
    );
  }

  const otherParticipants = conversation.participants.filter((p) => p.userId !== currentUser.id);
  const displayName = otherParticipants.length === 1 ? otherParticipants[0].user.fullName : otherParticipants.map((p) => p.user.fullName).join(', ');
  const avatarUrl = otherParticipants.length === 1 ? otherParticipants[0].user.avatarUrl : undefined;
  const isTyping = typingIndicators.some((t) => t.conversationId === conversation.id && t.isTyping);
  const typingUsers = typingIndicators.filter((t) => t.conversationId === conversation.id && t.isTyping).map((t) => t.username);

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{displayName}</h3>
            {isTyping && (
              <p className="text-xs text-blue-500 italic">
                {typingUsers.length === 1 ? `${typingUsers[0]} đang nhập...` : `${typingUsers.length} người đang nhập...`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={() => setShowOptions(!showOptions)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      <MessageList messages={messages} currentUser={currentUser} loading={loading} onDeleteMessage={onDeleteMessage} />
      <MessageInput onSendMessage={onSendMessage} onTypingStart={onTypingStart} onTypingStop={onTypingStop} />
    </div>
  );
};

// Main MessagesPage Component
const MessagesPage: React.FC = () => {
  const {
    currentUser,
    conversations,
    messagesByConversation,
    activeConversationId,
    typingIndicators,
    connected,
    loading,
    error,
    loadCurrentUser,
    setCurrentUser,
    setActiveConversation,
    loadConversations,
    sendMessage,
    deleteMessage,
    sendTypingIndicator,
    connectWebSocket,
    setError,
  } = useChatStore();


// 1. useEffect để load user và kết nối WebSocket (chạy 1 lần)
 useEffect(() => {
    try {
        loadCurrentUser(); // Bắt đầu load user
        const token = localStorage.getItem('authToken') || 'demo-token';
        connectWebSocket(token); // Bắt đầu kết nối WS
    } catch (e) {
        console.error("Initialization Error:", e);
        setError("Lỗi khởi tạo kết nối."); // Báo lỗi cho người dùng
    }
  }, [loadCurrentUser, connectWebSocket, setError]);

  // 2. useEffect thứ hai để load conversations
  //    Sẽ tự động chạy KHI 'currentUser' thay đổi (từ null -> object)
  useEffect(() => {
    if (currentUser) {
      // Chỉ load conversations khi đã có thông tin user
      loadConversations();
    }
  }, [currentUser, loadConversations]);

  const safeConversations = conversations ?? [];

  const activeConversation = safeConversations.find((c) => c.id === activeConversationId) || null;
  const messages = activeConversationId ? messagesByConversation[activeConversationId] || [] : [];

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <div className="absolute top-4 right-4 z-50">
        {connected ? (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg shadow-sm">
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Đã kết nối</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg shadow-sm">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Mất kết nối</span>
          </div>
        )}
      </div>
      {error && (
        <div className="absolute top-16 right-4 z-50 max-w-md">
          <div className="flex items-start gap-2 bg-red-50 text-red-800 px-4 py-3 rounded-lg shadow-lg border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Lỗi</p>
              <p className="text-sm">{error}</p>
              <button onClick={() => setError(null)} className="text-xs underline mt-1">Đóng</button>
            </div>
          </div>
        </div>
      )}
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        currentUser={currentUser}
        onSelectConversation={setActiveConversation}
        loading={loading}
      />
      <ChatWindow
        conversation={activeConversation}
        messages={messages}
        currentUser={currentUser}
        typingIndicators={typingIndicators}
        onSendMessage={sendMessage}
        onTypingStart={() => sendTypingIndicator(true)}
        onTypingStop={() => sendTypingIndicator(false)}
        onDeleteMessage={deleteMessage}
        loading={loading}
      />
    </div>
  );
};

export default MessagesPage;