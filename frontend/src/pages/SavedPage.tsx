import { useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import SavedPosts from '@/components/saved/SavedPosts';

export default function SavedPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Saved Posts</h1>
        <SavedPosts />
      </div>
    </MainLayout>
  );
}
