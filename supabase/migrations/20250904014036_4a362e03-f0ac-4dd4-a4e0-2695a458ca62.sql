-- Make password_hash nullable for public groups
ALTER TABLE public.groups 
ALTER COLUMN password_hash DROP NOT NULL;

-- Add a column to distinguish public vs private groups
ALTER TABLE public.groups 
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;