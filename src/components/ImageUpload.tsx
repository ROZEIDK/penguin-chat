import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  onClose: () => void;
}

export const ImageUpload = ({ onImageSelect, onClose }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 5MB",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !preview) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(data.path);

      onImageSelect(publicUrl);
      toast({
        title: "Image uploaded",
        description: "Your image is ready to send!",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Upload Image</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
        >
          <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Click to select an image</p>
          <p className="text-sm text-muted-foreground mt-1">Max size: 5MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full max-w-sm mx-auto rounded-lg"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClear}
              className="absolute top-2 right-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleUpload} 
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? "Uploading..." : "Upload & Send"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};