import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, X, Heart } from "lucide-react";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useAICrisisBot, type AIChatMessage } from "@/hooks/useAICrisisBot";
import { format } from "date-fns";
import { CHECK_IN_MESSAGE } from "@/hooks/useActivityTracker";

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
  const isAIBot = conversationId === 'ai-crisis-bot';
  
  const { messages: dmMessages, loading: dmLoading, sendMessage: sendDM } = useDirectMessages(isAIBot ? null : conversationId);
  const { messages: aiMessages, loading: aiLoading, sendMessage: sendAI } = useAICrisisBot();
  
  const messages = isAIBot ? aiMessages : dmMessages;
  const loading = isAIBot ? aiLoading : dmLoading;

  // Check for check-in message flag
  useEffect(() => {
    if (isAIBot) {
      const shouldShowCheckIn = localStorage.getItem('showCheckInMessage');
      if (shouldShowCheckIn === 'true') {
        // The check-in message will be displayed as part of the AI bot's initial messages
        // by modifying the useAICrisisBot hook
        localStorage.removeItem('showCheckInMessage');
      }
    }
  }, [isAIBot]);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      try {
        if (isAIBot) {
          await sendAI(inputMessage, currentUsername);
        } else if (conversationId) {
          await sendDM(inputMessage, currentUsername);
        }
        setInputMessage("");
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="w-full md:w-80 bg-card border-l border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {isAIBot ? (
              <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-500 text-white">
                <Heart className="h-4 w-4" />
              </AvatarFallback>
            ) : otherUserAvatar ? (
              <img 
                src={otherUserAvatar} 
                alt={`${otherUsername}'s avatar`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">
                {otherUsername?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-card-foreground text-sm truncate">{otherUsername}</h3>
              {isAIBot && (
                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-rose-500/20 to-pink-500/20 border-rose-500/30">
                  AI Support
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isAIBot ? '24/7 Crisis Support' : 'Direct Message'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 md:p-4">
        {loading ? (
          <div className="text-center text-muted-foreground text-sm">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isUser = isAIBot 
                ? (msg as AIChatMessage).role === 'user'
                : 'sender_username' in msg && msg.sender_username === currentUsername;
              
              return (
                <div 
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] md:max-w-[80%] rounded-lg p-2 ${
                      isUser
                        ? 'bg-primary text-primary-foreground' 
                        : isAIBot
                        ? 'bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20 text-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {'message_type' in msg && msg.message_type === 'image' && msg.image_url && (
                      <img 
                        src={msg.image_url} 
                        alt="Shared" 
                        className="max-w-full rounded mb-1"
                      />
                    )}
                    <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {format(new Date(msg.created_at), 'h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-3 md:p-4 safe-area-bottom">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message ${otherUsername}...`}
            className="flex-1 text-base"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} size="icon" className="flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}