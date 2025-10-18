import { useState, useRef } from 'react';
import { HeartIcon, MessageCircleIcon, SendIcon, BookmarkIcon, MoreHorizontalIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import gsap from 'gsap';
import CommentModal from './CommentModal';

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

interface FeedItemProps {
  post: Post;
}

export default function FeedItem({ post: initialPost }: FeedItemProps) {
  const [post, setPost] = useState(initialPost);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const heartRef = useRef<HTMLButtonElement>(null);

  const handleLike = () => {
    if (heartRef.current) {
      gsap.fromTo(
        heartRef.current,
        { scale: 1 },
        {
          scale: 1.2,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        }
      );
    }

    setPost((prev) => ({
      ...prev,
      isLiked: !prev.isLiked,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
    }));
  };

  const handleSave = () => {
    setPost((prev) => ({
      ...prev,
      isSaved: !prev.isSaved,
    }));
  };

  const handleOpenComments = () => {
    setIsCommentModalOpen(true);
  };

  return (
    <>
      <article className="bg-white border-b border-neutral-200 pb-4 mb-4">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={post.avatar} alt={post.author} />
              <AvatarFallback className="bg-gradient-1 text-white text-xs">
                {post.author.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-foreground">{post.author}</span>
              <span className="text-neutral-500 text-sm">·</span>
              <span className="text-sm text-neutral-500">{post.timestamp}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent">
            <MoreHorizontalIcon className="w-5 h-5" />
          </Button>
        </div>

        {post.image && (
          <div className="w-full">
            <img
              src={post.image}
              alt="Post content"
              className="w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="px-4 pt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <Button
                ref={heartRef}
                variant="ghost"
                size="icon"
                onClick={handleLike}
                className="h-8 w-8 hover:bg-transparent p-0"
              >
                <HeartIcon 
                  className={cn(
                    "w-6 h-6",
                    post.isLiked ? "fill-red-500 text-red-500" : "text-foreground"
                  )} 
                />
              </Button>

              {/* ⭐ Comment Button - Mở Modal */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenComments}
                className="h-8 w-8 hover:bg-transparent p-0"
              >
                <MessageCircleIcon className="w-6 h-6 text-foreground" />
              </Button>

              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-transparent p-0">
                <SendIcon className="w-6 h-6 text-foreground" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              className="h-8 w-8 hover:bg-transparent p-0"
            >
              <BookmarkIcon 
                className={cn(
                  "w-6 h-6",
                  post.isSaved ? "fill-foreground text-foreground" : "text-foreground"
                )} 
              />
            </Button>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">{post.likes.toLocaleString()} likes</p>
            <p className="text-sm text-foreground">
              <span className="font-semibold mr-2">{post.author}</span>
              {post.content}
            </p>
            
            {/* ⭐ View Comments Button */}
            {post.comments > 0 && (
              <button
                onClick={handleOpenComments}
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                View all {post.comments} comments
              </button>
            )}
          </div>
        </div>
      </article>

      {/* ⭐ Comment Modal */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        post={post}
      />
    </>
  );
}