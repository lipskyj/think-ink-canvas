
-- Add event/team fields to classes
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS join_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS organizer_logo_url text,
  ADD COLUMN IF NOT EXISTS event_description text,
  ADD COLUMN IF NOT EXISTS team_avatar_url text,
  ADD COLUMN IF NOT EXISTS team_avatar_prompt text;

-- Function to generate a unique join code (1 letter + 1 digit, e.g. A6, Z2)
CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  letters text := 'ABCDEFGHJKLMNPQRSTUVWXYZ'; -- omit I, O for clarity
  digits text  := '123456789'; -- omit 0 for clarity
  candidate text;
  tries int := 0;
BEGIN
  LOOP
    candidate := substr(letters, 1 + floor(random() * length(letters))::int, 1)
              || substr(digits,  1 + floor(random() * length(digits))::int, 1);
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.classes WHERE join_code = candidate);
    tries := tries + 1;
    IF tries > 500 THEN
      -- fallback to 3-char code if pool is exhausted
      candidate := candidate || substr(digits, 1 + floor(random() * length(digits))::int, 1);
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.classes WHERE join_code = candidate);
    END IF;
  END LOOP;
  RETURN candidate;
END;
$$;

-- Trigger to auto-fill join_code on insert
CREATE OR REPLACE FUNCTION public.set_join_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.join_code IS NULL OR NEW.join_code = '' THEN
    NEW.join_code := public.generate_join_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS classes_set_join_code ON public.classes;
CREATE TRIGGER classes_set_join_code
  BEFORE INSERT ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.set_join_code();

-- Backfill existing rows
UPDATE public.classes SET join_code = public.generate_join_code() WHERE join_code IS NULL;
