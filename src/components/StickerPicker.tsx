import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface StickerPickerProps {
  onStickerSelect: (sticker: string) => void;
  onClose: () => void;
}

const STICKERS = [
  { name: "thumbs-up", emoji: "👍", label: "Thumbs up" },
  { name: "heart", emoji: "❤️", label: "Heart" },
  { name: "laugh", emoji: "😂", label: "Laugh" },
  { name: "wow", emoji: "😮", label: "Wow" },
  { name: "sad", emoji: "😢", label: "Sad" },
  { name: "angry", emoji: "😠", label: "Angry" },
  { name: "party", emoji: "🎉", label: "Party" },
  { name: "fire", emoji: "🔥", label: "Fire" },
  { name: "clap", emoji: "👏", label: "Clap" },
  { name: "thinking", emoji: "🤔", label: "Thinking" },
  { name: "eyes", emoji: "👀", label: "Eyes" },
  { name: "confused", emoji: "😕", label: "Confused" },
  { name: "cool", emoji: "😎", label: "Cool" },
  { name: "wink", emoji: "😉", label: "Wink" },
  { name: "kiss", emoji: "😘", label: "Kiss" },
  { name: "surprised", emoji: "😯", label: "Surprised" },
  { name: "tired", emoji: "😴", label: "Tired" },
  { name: "sick", emoji: "🤒", label: "Sick" },
  { name: "money", emoji: "💰", label: "Money" },
  { name: "ghost", emoji: "👻", label: "Ghost" },
];

export const StickerPicker = ({ onStickerSelect, onClose }: StickerPickerProps) => {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Choose a Sticker</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
        {STICKERS.map((sticker) => (
          <Button
            key={sticker.name}
            variant="ghost"
            className="p-3 h-auto hover:bg-muted"
            onClick={() => onStickerSelect(sticker.name)}
            title={sticker.label}
          >
            <span className="text-2xl">{sticker.emoji}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};