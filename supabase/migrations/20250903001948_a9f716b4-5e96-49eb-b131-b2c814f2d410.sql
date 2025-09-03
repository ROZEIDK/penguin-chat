-- Create groups table for private groups
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_messages table for private group messages
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  username TEXT NOT NULL DEFAULT 'Anonymous'::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for groups - anyone can view groups (to join them)
CREATE POLICY "Anyone can view groups" 
ON public.groups 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create groups" 
ON public.groups 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for group_messages
CREATE POLICY "Anyone can view group messages" 
ON public.group_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert group messages" 
ON public.group_messages 
FOR INSERT 
WITH CHECK (true);

-- Add realtime for group_messages
ALTER TABLE public.group_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;