
-- Classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  student_names TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Public read so students can see class info via join link
CREATE POLICY "Anyone can view classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert classes" ON public.classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update classes" ON public.classes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete classes" ON public.classes FOR DELETE USING (true);

-- Class step data - shared project data per class + student name
CREATE TABLE public.class_step_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  step_key TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_name, step_key)
);

ALTER TABLE public.class_step_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view class step data" ON public.class_step_data FOR SELECT USING (true);
CREATE POLICY "Anyone can insert class step data" ON public.class_step_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update class step data" ON public.class_step_data FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete class step data" ON public.class_step_data FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_class_step_data_updated_at
  BEFORE UPDATE ON public.class_step_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
