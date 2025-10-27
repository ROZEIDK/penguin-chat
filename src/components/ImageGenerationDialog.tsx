import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

interface ImageGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageGenerated: (imageUrl: string) => void;
}

export function ImageGenerationDialog({ open, onOpenChange, onImageGenerated }: ImageGenerationDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: prompt.trim() },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        onImageGenerated(data.imageUrl);
        setPrompt("");
        onOpenChange(false);
        toast({
          title: "Image generated!",
          description: "Your AI-generated image is ready",
        });
      } else {
        throw new Error("No image URL in response");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error.message || "Failed to generate image. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generate AI Image
          </DialogTitle>
          <DialogDescription>
            Describe the image you want to create and AI will generate it for you
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., A futuristic city at sunset..."
            disabled={isGenerating}
            onKeyPress={(e) => e.key === "Enter" && !isGenerating && handleGenerate()}
            className="text-base"
          />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
