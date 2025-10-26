-- Add tags column to groups table
ALTER TABLE public.groups
ADD COLUMN tags text[] DEFAULT '{}';

-- Add a comment to describe the column
COMMENT ON COLUMN public.groups.tags IS 'Tags for categorizing groups (e.g., friendly, NSFW, judgement free)';