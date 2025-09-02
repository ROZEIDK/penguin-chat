-- Remove user_id requirement and add username field to messages
ALTER TABLE public.messages DROP COLUMN user_id;
ALTER TABLE public.messages ADD COLUMN username TEXT NOT NULL DEFAULT 'Anonymous';

-- Update RLS policies to allow anonymous access
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON public.messages;

-- Create new policies for anonymous access
CREATE POLICY "Anyone can view messages" 
ON public.messages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (true);

-- Drop the profiles table and related function since we don't need user management
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;