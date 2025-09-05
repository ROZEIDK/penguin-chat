-- Add owner_id to groups table to track who created the group
ALTER TABLE public.groups 
ADD COLUMN owner_id TEXT;

-- Create group_members table to track which users have joined which groups
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(group_id, user_id)
);

-- Enable RLS on group_members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Create policies for group_members
CREATE POLICY "Anyone can view group members" 
ON public.group_members 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can join groups" 
ON public.group_members 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can leave groups they joined" 
ON public.group_members 
FOR DELETE 
USING (true);

CREATE POLICY "Users can update their own membership" 
ON public.group_members 
FOR UPDATE 
USING (true);