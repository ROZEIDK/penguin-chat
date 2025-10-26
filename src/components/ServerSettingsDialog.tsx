import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Group } from "@/hooks/useGroups";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ServerSettingsDialogProps {
  group: Group;
  onUpdate: () => void;
}

export function ServerSettingsDialog({ group, onUpdate }: ServerSettingsDialogProps) {
  const [groupName, setGroupName] = useState(group.name);
  const [isPublic, setIsPublic] = useState(group.is_public);
  const [password, setPassword] = useState("");
  const [tags, setTags] = useState<string[]>(group.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentUsername = localStorage.getItem('chat-username');
  const isOwner = currentUsername === group.owner_id;

  if (!isOwner) {
    return null; // Don't show settings if not owner
  }

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const updateData: any = {
        name: groupName,
        is_public: isPublic,
        tags: tags,
      };

      // Only update password if it's provided and group is private
      if (!isPublic && password.trim()) {
        updateData.password_hash = btoa(password.trim());
      } else if (isPublic) {
        updateData.password_hash = null;
      }

      const { error } = await supabase
        .from('groups')
        .update(updateData)
        .eq('id', group.id)
        .eq('owner_id', currentUsername); // Additional security check

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Server settings have been saved successfully.",
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating group settings:', error);
      toast({
        title: "Error",
        description: "Failed to update server settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteServer = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id)
        .eq('owner_id', currentUsername); // Additional security check

      if (error) throw error;

      toast({
        title: "Server deleted",
        description: "The server has been permanently deleted.",
      });

      onUpdate();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Server Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serverName" className="text-card-foreground">Server Name</Label>
            <Input
              id="serverName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter server name"
              className="bg-input border-border text-foreground"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="isPublic" className="text-card-foreground">
              Public Server (anyone can join)
            </Label>
          </div>

          {!isPublic && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground">
                Password {password ? "(Leave empty to keep current)" : "(Required)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-input border-border text-foreground"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-card-foreground">Server Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags like 'friendly', 'NSFW', etc."
                className="bg-input border-border text-foreground"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSaveSettings} 
              disabled={isLoading}
              className="flex-1 gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>

          <div className="border-t pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Server
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the server
                    "{group.name}" and remove all messages.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteServer}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Server
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}