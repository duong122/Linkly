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
  currentUser: CurrentUser | null;
  fetchFeed: () => Promise<void>;
  loadMore: () => Promise<void>;

   // ⭐ THÊM: Methods mới
  loadPosts: (page?: number, size?: number) => Promise<void>;
  loadCurrentUser: () => Promise<void>;
  createPost: (image: File, caption: string) => Promise<void>;
}


interface CurrentUser {
  id: number;
  username: string;
  fullName: string;
  avatarUrl: string;
  email: string;
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

// ⭐ THÊM: Helper function cho multipart/form-data
const getAuthHeadersMultipart = () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.error('❌ No authentication token found in localStorage');
  }
  
  return {
    ...(token && { 'Authorization': `Bearer ${token}` }),
    // ❌ KHÔNG set Content-Type cho multipart, browser tự động set
  };
};

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
  
  // ⭐ THÊM: CurrentUser state
  currentUser: null,

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
        `${API_BASE_URL}/api/posts/feed?page=${nextPage}&size=10`,
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

  // ⭐ THÊM: loadPosts method (giống fetchFeed nhưng có thể custom page/size)
  loadPosts: async (page = 0, size = 10) => {
    const { loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(
        `${API_BASE_URL}/api/posts/feed?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers,
          credentials: 'include',
        }
      );
      
      console.log('📥 loadPosts response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ loadPosts error:', errorText);
        
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication required. Please login again.');
        }
        
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ loadPosts result:', result);
      
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
        throw new Error(result.message || 'Failed to load posts');
      }
    } catch (error) {
      console.error('Error in loadPosts:', error);
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      });
    }
  },

  // ⭐ THÊM: loadCurrentUser method
  loadCurrentUser: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('⚠️ No token found, skipping loadCurrentUser');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('❌ Failed to load current user');
        return;
      }

      const result = await response.json();
      console.log('✅ Current user loaded:', result);

      if (result.success && result.data) {
        set({
          currentUser: {
            id: result.data.id,
            username: result.data.username,
            fullName: result.data.fullName,
            avatarUrl: result.data.avatarUrl,
            email: result.data.email,
          },
        });
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  },

  // ⭐ THÊM: createPost method
  createPost: async (image: File, caption: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Tạo FormData
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);

      console.log('📤 Creating post...');
      console.log('📦 Image:', image.name, image.type, image.size);
      console.log('📝 Caption:', caption);

      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // ❌ KHÔNG set Content-Type, browser tự động set cho multipart
        },
        body: formData,
        credentials: 'include',
      });

      console.log('📥 Create post response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create post error:', errorText);
        throw new Error(`Failed to create post: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Post created successfully:', result);

      // Reload posts sau khi tạo thành công
      await get().loadPosts(0, 10);

      return result;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },
}));