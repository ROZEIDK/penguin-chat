-- Add avatar_url column to messages table
ALTER TABLE public.messages 
ADD COLUMN avatar_url TEXT;

-- Add avatar_url column to group_messages table  
ALTER TABLE public.group_messages 
ADD COLUMN avatar_url TEXT;