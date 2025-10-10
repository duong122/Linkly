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

interface FeedState {
  posts: Post[];
  hasMore: boolean;
  loadMore: () => void;
}

const initialPosts: Post[] = [
  {
    id: '1',
    author: 'sarah_mitchell',
    avatar: '',
    timestamp: '2h',
    content: 'Just captured this amazing sunset! Nature never fails to amaze me. 🌅',
    image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_1.png',
    likes: 1234,
    comments: 18,
    isLiked: false,
    isSaved: false,
  },
  {
    id: '2',
    author: 'mike_chen',
    avatar: '',
    timestamp: '4h',
    content: 'Working on some exciting new designs today. Creativity is flowing! 🎨',
    image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_2.png',
    likes: 892,
    comments: 12,
    isLiked: false,
    isSaved: false,
  },
  {
    id: '3',
    author: 'emma_rodriguez',
    avatar: '',
    timestamp: '6h',
    content: 'Coffee and code - the perfect combination ☕💻',
    image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_3.png',
    likes: 2156,
    comments: 24,
    isLiked: true,
    isSaved: false,
  },
  {
    id: '4',
    author: 'david_park',
    avatar: '',
    timestamp: '8h',
    content: 'Community meetup was incredible! So many talented people 🚀',
    image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_4.png',
    likes: 1567,
    comments: 31,
    isLiked: false,
    isSaved: true,
  },
];

export const useFeedStore = create<FeedState>((set) => ({
  posts: initialPosts,
  hasMore: true,
  loadMore: () => {
    set((state) => {
      if (!state.hasMore) return state;

      const newPosts: Post[] = [
        {
          id: `${state.posts.length + 1}`,
          author: 'new_user',
          avatar: '',
          timestamp: 'Just now',
          content: 'This is a newly loaded post from infinite scroll!',
          image: 'https://c.animaapp.com/mgj6ccb4wKAw2A/img/ai_1.png',
          likes: Math.floor(Math.random() * 3000),
          comments: Math.floor(Math.random() * 50),
          isLiked: false,
          isSaved: false,
        },
      ];

      return {
        posts: [...state.posts, ...newPosts],
        hasMore: state.posts.length < 20,
      };
    });
  },
}));
