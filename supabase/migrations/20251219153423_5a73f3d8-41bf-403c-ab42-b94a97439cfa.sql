-- Allow users to view their own papers regardless of status
CREATE POLICY "Users can view their own papers"
ON public.papers
FOR SELECT
USING (
  uploaded_by IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);