import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Hash, Users } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const AnonymousChatLayout = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [username, setUsername] = useState("");
  const [hasSetUsername, setHasSetUsername] = useState(false);
  const { messages, loading: messagesLoading, sendMessage } = useMessages();
  const { toast } = useToast();

  useEffect(() => {
    // Check if username was already set in localStorage
    const savedUsername = localStorage.getItem('chatroom-username');
    if (savedUsername) {
      setUsername(savedUsername);
      setHasSetUsername(true);
    }
  }, []);

  const handleSetUsername = () => {
    if (username.trim()) {
      localStorage.setItem('chatroom-username', username.trim());
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
        await sendMessage(inputMessage, username.trim());
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
            <div className="flex items-center gap-2 p-2 rounded bg-sidebar-accent">
              <Hash className="w-4 h-4" />
              <span>general</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{username}</div>
              <div className="text-xs text-muted-foreground">online</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem('chatroom-username');
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
            <Hash className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-card-foreground">general</h3>
            <div className="text-sm text-muted-foreground ml-2">
              Anonymous chatroom - no registration required
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
                      {msg.username?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">
                        {msg.username || 'Anonymous'}
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
              placeholder={`Message as ${username}...`}
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Stats */}
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
              <p>🌍 Anyone can join</p>
              <p>💬 No registration needed</p>
              <p>🔗 Just share the link!</p>
            </div>
            <div className="text-xs text-muted-foreground">
              Messages: {messages.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};