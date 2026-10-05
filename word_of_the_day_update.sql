ALTER TABLE public.word_of_the_day 
ADD COLUMN IF NOT EXISTS dictionary_data JSONB;
