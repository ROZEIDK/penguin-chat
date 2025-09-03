import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Message } from "@/hooks/useMessages";
import { GroupMessage } from "@/hooks/useGroups";

interface MessageBubbleProps {
  message: Message | GroupMessage;
}

const STICKER_EMOJIS: Record<string, string> = {
  "thumbs-up": "👍",
  "heart": "❤️",
  "laugh": "😂",
  "wow": "😮",
  "sad": "😢",
  "angry": "😠",
  "party": "🎉",
  "fire": "🔥",
  "clap": "👏",
  "thinking": "🤔",
  "eyes": "👀",
  "confused": "😕",
  "cool": "😎",
  "wink": "😉",
  "kiss": "😘",
  "surprised": "😯",
  "tired": "😴",
  "sick": "🤒",
  "money": "💰",
  "ghost": "👻",
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const renderMessageContent = () => {
    switch (message.message_type || 'text') {
      case 'image':
        return (
          <div className="space-y-2">
            {message.content && (
              <p className="text-foreground">{message.content}</p>
            )}
            {message.image_url && (
              <img 
                src={message.image_url} 
                alt="Shared image" 
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.image_url, '_blank')}
              />
            )}
          </div>
        );
      
      case 'sticker':
        return (
          <div className="space-y-2">
            {message.content && (
              <p className="text-foreground text-sm">{message.content}</p>
            )}
            {message.sticker_name && (
              <div className="text-4xl">
                {STICKER_EMOJIS[message.sticker_name] || '😀'}
              </div>
            )}
          </div>
        );
      
      default:
        return <p className="text-foreground">{message.content}</p>;
    }
  };

  return (
    <div className="flex gap-3 hover:bg-chat-message-hover p-2 rounded">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="bg-primary text-primary-foreground">
          {message.username?.charAt(0).toUpperCase() || 'A'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-foreground">
            {message.username || 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.created_at), 'h:mm a')}
          </span>
        </div>
        {renderMessageContent()}
      </div>
    </div>
  );
};