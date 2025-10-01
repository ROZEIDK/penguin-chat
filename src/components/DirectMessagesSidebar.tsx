import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, X } from "lucide-react";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { format } from "date-fns";

interface DirectMessagesSidebarProps {
  conversationId: string | null;
  otherUsername: string;
  otherUserAvatar?: string;
  currentUsername: string;
  onClose: () => void;
}

export function DirectMessagesSidebar({ 
  conversationId, 
  otherUsername, 
  otherUserAvatar,
  currentUsername,
  onClose 
}: DirectMessagesSidebarProps) {
  const [inputMessage, setInputMessage] = useState("");
  const { messages, loading, sendMessage } = useDirectMessages(conversationId);

  const handleSendMessage = async () => {
    if (inputMessage.trim() && conversationId) {
      try {
        await sendMessage(inputMessage, currentUsername);
        setInputMessage("");
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {otherUserAvatar && (
              <img 
                src={otherUserAvatar} 
                alt={`${otherUsername}'s avatar`}
                className="w-full h-full object-cover rounded-full"
              />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground">
              {otherUsername?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-card-foreground text-sm">{otherUsername}</h3>
            <p className="text-xs text-muted-foreground">Direct Message</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="text-center text-muted-foreground text-sm">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.sender_username === currentUsername ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-2 ${
                    msg.sender_username === currentUsername 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {msg.message_type === 'image' && msg.image_url && (
                    <img 
                      src={msg.image_url} 
                      alt="Shared" 
                      className="max-w-full rounded mb-1"
                    />
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {format(new Date(msg.created_at), 'h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message ${otherUsername}...`}
            className="flex-1"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}