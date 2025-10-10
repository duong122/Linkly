import { useEffect, useRef } from 'react';
import { useFeedStore } from '@/stores/feedStore';
import FeedItem from './FeedItem';
import gsap from 'gsap';

export default function FeedList() {
  const { posts, loadMore, hasMore } = useFeedStore();
  const observerRef = useRef<HTMLDivElement>(null);
  const postsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  useEffect(() => {
    postsRef.current.forEach((post, index) => {
      if (post) {
        gsap.fromTo(
          post,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            delay: index * 0.08,
            ease: 'power2.out',
          }
        );
      }
    });
  }, [posts]);

  return (
    <div className="pt-4">
      {posts.map((post, index) => (
        <div
          key={post.id}
          ref={(el) => {
            if (el) postsRef.current[index] = el;
          }}
        >
          <FeedItem post={post} />
        </div>
      ))}
      <div ref={observerRef} className="h-4" />
    </div>
  );
}

