import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function UserProfileDialog() {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load stored profile data
    const stored = localStorage.getItem('user-profile');
    if (stored) {
      const profile = JSON.parse(stored);
      setDisplayName(profile.displayName || "");
      setAvatarUrl(profile.avatarUrl || "");
    }
  }, []);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const profileData = {
        displayName,
        avatarUrl,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('user-profile', JSON.stringify(profileData));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a simple data URL for the avatar
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {displayName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Profile Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Change Avatar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-card-foreground">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="bg-input border-border text-foreground"
            />
          </div>

          <Button 
            onClick={handleSaveProfile} 
            disabled={isLoading}
            className="w-full gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}