import SuggestedUsers from '@/components/suggestions/SuggestedUsers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function RightSidebar() {
  return (
    <aside className="w-[320px] bg-white sticky top-0 h-screen overflow-y-auto">
      <div className="pt-8 px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="w-11 h-11">
              <AvatarImage src="" alt="Your profile" />
              <AvatarFallback className="bg-gradient-1 text-white text-sm">YU</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground">your_username</p>
              <p className="text-xs text-neutral-500">Your Name</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs font-semibold text-blue-500 hover:text-blue-600 hover:bg-transparent p-0 h-auto">
            Switch
          </Button>
        </div>

        <SuggestedUsers />
        
        <div className="mt-8 text-xs text-neutral-400 space-y-3">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <a href="#" className="hover:underline">About</a>
            <span>·</span>
            <a href="#" className="hover:underline">Help</a>
            <span>·</span>
            <a href="#" className="hover:underline">Press</a>
            <span>·</span>
            <a href="#" className="hover:underline">API</a>
            <span>·</span>
            <a href="#" className="hover:underline">Jobs</a>
            <span>·</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:underline">Terms</a>
          </div>
          <p>© 2024 INSTAGRAM FROM META</p>
        </div>
      </div>
    </aside>
  );
}
