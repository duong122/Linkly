import { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import NotificationsList from '../components/notifications/NotificationsList';

export default function NotificationsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Notifications</h1>
        <NotificationsList />
      </div>
    </MainLayout>
  );
}
