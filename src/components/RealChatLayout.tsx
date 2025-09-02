import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Hash, Users, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { useProfiles } from "@/hooks/useProfiles";
import { AuthForm } from "@/components/AuthForm";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const RealChatLayout = () => {
  const [inputMessage, setInputMessage] = useState("");
  const { user, loading: authLoading, signOut } = useAuth();
  const { messages, loading: messagesLoading, sendMessage } = useMessages();
  const { profiles, getStatusColor } = useProfiles();
  const { toast } = useToast();

  // Show auth form if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim() && user) {
      try {
        await sendMessage(inputMessage, user.id);
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

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - Channels */}
      <div className="w-64 bg-chat-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="text-xl font-bold">Chat App</h2>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded hover:bg-sidebar-accent cursor-pointer">
              <Hash className="w-4 h-4" />
              <span>general</span>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">
                  {user.email?.split('@')[0]}
                </div>
                <div className="text-xs text-muted-foreground">online</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-card-foreground">general</h3>
            <div className="text-sm text-muted-foreground ml-2">
              Chat with everyone around the world
            </div>
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
                <div key={msg.id} className="flex gap-3 hover:bg-chat-message-hover p-2 rounded">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {msg.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">
                        {msg.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.created_at), 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-foreground">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-card">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Online Users */}
      <div className="w-64 bg-card border-l border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-card-foreground">
              Users ({profiles.length})
            </h3>
          </div>
        </div>
        
        <ScrollArea className="h-full p-4">
          <div className="space-y-2">
            {profiles.map((profile) => (
              <div key={profile.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(profile.status)}`} />
                </div>
                <div>
                  <div className="text-sm font-medium text-card-foreground">{profile.username}</div>
                  <div className="text-xs text-muted-foreground capitalize">{profile.status}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};