-- Create function to increment download count (bypasses RLS for public access)
CREATE OR REPLACE FUNCTION public.increment_download(paper_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE papers 
  SET downloads = downloads + 1 
  WHERE id = paper_id;
END;
$$;