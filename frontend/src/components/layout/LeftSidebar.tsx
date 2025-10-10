import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CompassIcon, MessageCircleIcon, BellIcon, BookmarkIcon, UserIcon, SettingsIcon, PlusSquareIcon, MenuIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: HomeIcon, label: 'Home', path: '/' },
  { icon: CompassIcon, label: 'Explore', path: '/explore' },
  { icon: MessageCircleIcon, label: 'Messages', path: '/messages' },
  { icon: BellIcon, label: 'Notifications', path: '/notifications' },
  { icon: PlusSquareIcon, label: 'Create', path: '/create' },
  { icon: BookmarkIcon, label: 'Saved', path: '/saved' },
  { icon: UserIcon, label: 'Profile', path: '/profile' },
];

export default function LeftSidebar() {
  const location = useLocation();

  return (
    <aside className="w-[245px] border-r border-neutral-200 bg-white sticky top-0 h-screen flex flex-col">
      <div className="p-6 pb-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">Instagram</span>
        </Link>
      </div>
      
      <nav className="flex-1 px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer mb-1',
                isActive
                  ? 'font-bold'
                  : 'font-normal hover:bg-neutral-50'
              )}
            >
              <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5]" : "stroke-[1.5]")} />
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 pb-6">
        <Button
          variant="ghost"
          className="w-full justify-start gap-4 px-3 py-3 h-auto font-normal hover:bg-neutral-50"
        >
          <MenuIcon className="w-6 h-6 stroke-[1.5]" />
          <span className="text-base">More</span>
        </Button>
      </div>
    </aside>
  );
}
