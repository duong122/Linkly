import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const stories = [
  { id: '1', username: 'your_story', avatar: '', isYourStory: true },
  { id: '2', username: 'user_one', avatar: '' },
  { id: '3', username: 'user_two', avatar: '' },
  { id: '4', username: 'user_three', avatar: '' },
  { id: '5', username: 'user_four', avatar: '' },
  { id: '6', username: 'user_five', avatar: '' },
  { id: '7', username: 'user_six', avatar: '' },
  { id: '8', username: 'user_seven', avatar: '' },
];

export default function StoriesBar() {
  return (
    <div className="border-b border-neutral-200 bg-white py-4 sticky top-0 z-10">
      <ScrollArea className="w-full">
        <div className="flex gap-4 px-4">
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0">
              <div className={`p-[2px] rounded-full ${story.isYourStory ? 'bg-neutral-200' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500'}`}>
                <div className="bg-white p-[2px] rounded-full">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={story.avatar} alt={story.username} />
                    <AvatarFallback className="bg-neutral-200 text-neutral-600 text-sm">
                      {story.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs text-foreground max-w-[64px] truncate">
                {story.username}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
