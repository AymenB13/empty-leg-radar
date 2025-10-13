-- Grant access to prospect views for authenticated users
GRANT SELECT ON public.prospect_shortlist_by_airport TO authenticated, anon;
GRANT SELECT ON public.prospect_shortlist_by_corridor TO authenticated, anon;

-- Grant access to operator_contacts table
GRANT SELECT, INSERT, UPDATE ON public.operator_contacts TO authenticated, anon;

-- Enable RLS on operator_contacts
ALTER TABLE public.operator_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for operator_contacts
CREATE POLICY "Allow authenticated to read operator_contacts"
  ON public.operator_contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated to insert operator_contacts"
  ON public.operator_contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to update operator_contacts"
  ON public.operator_contacts FOR UPDATE
  TO authenticated
  USING (true);