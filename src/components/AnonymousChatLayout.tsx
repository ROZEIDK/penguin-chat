import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Hash, Users, Plus, Globe, Image, Smile, X, Crown } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useGroups, useGroupMessages } from "@/hooks/useGroups";
import { useConversations } from "@/hooks/useDirectMessages";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { GroupModal } from "./GroupModal";
import { ImageUpload } from "./ImageUpload";
import { StickerPicker } from "./StickerPicker";
import { MessageBubble } from "./MessageBubble";
import { UserProfileDialog } from "./UserProfileDialog";
import { UserSettingsDialog } from "./UserSettingsDialog";
import { ServerSettingsDialog } from "./ServerSettingsDialog";
import { UserProfileView } from "./UserProfileView";
import { DirectMessagesSidebar } from "./DirectMessagesSidebar";

export const AnonymousChatLayout = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [username, setUsername] = useState("");
  const [hasSetUsername, setHasSetUsername] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<{ id: string; name: string } | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<{ username: string; avatarUrl?: string } | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [activeDMConversation, setActiveDMConversation] = useState<{ id: string; username: string; avatarUrl?: string } | null>(null);
  
  const { messages: globalMessages, loading: globalLoading, sendMessage: sendGlobalMessage } = useMessages();
  const { messages: groupMessages, loading: groupLoading, sendMessage: sendGroupMessage } = useGroupMessages(currentGroup?.id || null);
  const { joinedGroups, leaveGroup, refetch: refetchGroups } = useGroups();
  const { createConversation } = useConversations(username);
  const { toast } = useToast();
  
  const messages = currentGroup ? groupMessages : globalMessages;
  const messagesLoading = currentGroup ? groupLoading : globalLoading;
  const sendMessage = currentGroup ? sendGroupMessage : sendGlobalMessage;

  useEffect(() => {
    // Check if username was already set in localStorage
    const savedUsername = localStorage.getItem('chat-username');
    if (savedUsername) {
      setUsername(savedUsername);
      setHasSetUsername(true);
    }
  }, []);

  const handleSetUsername = () => {
    if (username.trim()) {
      localStorage.setItem('chat-username', username.trim());
      setHasSetUsername(true);
      toast({
        title: "Welcome to the chatroom!",
        description: `You're now chatting as ${username.trim()}`,
      });
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() && username.trim()) {
      try {
        if (pendingImageUrl) {
          await sendMessage(inputMessage || "Image", username.trim(), 'image', pendingImageUrl);
          setPendingImageUrl(null);
        } else {
          await sendMessage(inputMessage, username.trim());
        }
        setInputMessage("");
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send message. Please try again.",
        });
      }
    }
  };

  const handleGroupJoined = (groupId: string, groupName: string) => {
    setCurrentGroup({ id: groupId, name: groupName });
    refetchGroups(); // Refresh joined groups list
  };

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    try {
      await leaveGroup(groupId);
      toast({
        title: "Left group",
        description: `You've left "${groupName}"`,
      });
      
      // If we're currently in this group, switch to global chat
      if (currentGroup?.id === groupId) {
        setCurrentGroup(null);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: "Failed to leave group. Please try again.",
      });
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setPendingImageUrl(imageUrl);
    setShowImageUpload(false);
  };

  const handleStickerSelect = async (stickerName: string) => {
    try {
      await sendMessage("", username.trim(), 'sticker', undefined, stickerName);
      setShowStickerPicker(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send sticker. Please try again.",
      });
    }
  };

  const handleUsernameClick = (clickedUsername: string, avatarUrl?: string) => {
    if (clickedUsername === username) return; // Don't open profile for self
    
    setSelectedUserProfile({ username: clickedUsername, avatarUrl });
    setShowUserProfile(true);
  };

  const handleSendDirectMessage = async () => {
    if (!selectedUserProfile) return;
    
    const conversation = await createConversation(selectedUserProfile.username);
    if (conversation) {
      setActiveDMConversation({
        id: conversation.id,
        username: selectedUserProfile.username,
        avatarUrl: selectedUserProfile.avatarUrl,
      });
    }
  };

  if (!hasSetUsername) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Welcome to the Chatroom!</h1>
            <p className="text-muted-foreground">Choose a username to start chatting</p>
          </div>
          <div className="space-y-4">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username..."
              maxLength={20}
              onKeyPress={(e) => e.key === "Enter" && handleSetUsername()}
            />
            <Button onClick={handleSetUsername} className="w-full" disabled={!username.trim()}>
              Join Chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - Info */}
      <div className="w-64 bg-chat-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="text-xl font-bold">Anonymous Chat</h2>
          <p className="text-sm text-muted-foreground">Open chatroom for everyone</p>
        </div>
        
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Servers
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGroupModal(true)}
                className="w-6 h-6 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div 
              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                !currentGroup ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent/50'
              }`}
              onClick={() => setCurrentGroup(null)}
            >
              <Globe className="w-4 h-4" />
              <span>Global Chat</span>
            </div>
            
            {joinedGroups.map((group) => (
              <div 
                key={group.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors group ${
                  currentGroup?.id === group.id ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent/50'
                }`}
                onClick={() => setCurrentGroup({ id: group.id, name: group.name })}
              >
                <Hash className="w-4 h-4" />
                <span className="flex-1 truncate">{group.name}</span>
                {group.owner_id === username && (
                  <div title="You own this server">
                    <Crown className="w-3 h-3 text-yellow-500" />
                  </div>
                )}
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  {group.owner_id === username && (
                    <ServerSettingsDialog 
                      group={group}
                      onUpdate={refetchGroups}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLeaveGroup(group.id, group.name);
                    }}
                    title="Leave server"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {currentGroup && !joinedGroups.find(g => g.id === currentGroup.id) && (
              <div className="flex items-center gap-2 p-2 rounded bg-sidebar-accent">
                <Hash className="w-4 h-4" />
                <span>{currentGroup.name}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <UserProfileDialog />
            <div className="flex-1">
              <div className="text-sm font-medium">{username}</div>
              <div className="text-xs text-muted-foreground">online</div>
            </div>
            <UserSettingsDialog />
          </div>
            <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem('chat-username');
              setHasSetUsername(false);
              setUsername('');
            }}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Change Username
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-2">
            {currentGroup ? (
              <>
                <Hash className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-card-foreground">{currentGroup.name}</h3>
                <div className="text-sm text-muted-foreground ml-2">
                  Private group chat
                </div>
              </>
            ) : (
              <>
                <Globe className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-card-foreground">Global Chat</h3>
                <div className="text-sm text-muted-foreground ml-2">
                  Anonymous chatroom - no registration required
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messagesLoading ? (
            <div className="text-center text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No messages yet. Be the first to start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  onUsernameClick={handleUsernameClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-card space-y-4">
          {showImageUpload && (
            <ImageUpload 
              onImageSelect={handleImageSelect}
              onClose={() => setShowImageUpload(false)}
            />
          )}
          
          {showStickerPicker && (
            <StickerPicker 
              onStickerSelect={handleStickerSelect}
              onClose={() => setShowStickerPicker(false)}
            />
          )}
          
          {pendingImageUrl && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <img src={pendingImageUrl} alt="Pending" className="w-8 h-8 rounded" />
              <span className="text-sm text-muted-foreground">Image ready to send</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPendingImageUrl(null)}
                className="ml-auto"
              >
                Remove
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowImageUpload(!showImageUpload);
                  setShowStickerPicker(false);
                }}
                className={showImageUpload ? "bg-muted" : ""}
              >
                <Image className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowStickerPicker(!showStickerPicker);
                  setShowImageUpload(false);
                }}
                className={showStickerPicker ? "bg-muted" : ""}
              >
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={pendingImageUrl ? "Add a caption..." : `Message as ${username}...`}
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - DMs or Stats */}
      {activeDMConversation ? (
        <DirectMessagesSidebar
          conversationId={activeDMConversation.id}
          otherUsername={activeDMConversation.username}
          otherUserAvatar={activeDMConversation.avatarUrl}
          currentUserId={username}
          onClose={() => setActiveDMConversation(null)}
        />
      ) : (
        <div className="w-64 bg-card border-l border-border">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-card-foreground">
                Anonymous Chat
              </h3>
            </div>
          </div>
          
          <div className="p-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {currentGroup ? (
                  <>
                    <p>🔒 Private group</p>
                    <p>💬 Invitation only</p>
                    <p>🛡️ Password protected</p>
                  </>
                ) : (
                  <>
                    <p>🌍 Anyone can join</p>
                    <p>💬 No registration needed</p>
                    <p>🔗 Just share the link!</p>
                  </>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Messages: {messages.length}
              </div>
            </div>
          </div>
        </div>
      )}

      <GroupModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onGroupJoined={handleGroupJoined}
      />

      {selectedUserProfile && (
        <UserProfileView
          isOpen={showUserProfile}
          onClose={() => {
            setShowUserProfile(false);
            setSelectedUserProfile(null);
          }}
          profile={{
            username: selectedUserProfile.username,
            avatarUrl: selectedUserProfile.avatarUrl,
            bio: undefined, // Bio would need to be fetched from localStorage or database
          }}
          onSendMessage={handleSendDirectMessage}
        />
      )}
    </div>
  );
};