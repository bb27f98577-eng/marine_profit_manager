-- Location: supabase/migrations/20250804151800_financial_box_crew_relationship.sql
-- Schema Analysis: crew_members and financial_boxes tables exist separately, no relationship
-- Integration Type: addition - create many-to-many relationship
-- Dependencies: crew_members, financial_boxes

-- Create junction table for many-to-many relationship between financial boxes and crew members
CREATE TABLE public.financial_box_crew_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    financial_box_id UUID REFERENCES public.financial_boxes(id) ON DELETE CASCADE,
    crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint to prevent duplicate assignments
CREATE UNIQUE INDEX idx_financial_box_crew_unique 
ON public.financial_box_crew_members(financial_box_id, crew_member_id);

-- Create indexes for performance
CREATE INDEX idx_financial_box_crew_box_id ON public.financial_box_crew_members(financial_box_id);
CREATE INDEX idx_financial_box_crew_member_id ON public.financial_box_crew_members(crew_member_id);
CREATE INDEX idx_financial_box_crew_active ON public.financial_box_crew_members(is_active);

-- Enable RLS
ALTER TABLE public.financial_box_crew_members ENABLE ROW LEVEL SECURITY;

-- RLS Policy for junction table
CREATE POLICY "public_access_financial_box_crew_members"
ON public.financial_box_crew_members
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_financial_box_crew_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_financial_box_crew_updated_at
    BEFORE UPDATE ON public.financial_box_crew_members
    FOR EACH ROW EXECUTE FUNCTION public.update_financial_box_crew_updated_at();

-- Mock data: Assign existing crew members to existing financial boxes
DO $$
DECLARE
    existing_box_id UUID;
    existing_crew_ids UUID[];
BEGIN
    -- Get existing financial box
    SELECT id INTO existing_box_id FROM public.financial_boxes LIMIT 1;
    
    -- Get existing crew member IDs
    SELECT ARRAY_AGG(id) INTO existing_crew_ids 
    FROM public.crew_members 
    WHERE is_active = true 
    LIMIT 3;
    
    -- Only insert if we have both box and crew members
    IF existing_box_id IS NOT NULL AND existing_crew_ids IS NOT NULL THEN
        -- Assign crew members to the financial box
        INSERT INTO public.financial_box_crew_members (financial_box_id, crew_member_id)
        SELECT existing_box_id, UNNEST(existing_crew_ids);
        
        RAISE NOTICE 'Assigned % crew members to financial box', array_length(existing_crew_ids, 1);
    ELSE
        RAISE NOTICE 'No existing financial boxes or crew members found for mock data';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating mock data: %', SQLERRM;
END $$;