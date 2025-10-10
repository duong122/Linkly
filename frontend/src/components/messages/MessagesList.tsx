import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const messages = [
  { id: '1', name: 'Alice Johnson', lastMessage: 'Hey! How are you?', time: '2m ago', unread: true },
  { id: '2', name: 'Bob Williams', lastMessage: 'Thanks for sharing!', time: '1h ago', unread: false },
  { id: '3', name: 'Carol Davis', lastMessage: 'See you tomorrow!', time: '3h ago', unread: false },
];

export default function MessagesList() {
  return (
    <Card className="divide-y divide-border bg-card text-card-foreground border-border">
      {messages.map((message) => (
        <div
          key={message.id}
          className="p-6 hover:bg-neutral-100 transition-colors duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarImage src="" alt={message.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {message.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-foreground">{message.name}</p>
                <p className="text-sm text-muted-foreground">{message.time}</p>
              </div>
              <p className={`text-sm ${message.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {message.lastMessage}
              </p>
            </div>
            {message.unread && (
              <div className="w-3 h-3 rounded-full bg-primary" />
            )}
          </div>
        </div>
      ))}
    </Card>
  );
}
