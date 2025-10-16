// feedStore.ts
import { create } from 'zustand';

interface Post {
  id: string;
  author: string;
  avatar: string;
  timestamp: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
}

interface ApiPost {
  id: number;
  userId: number;
  username: string;
  userFullName: string;
  userAvatarUrl: string;
  caption: string;
  imageUrl: string;
  likeCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeedState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  fetchFeed: () => Promise<void>;
  loadMore: () => Promise<void>;
}

// Định nghĩa URL API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

const formatTimestamp = (dateString: string): string => {

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const transformApiPost = (apiPost: ApiPost): Post => ({
  id: apiPost.id.toString(),
  author: apiPost.userFullName,
  avatar: apiPost.userAvatarUrl,
  timestamp: formatTimestamp(apiPost.createdAt),
  content: apiPost.caption,
  image: apiPost.imageUrl.startsWith('http') 
    ? apiPost.imageUrl 
    : `${API_BASE_URL}${apiPost.imageUrl}`,
  likes: apiPost.likeCount,
  comments: apiPost.commentCount,
  isLiked: apiPost.isLikedByCurrentUser,
  isSaved: false,
});

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  
  console.log('🔑 Token found:', token ? 'Yes (length: ' + token.length + ')' : 'No');
  
  if (!token) {
    console.error('❌ No authentication token found in localStorage');
  }
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  currentPage: 0,
  totalPages: 0,
  hasMore: true,

  fetchFeed: async () => {
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const headers = getAuthHeaders();
      console.log('📤 Request headers:', headers);
      
      const response = await fetch(`${API_BASE_URL}/api/posts/feed?page=0&size=10`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        // Nếu lỗi 401 hoặc 403 - có thể do token hết hạn hoặc không hợp lệ
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication required. Please login again.');
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ API result:', result);
      
      if (result.success && result.data) {
        const transformedPosts = result.data.content.map(transformApiPost);
        
        set({
          posts: transformedPosts,
          currentPage: result.data.pageNumber,
          totalPages: result.data.totalPages,
          hasMore: !result.data.last,
          loading: false,
        });
      } else {
        throw new Error(result.message || 'Failed to fetch feed');
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  loadMore: async () => {
    const { loading, hasMore, currentPage, posts } = get();
    if (loading || !hasMore) return;

    set({ loading: true, error: null });

    try {
      const nextPage = currentPage + 1;
      const response = await fetch(
        `http://localhost:8080/api/posts/feed?page=${nextPage}&size=10`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
        }
      );
      
      console.log('Load more response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Load more error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Load more result:', result);
      
      if (result.success && result.data) {
        const transformedPosts = result.data.content.map(transformApiPost);
        
        set({
          posts: [...posts, ...transformedPosts],
          currentPage: result.data.pageNumber,
          totalPages: result.data.totalPages,
          hasMore: !result.data.last,
          loading: false,
        });
      } else {
        throw new Error(result.message || 'Failed to load more posts');
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },
}));