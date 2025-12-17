-- Allow uploaders to delete their own papers
CREATE POLICY "Uploaders can delete their own papers" 
ON public.papers 
FOR DELETE 
USING (uploaded_by IN ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid() ));