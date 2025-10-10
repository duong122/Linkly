import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const suggestedUsers = [
  { id: '1', name: 'alice_johnson', subtitle: 'Followed by user1 + 2 more', avatar: '' },
  { id: '2', name: 'bob_williams', subtitle: 'Followed by user2 + 3 more', avatar: '' },
  { id: '3', name: 'carol_davis', subtitle: 'New to Instagram', avatar: '' },
  { id: '4', name: 'david_miller', subtitle: 'Followed by user3 + 1 more', avatar: '' },
  { id: '5', name: 'emma_wilson', subtitle: 'Followed by user4', avatar: '' },
];

export default function SuggestedUsers() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-500">Suggested for you</h3>
        <Button variant="ghost" size="sm" className="text-xs font-semibold text-foreground hover:text-neutral-500 hover:bg-transparent p-0 h-auto">
          See All
        </Button>
      </div>
      
      <div className="space-y-3">
        {suggestedUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-11 h-11">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-2 text-white text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm text-foreground">{user.name}</p>
                <p className="text-xs text-neutral-500">{user.subtitle}</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-xs font-semibold text-blue-500 hover:text-blue-600 hover:bg-transparent p-0 h-auto">
              Follow
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
