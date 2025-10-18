// src/components/feed/CommentModal.tsx

import { useState, useEffect, useRef } from 'react';
import { X, Send, Heart, MoreHorizontal, Smile, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useFeedStore } from '../../stores/feedStore';

// ⭐ Update interface theo cấu trúc API
interface Comment {
  id: number;
  postId: number;
  content: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
  createdAt: string;
  updatedAt: string;
  likeCount?: number; // Optional nếu API không trả về
  isLikedByCurrentUser?: boolean; // Optional
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    author: string;
    avatar: string;
    timestamp: string;
    content: string;
    image?: string;
    likes: number;
    comments: number;
    isLiked: boolean;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  if (diffWeeks < 4) return `${diffWeeks}w`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function CommentModal({ isOpen, onClose, post }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useFeedStore();

  useEffect(() => {
    if (isOpen) {
      loadComments();
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  }, [isOpen, post.id]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_BASE_URL}/api/posts/${post.id}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load comments');

      const result = await response.json();
      console.log('✅ Comments loaded:', result);

      // ⭐ Handle API response structure
      let commentsArray: Comment[] = [];
      
      if (result.success && result.data) {
        if (result.data.content && Array.isArray(result.data.content)) {
          commentsArray = result.data.content;
        } else if (Array.isArray(result.data)) {
          commentsArray = result.data;
        }
      } else if (Array.isArray(result)) {
        commentsArray = result;
      }

      console.log('📝 Final comments:', commentsArray);
      setComments(commentsArray);
      
    } catch (error) {
      console.error('❌ Error loading comments:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_BASE_URL}/api/posts/${post.id}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: newComment.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to post comment');

      const result = await response.json();
      console.log('✅ Comment posted:', result);

      // ⭐ Thêm comment mới vào đầu danh sách (optimistic update)
      if (result.success && result.data) {
        setComments(prev => [result.data, ...prev]);
      } else {
        // Fallback: reload all comments
        await loadComments();
      }
      
      // Clear input
      setNewComment('');
      
    } catch (error) {
      console.error('❌ Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    // TODO: Implement like comment API
    console.log('Like comment:', commentId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left: Image */}
        {post.image && (
          <div className="flex-1 bg-black flex items-center justify-center">
            <img
              src={post.image}
              alt="Post"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}

        {/* Right: Comments */}
        <div className="w-[500px] flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={post.avatar} alt={post.author} />
                <AvatarFallback className="bg-gradient-1 text-white text-xs">
                  {post.author.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm">{post.author}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Caption (Original Post) */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={post.avatar} alt={post.author} />
                <AvatarFallback className="bg-gradient-1 text-white text-xs">
                  {post.author.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm">
                  <span className="font-semibold mr-2">{post.author}</span>
                  <span className="text-gray-700">{post.content}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{post.timestamp}</p>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle className="w-16 h-16 mb-2" />
                <p className="text-sm">No comments yet.</p>
                <p className="text-xs">Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    {/* ⭐ Dùng comment.user.avatarUrl */}
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={comment.user.avatarUrl} alt={comment.user.username} />
                      <AvatarFallback className="bg-gradient-1 text-white text-xs">
                        {comment.user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm">
                        {/* ⭐ Dùng comment.user.username */}
                        <span className="font-semibold mr-2">{comment.user.username}</span>
                        <span className="text-gray-700">{comment.content}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(comment.createdAt)}
                        </span>
                        {/* ⭐ Optional chaining cho likeCount */}
                        {(comment.likeCount ?? 0) > 0 && (
                          <span className="text-xs text-gray-400 font-semibold">
                            {comment.likeCount} {comment.likeCount === 1 ? 'like' : 'likes'}
                          </span>
                        )}
                        <button className="text-xs text-gray-400 font-semibold hover:text-gray-600">
                          Reply
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart
                        className={cn(
                          'w-4 h-4',
                          comment.isLikedByCurrentUser
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400 hover:text-gray-600'
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions & Stats */}
          <div className="border-t border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <button className="hover:text-gray-600">
                  <Heart
                    className={cn(
                      'w-6 h-6',
                      post.isLiked ? 'fill-red-500 text-red-500' : ''
                    )}
                  />
                </button>
                <button className="hover:text-gray-600">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="hover:text-gray-600">
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
            <p className="text-sm font-semibold mb-1">
              {post.likes.toLocaleString()} likes
            </p>
            <p className="text-xs text-gray-400">{post.timestamp}</p>
          </div>

          {/* Comment Input */}
          <form
            onSubmit={handleSubmitComment}
            className="border-t border-gray-200 px-4 py-3 flex items-center gap-3"
          >
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
            >
              <Smile className="w-6 h-6" />
            </button>
            <input
              ref={commentInputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 outline-none text-sm"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="text-blue-500 font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:text-blue-600"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}