
-- Add per-class configuration columns
ALTER TABLE public.classes
  ADD COLUMN ai_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN locked_steps JSONB NOT NULL DEFAULT '{}'::jsonb;
