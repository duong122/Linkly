import { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ExploreGrid from '../components/explore/ExploreGrid';

export default function ExplorePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Explore</h1>
        <ExploreGrid />
      </div>
    </MainLayout>
  );
}
