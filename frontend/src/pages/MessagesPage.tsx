import { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Messages from '../components/messages/index';

export default function MessagesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Messages</h1>
        <Messages />
      </div>
    </MainLayout>
  );
}
