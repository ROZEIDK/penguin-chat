-- Drop existing direct messaging tables
DROP TABLE IF EXISTS public.direct_messages CASCADE;
DROP TABLE IF EXISTS public.direct_conversations CASCADE;

-- Create new direct_conversations table for anonymous users using usernames
CREATE TABLE public.direct_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_username text NOT NULL,
  user2_username text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user1_username, user2_username),
  CHECK (user1_username < user2_username)
);

-- Create direct_messages table
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.direct_conversations(id) ON DELETE CASCADE,
  sender_username text NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text',
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_read boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.direct_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for direct_conversations - allow anyone to view and create
CREATE POLICY "Anyone can view conversations they're part of"
  ON public.direct_conversations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create conversations"
  ON public.direct_conversations FOR INSERT
  WITH CHECK (true);

-- RLS policies for direct_messages
CREATE POLICY "Anyone can view DMs"
  ON public.direct_messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can send DMs"
  ON public.direct_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update DMs"
  ON public.direct_messages FOR UPDATE
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_direct_messages_conversation ON public.direct_messages(conversation_id);
CREATE INDEX idx_direct_messages_created_at ON public.direct_messages(created_at);
CREATE INDEX idx_direct_conversations_usernames ON public.direct_conversations(user1_username, user2_username);

-- Trigger for updating conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.direct_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Enable realtime for direct messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;