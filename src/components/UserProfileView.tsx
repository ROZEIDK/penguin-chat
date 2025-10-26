import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";

interface UserProfile {
  username: string;
  avatarUrl?: string;
  bio?: string;
}

interface UserProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSendMessage: () => void;
}

export function UserProfileView({ isOpen, onClose, profile, onSendMessage }: UserProfileViewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">User Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            View user profile and send a direct message
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              {profile.avatarUrl && (
                <img 
                  src={profile.avatarUrl} 
                  alt={`${profile.username}'s avatar`}
                  className="w-full h-full object-cover rounded-full"
                />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {profile.username?.charAt(0).toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h3 className="text-xl font-semibold text-card-foreground">{profile.username}</h3>
            </div>
          </div>

          {profile.bio && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Bio</h4>
              <p className="text-sm text-card-foreground bg-muted p-3 rounded-lg">
                {profile.bio}
              </p>
            </div>
          )}

          <Button 
            onClick={onSendMessage}
            className="w-full gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}