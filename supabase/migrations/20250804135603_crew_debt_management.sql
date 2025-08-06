-- Location: supabase/migrations/20250804135603_crew_debt_management.sql
-- Schema Analysis: Extending existing financial boxes system with crew and debt management
-- Integration Type: addition
-- Dependencies: captains, financial_boxes

-- Create custom types for crew management
CREATE TYPE public.crew_role AS ENUM ('captain', 'crew');
CREATE TYPE public.debt_type AS ENUM ('add', 'subtract');

-- Create crew_members table to track all crew members
CREATE TABLE public.crew_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role public.crew_role DEFAULT 'crew'::public.crew_role,
    phone TEXT,
    email TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    profit_share DECIMAL(12,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create crew_debts table to track individual debt transactions
CREATE TABLE public.crew_debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_member_id UUID REFERENCES public.crew_members(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    debt_type public.debt_type DEFAULT 'add'::public.debt_type,
    debt_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create essential indexes for performance
CREATE INDEX idx_crew_members_role ON public.crew_members(role);
CREATE INDEX idx_crew_members_is_active ON public.crew_members(is_active);
CREATE INDEX idx_crew_members_join_date ON public.crew_members(join_date);
CREATE INDEX idx_crew_debts_crew_member_id ON public.crew_debts(crew_member_id);
CREATE INDEX idx_crew_debts_debt_date ON public.crew_debts(debt_date);
CREATE INDEX idx_crew_debts_debt_type ON public.crew_debts(debt_type);

-- Enable Row Level Security
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_debts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access (consistent with existing schema)
CREATE POLICY "public_access_crew_members"
ON public.crew_members
FOR ALL
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "public_access_crew_debts"
ON public.crew_debts
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Add triggers to automatically update timestamps
CREATE TRIGGER update_crew_members_updated_at
    BEFORE UPDATE ON public.crew_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crew_debts_updated_at
    BEFORE UPDATE ON public.crew_debts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate total debt for a crew member
CREATE OR REPLACE FUNCTION public.calculate_crew_member_total_debt(member_id UUID)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    total_debt DECIMAL(12,2) := 0.00;
BEGIN
    SELECT COALESCE(
        SUM(
            CASE 
                WHEN debt_type = 'add' THEN amount
                WHEN debt_type = 'subtract' THEN -amount
                ELSE 0
            END
        ), 
        0.00
    )
    INTO total_debt
    FROM public.crew_debts cd
    WHERE cd.crew_member_id = member_id;
    
    -- Ensure debt cannot be negative
    RETURN GREATEST(total_debt, 0.00);
END;
$$;

-- Function to get crew member with calculated debt and final share
CREATE OR REPLACE FUNCTION public.get_crew_member_with_debt(member_id UUID)
RETURNS TABLE(
    id UUID,
    name TEXT,
    role TEXT,
    phone TEXT,
    email TEXT,
    join_date DATE,
    profit_share DECIMAL(12,2),
    total_debt DECIMAL(12,2),
    final_share DECIMAL(12,2),
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cm.id,
        cm.name,
        cm.role::TEXT,
        cm.phone,
        cm.email,
        cm.join_date,
        cm.profit_share,
        public.calculate_crew_member_total_debt(cm.id) as total_debt,
        (cm.profit_share - public.calculate_crew_member_total_debt(cm.id)) as final_share,
        cm.is_active,
        cm.created_at,
        cm.updated_at
    FROM public.crew_members cm
    WHERE cm.id = member_id;
END;
$$;

-- Function to get all crew members with debt calculations
CREATE OR REPLACE FUNCTION public.get_all_crew_members_with_debt()
RETURNS TABLE(
    id UUID,
    name TEXT,
    role TEXT,
    phone TEXT,
    email TEXT,
    join_date DATE,
    profit_share DECIMAL(12,2),
    total_debt DECIMAL(12,2),
    final_share DECIMAL(12,2),
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cm.id,
        cm.name,
        cm.role::TEXT,
        cm.phone,
        cm.email,
        cm.join_date,
        cm.profit_share,
        public.calculate_crew_member_total_debt(cm.id) as total_debt,
        (cm.profit_share - public.calculate_crew_member_total_debt(cm.id)) as final_share,
        cm.is_active,
        cm.created_at,
        cm.updated_at
    FROM public.crew_members cm
    WHERE cm.is_active = true
    ORDER BY cm.created_at DESC;
END;
$$;

-- Function to permanently delete crew member with all debts (cascading delete)
CREATE OR REPLACE FUNCTION public.delete_crew_member_permanently(member_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    debt_count INTEGER;
    member_exists BOOLEAN;
BEGIN
    -- Check if crew member exists
    SELECT EXISTS(
        SELECT 1 FROM public.crew_members WHERE id = member_id
    ) INTO member_exists;
    
    IF NOT member_exists THEN
        RAISE EXCEPTION 'Crew member with ID % does not exist', member_id;
    END IF;
    
    -- Get count of debts for logging
    SELECT COUNT(*) INTO debt_count
    FROM public.crew_debts
    WHERE crew_member_id = member_id;
    
    -- Delete all debts first (cascading delete will handle this automatically, but explicit for clarity)
    DELETE FROM public.crew_debts WHERE crew_member_id = member_id;
    
    -- Delete the crew member
    DELETE FROM public.crew_members WHERE id = member_id;
    
    -- Log the deletion
    RAISE NOTICE 'Successfully deleted crew member % with % debt records', member_id, debt_count;
    
    RETURN true;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to delete crew member: %', SQLERRM;
        RETURN false;
END;
$$;

-- Insert sample data with crew members and debts
DO $$
DECLARE
    member1_id UUID := gen_random_uuid();
    member2_id UUID := gen_random_uuid();
    member3_id UUID := gen_random_uuid();
    member4_id UUID := gen_random_uuid();
    member5_id UUID := gen_random_uuid();
BEGIN
    -- Insert sample crew members
    INSERT INTO public.crew_members (id, name, role, phone, email, join_date, profit_share, is_active) VALUES
        (member1_id, 'أحمد محمد الصالح', 'captain'::public.crew_role, '+966501234567', 'ahmed.alsaleh@example.com', '2024-01-15', 8750.00, true),
        (member2_id, 'محمد عبدالله النجار', 'crew'::public.crew_role, '+966502345678', 'mohammed.alnajjar@example.com', '2024-02-01', 3500.00, true),
        (member3_id, 'سالم أحمد الغامدي', 'crew'::public.crew_role, '+966503456789', 'salem.alghamdi@example.com', '2024-03-10', 3500.00, true),
        (member4_id, 'عبدالرحمن سعد القحطاني', 'captain'::public.crew_role, '+966504567890', 'abdulrahman.alqahtani@example.com', '2024-01-20', 8750.00, true),
        (member5_id, 'خالد محمد العتيبي', 'crew'::public.crew_role, '+966505678901', 'khalid.alotaibi@example.com', '2024-04-05', 3500.00, true);

    -- Insert sample debt records
    INSERT INTO public.crew_debts (crew_member_id, amount, description, debt_type, debt_date) VALUES
        -- Ahmed's debts
        (member1_id, 1500.00, 'سلفة شخصية', 'add'::public.debt_type, '2024-07-15'),
        (member1_id, 1000.00, 'مصاريف طبية', 'add'::public.debt_type, '2024-07-28'),
        
        -- Mohammed's debts
        (member2_id, 800.00, 'سلفة على الراتب', 'add'::public.debt_type, '2024-07-20'),
        
        -- Abdulrahman's debts
        (member4_id, 1200.00, 'إصلاح سيارة شخصية', 'add'::public.debt_type, '2024-07-25'),
        
        -- Khalid's debts
        (member5_id, 450.00, 'مصاريف عائلية طارئة', 'add'::public.debt_type, '2024-07-30');

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting sample crew data: %', SQLERRM;
END $$;

-- Function to get debt history for a crew member
CREATE OR REPLACE FUNCTION public.get_crew_member_debt_history(member_id UUID)
RETURNS TABLE(
    id UUID,
    amount DECIMAL(12,2),
    description TEXT,
    debt_type TEXT,
    debt_date DATE,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cd.id,
        cd.amount,
        cd.description,
        cd.debt_type::TEXT,
        cd.debt_date,
        cd.created_at
    FROM public.crew_debts cd
    WHERE cd.crew_member_id = member_id
    ORDER BY cd.debt_date DESC, cd.created_at DESC;
END;
$$;