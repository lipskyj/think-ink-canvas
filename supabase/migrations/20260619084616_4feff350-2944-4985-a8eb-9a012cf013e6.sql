CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  tries int := 0;
  i int;
BEGIN
  LOOP
    candidate := '';
    FOR i IN 1..6 LOOP
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.classes WHERE join_code = candidate);
    tries := tries + 1;
    IF tries > 500 THEN
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.classes WHERE join_code = candidate);
    END IF;
  END LOOP;
  RETURN candidate;
END;
$function$;