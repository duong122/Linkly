import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card } from '../ui/card';


export default function ProfileHeader() {
  return (
    <Card className="p-8 mb-8 bg-card text-card-foreground border-border">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <Avatar className="w-32 h-32">
          <AvatarImage src="" alt="Profile picture" />
          <AvatarFallback className="bg-primary text-primary-foreground text-4xl">JD</AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold text-foreground">John Doe</h1>
            <Button className="bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground font-normal">
              Edit Profile
            </Button>
          </div>

          <div className="flex gap-8 justify-center md:justify-start mb-4">
            <div>
              <p className="font-semibold text-foreground">142</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">1.2K</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">856</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>

          <p className="text-foreground font-body">
            Photography enthusiast | Travel lover | Coffee addict
          </p>
        </div>
      </div>
    </Card>
  );
}
