import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useGroups } from "@/hooks/useGroups";

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupJoined: (groupId: string, groupName: string) => void;
}

export const GroupModal = ({ isOpen, onClose, onGroupJoined }: GroupModalProps) => {
  const [mode, setMode] = useState<'select' | 'join' | 'create'>('select');
  const [groupName, setGroupName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const { groups, createGroup, joinGroup } = useGroups();
  const { toast } = useToast();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a group name",
      });
      return;
    }

    if (!isPublic && !password.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a password for private groups",
      });
      return;
    }

    setLoading(true);
    try {
      const group = await createGroup(groupName.trim(), isPublic ? null : password, isPublic, tags);
      toast({
        title: "Success",
        description: `${isPublic ? 'Public' : 'Private'} group "${groupName}" created successfully!`,
      });
      onGroupJoined(group.id, group.name);
      handleClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create group. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!selectedGroupId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a group",
      });
      return;
    }

    const selectedGroup = groups.find(g => g.id === selectedGroupId);
    if (!selectedGroup?.is_public && !password.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter the password for this private group",
      });
      return;
    }

    setLoading(true);
    try {
      await joinGroup(selectedGroupId, selectedGroup?.is_public ? undefined : password);
      const group = groups.find(g => g.id === selectedGroupId);
      toast({
        title: "Success",
        description: `Joined group "${group?.name}" successfully!`,
      });
      onGroupJoined(selectedGroupId, group?.name || 'Unknown');
      handleClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid password or failed to join group.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMode('select');
    setGroupName('');
    setPassword('');
    setSelectedGroupId('');
    setIsPublic(false);
    setTags([]);
    setTagInput('');
    onClose();
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

  const renderSelectMode = () => (
    <div className="space-y-4">
      <DialogDescription>
        Choose whether you want to join an existing group or create a new one.
      </DialogDescription>
      <div className="flex flex-col gap-3">
        <Button 
          onClick={() => setMode('join')} 
          variant="outline" 
          className="w-full"
        >
          Join Existing Group
        </Button>
        <Button 
          onClick={() => setMode('create')} 
          variant="outline" 
          className="w-full"
        >
          Create New Group
        </Button>
      </div>
    </div>
  );

  const renderJoinMode = () => (
    <div className="space-y-4">
      <DialogDescription>
        Select a group and enter the password to join.
      </DialogDescription>
      <div className="space-y-3">
        <div>
          <Label htmlFor="group-select">Select Group</Label>
          <select
            id="group-select"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full p-2 border rounded-md bg-background"
          >
            <option value="">Choose a group...</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} {group.is_public ? '(Public)' : '(Private)'} {group.tags && group.tags.length > 0 ? `[${group.tags.join(', ')}]` : ''}
              </option>
            ))}
          </select>
        </div>
        {selectedGroupId && !groups.find(g => g.id === selectedGroupId)?.is_public && (
          <div>
            <Label htmlFor="join-password">Password</Label>
            <Input
              id="join-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter group password"
              onKeyPress={(e) => e.key === "Enter" && handleJoinGroup()}
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={() => setMode('select')} variant="outline" className="flex-1">
            Back
          </Button>
          <Button onClick={handleJoinGroup} disabled={loading} className="flex-1">
            {loading ? "Joining..." : "Join Group"}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCreateMode = () => (
    <div className="space-y-4">
      <DialogDescription>
        Create a new group. Public groups are visible to everyone and don't require a password.
      </DialogDescription>
      <div className="space-y-3">
        <div>
          <Label htmlFor="group-name">Group Name</Label>
          <Input
            id="group-name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            maxLength={50}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is-public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="is-public">Make this a public group (no password required)</Label>
        </div>
        {!isPublic && (
          <div>
            <Label htmlFor="create-password">Password</Label>
            <Input
              id="create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              onKeyPress={(e) => e.key === "Enter" && handleCreateGroup()}
            />
          </div>
        )}
        <div>
          <Label htmlFor="tags">Tags (optional)</Label>
          <div className="flex gap-2 mb-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tags like 'friendly', 'NSFW', etc."
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
        <div className="flex gap-2">
          <Button onClick={() => setMode('select')} variant="outline" className="flex-1">
            Back
          </Button>
          <Button onClick={handleCreateGroup} disabled={loading} className="flex-1">
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'select' && 'Join or Create Group'}
            {mode === 'join' && 'Join Group'}
            {mode === 'create' && 'Create Group'}
          </DialogTitle>
        </DialogHeader>
        {mode === 'select' && renderSelectMode()}
        {mode === 'join' && renderJoinMode()}
        {mode === 'create' && renderCreateMode()}
      </DialogContent>
    </Dialog>
  );
};