-- Location: supabase/migrations/20250204131752_financial_boxes_management.sql
-- Schema Analysis: Creating financial boxes management system with captains and invoices
-- Integration Type: addition
-- Dependencies: auth.users

-- Create custom types for the financial boxes system
CREATE TYPE public.box_status AS ENUM ('draft', 'completed', 'cancelled');

-- Create captains table for managing boat captains
CREATE TABLE public.captains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE,
    experience_years INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create financial_boxes table
CREATE TABLE public.financial_boxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    captain_id UUID REFERENCES public.captains(id) ON DELETE SET NULL,
    crew_count INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    status public.box_status DEFAULT 'draft'::public.box_status,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    last_bill_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table to track financial box invoices
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    financial_box_id UUID REFERENCES public.financial_boxes(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    is_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create essential indexes for performance
CREATE INDEX idx_financial_boxes_captain_id ON public.financial_boxes(captain_id);
CREATE INDEX idx_financial_boxes_status ON public.financial_boxes(status);
CREATE INDEX idx_financial_boxes_created_at ON public.financial_boxes(created_at);
CREATE INDEX idx_invoices_financial_box_id ON public.invoices(financial_box_id);
CREATE INDEX idx_invoices_invoice_date ON public.invoices(invoice_date);
CREATE INDEX idx_invoices_is_paid ON public.invoices(is_paid);
CREATE INDEX idx_captains_is_active ON public.captains(is_active);

-- Enable Row Level Security on all tables
ALTER TABLE public.captains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access (since no user authentication mentioned in requirements)
-- These can be modified later when authentication is implemented
CREATE POLICY "public_access_captains"
ON public.captains
FOR ALL
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "public_access_financial_boxes"
ON public.financial_boxes
FOR ALL
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "public_access_invoices"
ON public.invoices
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Add triggers to automatically update the timestamp
CREATE TRIGGER update_captains_updated_at
    BEFORE UPDATE ON public.captains
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_boxes_updated_at
    BEFORE UPDATE ON public.financial_boxes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update financial box total amount when invoices change
CREATE OR REPLACE FUNCTION public.update_financial_box_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the total amount and last bill date for the financial box
    UPDATE public.financial_boxes
    SET 
        total_amount = (
            SELECT COALESCE(SUM(amount), 0)
            FROM public.invoices
            WHERE financial_box_id = COALESCE(NEW.financial_box_id, OLD.financial_box_id)
        ),
        last_bill_date = (
            SELECT MAX(invoice_date)
            FROM public.invoices
            WHERE financial_box_id = COALESCE(NEW.financial_box_id, OLD.financial_box_id)
        )
    WHERE id = COALESCE(NEW.financial_box_id, OLD.financial_box_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add triggers to update financial box totals when invoices change
CREATE TRIGGER update_box_total_on_invoice_insert
    AFTER INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_financial_box_total();

CREATE TRIGGER update_box_total_on_invoice_update
    AFTER UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_financial_box_total();

CREATE TRIGGER update_box_total_on_invoice_delete
    AFTER DELETE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_financial_box_total();

-- Insert sample data for demonstration
DO $$
DECLARE
    captain1_id UUID := gen_random_uuid();
    captain2_id UUID := gen_random_uuid();
    captain3_id UUID := gen_random_uuid();
    captain4_id UUID := gen_random_uuid();
    captain5_id UUID := gen_random_uuid();
    box1_id UUID := gen_random_uuid();
    box2_id UUID := gen_random_uuid();
    box3_id UUID := gen_random_uuid();
    box4_id UUID := gen_random_uuid();
    box5_id UUID := gen_random_uuid();
    box6_id UUID := gen_random_uuid();
BEGIN
    -- Insert sample captains  
    INSERT INTO public.captains (id, name, phone, email, experience_years, is_active) VALUES
        (captain1_id, 'أحمد محمد الصياد', '+966501234567', 'ahmed.alsayad@example.com', 15, true),
        (captain2_id, 'محمد علي البحار', '+966502345678', 'mohammed.albahr@example.com', 12, true),
        (captain3_id, 'عبدالله سالم القبطان', '+966503456789', 'abdullah.alqaptan@example.com', 20, true),
        (captain4_id, 'خالد أحمد الملاح', '+966504567890', 'khalid.almallah@example.com', 8, true),
        (captain5_id, 'سعد محمد الربان', '+966505678901', 'saad.alraban@example.com', 10, true);

    -- Insert sample financial boxes
    INSERT INTO public.financial_boxes (id, name, captain_id, crew_count, description, status, created_at) VALUES
        (box1_id, 'صندوق رحلة الخليج الأولى', captain1_id, 8, 'رحلة صيد في الخليج العربي لمدة أسبوع', 'completed'::public.box_status, '2025-01-15T10:00:00Z'),
        (box2_id, 'صندوق رحلة البحر الأحمر', captain2_id, 6, 'رحلة صيد في البحر الأحمر', 'draft'::public.box_status, '2025-01-20T14:30:00Z'),
        (box3_id, 'صندوق رحلة الغوص التجاري', captain3_id, 10, 'رحلة غوص تجاري لجمع اللؤلؤ', 'completed'::public.box_status, '2025-01-10T08:15:00Z'),
        (box4_id, 'صندوق رحلة النقل البحري', captain4_id, 4, 'رحلة نقل بضائع بين الموانئ', 'cancelled'::public.box_status, '2025-01-22T16:45:00Z'),
        (box5_id, 'صندوق رحلة الصيد الليلي', captain5_id, 7, 'رحلة صيد ليلي متخصصة', 'draft'::public.box_status, '2025-01-25T12:20:00Z'),
        (box6_id, 'صندوق رحلة السياحة البحرية', captain1_id, 5, 'رحلة سياحية بحرية للزوار', 'completed'::public.box_status, '2025-01-18T09:30:00Z');

    -- Insert sample invoices for financial boxes
    INSERT INTO public.invoices (financial_box_id, invoice_number, amount, invoice_date, description, is_paid) VALUES
        -- Box 1 invoices
        (box1_id, 'INV-2025-001', 15000.00, '2025-01-16', 'بيع صيد اليوم الأول', true),
        (box1_id, 'INV-2025-002', 12500.00, '2025-01-17', 'بيع صيد اليوم الثاني', true),
        (box1_id, 'INV-2025-003', 17500.00, '2025-01-18', 'بيع صيد اليوم الثالث', true),
        
        -- Box 2 invoices
        (box2_id, 'INV-2025-004', 8000.00, '2025-01-21', 'بيع صيد البحر الأحمر', false),
        (box2_id, 'INV-2025-005', 9500.00, '2025-01-22', 'بيع أسماك متنوعة', true),
        (box2_id, 'INV-2025-006', 15000.00, '2025-01-30', 'بيع صيد كبير', false),
        
        -- Box 3 invoices
        (box3_id, 'INV-2025-007', 25000.00, '2025-01-11', 'بيع اللؤلؤ المستخرج', true),
        (box3_id, 'INV-2025-008', 18000.00, '2025-01-12', 'بيع أسماك نادرة', true),
        (box3_id, 'INV-2025-009', 24800.00, '2025-01-25', 'بيع لؤلؤ إضافي', true),
        
        -- Box 6 invoices
        (box6_id, 'INV-2025-010', 7800.00, '2025-01-19', 'رسوم السياحة البحرية', true),
        (box6_id, 'INV-2025-011', 4200.00, '2025-01-20', 'خدمات إضافية للسياح', true),
        (box6_id, 'INV-2025-012', 3600.00, '2025-01-29', 'رحلة سياحية إضافية', true);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting sample data: %', SQLERRM;
END $$;