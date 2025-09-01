import { useState } from "react";
import { Send, Users, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Mock data for demonstration
const mockMessages = [
  {
    id: 1,
    username: "Alex",
    avatar: "/placeholder.svg",
    message: "Hey everyone! Welcome to Global Chat 👋",
    timestamp: "2:30 PM",
    reactions: { "👋": 3, "😊": 1 }
  },
  {
    id: 2,
    username: "Sarah",
    avatar: "/placeholder.svg",
    message: "This looks amazing! Love the Discord-style interface",
    timestamp: "2:32 PM",
    reactions: { "❤️": 2 }
  },
  {
    id: 3,
    username: "Mike",
    avatar: "/placeholder.svg",
    message: "Anyone up for some gaming later? 🎮",
    timestamp: "2:35 PM",
    reactions: { "🎮": 4, "👍": 2 }
  }
];

const mockUsers = [
  { id: 1, username: "Alex", status: "online", avatar: "/placeholder.svg" },
  { id: 2, username: "Sarah", status: "online", avatar: "/placeholder.svg" },
  { id: 3, username: "Mike", status: "idle", avatar: "/placeholder.svg" },
  { id: 4, username: "Emma", status: "dnd", avatar: "/placeholder.svg" },
  { id: 5, username: "James", status: "online", avatar: "/placeholder.svg" }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "online": return "bg-chat-online";
    case "idle": return "bg-chat-idle";
    case "dnd": return "bg-chat-dnd";
    default: return "bg-muted";
  }
};

export function ChatLayout() {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you would send the message to your backend
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar */}
      <div className="w-60 bg-chat-sidebar border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h1 className="font-bold text-foreground">Global Chat</h1>
          </div>
        </div>
        
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50 text-accent-foreground">
              <Hash className="h-4 w-4" />
              <span className="text-sm font-medium">general</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary/50 cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>YU</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">Your Username</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-chat-online"></div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-12 border-b border-border flex items-center px-4">
          <Hash className="h-5 w-5 text-muted-foreground mr-2" />
          <h2 className="font-semibold text-foreground">general</h2>
          <Separator orientation="vertical" className="mx-4 h-6" />
          <p className="text-sm text-muted-foreground">Welcome to the global chat room!</p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {mockMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3 hover:bg-chat-message-hover p-2 rounded-md transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={msg.avatar} />
                  <AvatarFallback>{msg.username[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">{msg.username}</span>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  
                  <p className="text-foreground mb-2">{msg.message}</p>
                  
                  {msg.reactions && (
                    <div className="flex gap-1">
                      {Object.entries(msg.reactions).map(([emoji, count]) => (
                        <Badge key={emoji} variant="secondary" className="text-xs cursor-pointer hover:bg-accent/80">
                          {emoji} {count}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message #general"
              className="flex-1 bg-input border-border focus:ring-primary"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Online Users */}
      <div className="w-60 bg-card border-l border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium text-foreground">Online — {mockUsers.filter(u => u.status === "online").length}</h3>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {mockUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(user.status)}`}></div>
                </div>
                <span className="text-sm font-medium text-foreground">{user.username}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}