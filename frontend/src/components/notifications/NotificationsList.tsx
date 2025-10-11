import { Card } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { HeartIcon, MessageCircleIcon, UserPlusIcon } from 'lucide-react';

const notifications = [
  {
    id: '1',
    type: 'like',
    user: 'Alice Johnson',
    action: 'liked your post',
    time: '5m ago',
    icon: HeartIcon,
  },
  {
    id: '2',
    type: 'comment',
    user: 'Bob Williams',
    action: 'commented on your post',
    time: '1h ago',
    icon: MessageCircleIcon,
  },
  {
    id: '3',
    type: 'follow',
    user: 'Carol Davis',
    action: 'started following you',
    time: '3h ago',
    icon: UserPlusIcon,
  },
];

export default function NotificationsList() {
  return (
    <Card className="divide-y divide-border bg-card text-card-foreground border-border">
      {notifications.map((notification) => {
        const Icon = notification.icon;
        return (
          <div
            key={notification.id}
            className="p-6 hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="" alt={notification.user} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {notification.user.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-foreground">
                  <span className="font-semibold">{notification.user}</span>{' '}
                  {notification.action}
                </p>
                <p className="text-sm text-muted-foreground">{notification.time}</p>
              </div>
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
        );
      })}
    </Card>
  );
}
