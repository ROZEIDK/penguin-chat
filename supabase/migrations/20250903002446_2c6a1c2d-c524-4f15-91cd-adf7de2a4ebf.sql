-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true);

-- Create storage policies for chat images
CREATE POLICY "Anyone can view chat images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-images');

CREATE POLICY "Anyone can upload chat images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-images');

CREATE POLICY "Anyone can delete their own chat images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'chat-images');

-- Update messages table to support different message types
ALTER TABLE public.messages 
ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'sticker'));

ALTER TABLE public.messages 
ADD COLUMN image_url TEXT;

ALTER TABLE public.messages 
ADD COLUMN sticker_name TEXT;

-- Update group_messages table to support different message types
ALTER TABLE public.group_messages 
ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'sticker'));

ALTER TABLE public.group_messages 
ADD COLUMN image_url TEXT;

ALTER TABLE public.group_messages 
ADD COLUMN sticker_name TEXT;