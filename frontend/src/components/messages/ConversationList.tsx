// src/components/messages/ConversationList.tsx

import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import type { Conversation, User } from '../../types/chat.types';
import ConversationItem from './ConversationItem';

interface ConversationListProps {
  conversations: Conversation[] | null | undefined;
  activeConversationId: number | null;
  currentUser: User;
  onSelectConversation: (id: number) => void;
  onCreateConversation?: () => void;
  loading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  currentUser,
  onSelectConversation,
  onCreateConversation,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(conversations ?? []);

useEffect(() => {
    // Tạo một mảng an toàn để sử dụng trong logic lọc
    const safeConversations = conversations ?? []; 
    
    if (searchQuery.trim() === '') {
      setFilteredConversations(safeConversations);
    } else {
      const query = searchQuery.toLowerCase();
      
      // Sử dụng mảng an toàn (safeConversations) để lọc
      const filtered = safeConversations.filter((conv) => {
        const otherParticipants = conv.participants.filter(
          (p) => p.userId !== currentUser.id
        );
        return otherParticipants.some((p) =>
          p.user.fullName.toLowerCase().includes(query) ||
          p.user.username.toLowerCase().includes(query)
        );
      });
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations, currentUser.id]);

  const arrayToSort = Array.isArray(filteredConversations) ? filteredConversations : [];

  const sortedConversations = [...arrayToSort].sort((a, b) => {
    const timeA = new Date(a.updatedAt).getTime();
    const timeB = new Date(b.updatedAt).getTime();
    return timeB - timeA;
  });

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Tin nhắn</h2>
          {onCreateConversation && (
            <button
              onClick={onCreateConversation}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Tạo cuộc trò chuyện mới"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          )}
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
            <p className="text-sm text-center">
              {searchQuery ? 'Không tìm thấy' : 'Chưa có cuộc trò chuyện'}
            </p>
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

export default ConversationList;