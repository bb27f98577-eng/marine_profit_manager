import { supabase } from '../lib/supabaseClient';

export const financialBoxService = {
  async getAll() {
    try {
      // First get financial boxes with captain info
      const { data: boxesData, error: boxesError } = await supabase
        ?.from('financial_boxes')
        ?.select(`
          *,
          captains (
            id,
            name
          )
        `)
        ?.order('created_at', { ascending: false });
      
      if (boxesError) throw new Error(boxesError.message);
      
      // Get invoice counts for each box
      const boxIds = boxesData?.map(box => box?.id) || [];
      let invoiceCounts = {};
      
      if (boxIds?.length > 0) {
        const { data: invoiceData, error: invoiceError } = await supabase
          ?.from('invoices')
          ?.select('financial_box_id')
          ?.in('financial_box_id', boxIds);
        
        if (invoiceError) {
          console.warn('Warning: Could not fetch invoice counts:', invoiceError);
        } else {
          // Count invoices per box
          invoiceCounts = invoiceData?.reduce((acc, invoice) => {
            acc[invoice?.financial_box_id] = (acc?.[invoice?.financial_box_id] || 0) + 1;
            return acc;
          }, {}) || {};
        }
      }
      
      // Transform data to match UI expectations
      return boxesData?.map(box => ({
        ...box,
        captainName: box?.captains?.name || 'غير محدد',
        captainId: box?.captain_id,
        crewCount: box?.crew_count,
        totalAmount: parseFloat(box?.total_amount || 0),
        invoiceCount: invoiceCounts?.[box?.id] || 0,
        lastBillDate: box?.last_bill_date
      })) || [];
    } catch (error) {
      console.error('Error fetching financial boxes:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        ?.from('financial_boxes')
        ?.select(`
          *,
          captains (
            id,
            name
          ),
          invoices (*)
        `)
        ?.eq('id', id)
        ?.single();
      
      if (error) throw new Error(error.message);
      
      return {
        ...data,
        captainName: data?.captains?.name || 'غير محدد',
        captainId: data?.captain_id,
        crewCount: data?.crew_count,
        totalAmount: parseFloat(data?.total_amount || 0),
        invoiceCount: data?.invoices?.length || 0,
        lastBillDate: data?.last_bill_date
      };
    } catch (error) {
      console.error('Error fetching financial box:', error);
      throw error;
    }
  },

  async create(boxData) {
    try {
      const { data, error } = await supabase
        ?.from('financial_boxes')
        ?.insert({
          name: boxData?.name?.trim(),
          captain_id: boxData?.captainId || null,
          crew_count: parseInt(boxData?.crewCount),
          description: boxData?.description?.trim() || null,
          status: boxData?.status || 'draft',
          total_amount: 0
        })
        ?.select(`
          *,
          captains (
            id,
            name
          )
        `)
        ?.single();
      
      if (error) throw new Error(error.message);
      
      return {
        ...data,
        captainName: data?.captains?.name || 'غير محدد',
        captainId: data?.captain_id,
        crewCount: data?.crew_count,
        totalAmount: parseFloat(data?.total_amount || 0),
        invoiceCount: 0,
        lastBillDate: data?.last_bill_date
      };
    } catch (error) {
      console.error('Error creating financial box:', error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      const { data, error } = await supabase
        ?.from('financial_boxes')
        ?.update({
          name: updates?.name?.trim(),
          captain_id: updates?.captainId,
          crew_count: parseInt(updates?.crewCount),
          description: updates?.description?.trim() || null,
          status: updates?.status
        })
        ?.eq('id', id)
        ?.select(`
          *,
          captains (
            id,
            name
          )
        `)
        ?.single();
      
      if (error) throw new Error(error.message);
      
      // Get invoice count for updated box
      const { data: invoiceData } = await supabase
        ?.from('invoices')
        ?.select('id')
        ?.eq('financial_box_id', id);
      
      return {
        ...data,
        captainName: data?.captains?.name || 'غير محدد',
        captainId: data?.captain_id,
        crewCount: data?.crew_count,
        totalAmount: parseFloat(data?.total_amount || 0),
        invoiceCount: invoiceData?.length || 0,
        lastBillDate: data?.last_bill_date
      };
    } catch (error) {
      console.error('Error updating financial box:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      // First, delete all related invoices
      const { error: invoicesDeleteError } = await supabase
        ?.from('invoices')
        ?.delete()
        ?.eq('financial_box_id', id);
      
      if (invoicesDeleteError) {
        throw new Error(`فشل في حذف الفواتير المرتبطة: ${invoicesDeleteError.message}`);
      }
      
      // Then delete the financial box
      const { error } = await supabase
        ?.from('financial_boxes')
        ?.delete()
        ?.eq('id', id);
      
      if (error) throw new Error(error.message);
      return true;
    } catch (error) {
      console.error('Error deleting financial box:', error);
      throw error;
    }
  },

  async updateStatus(id, newStatus) {
    try {
      const { data, error } = await supabase
        ?.from('financial_boxes')
        ?.update({ 
          status: newStatus
        })
        ?.eq('id', id)
        ?.select()
        ?.single();
      
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Error updating box status:', error);
      throw error;
    }
  },

  // New method to get captains for dropdowns
  async getCaptains() {
    try {
      const { data, error } = await supabase
        ?.from('captains')
        ?.select('id, name')
        ?.eq('is_active', true)
        ?.order('name');
      
      if (error) throw new Error(error.message);
      
      return data?.map(captain => ({
        value: captain?.id,
        label: captain?.name
      })) || [];
    } catch (error) {
      console.error('Error fetching captains:', error);
      throw error;
    }
  },

  // New method to get crew members for dropdowns
  async getCrewMembers() {
    try {
      const { data, error } = await supabase
        ?.from('crew_members')
        ?.select('id, name, role')
        ?.eq('is_active', true)
        ?.order('name');
      
      if (error) throw new Error(error.message);
      
      return data?.map(member => ({
        value: member?.id,
        label: `${member?.name} (${member?.role === 'captain' ? 'كابتن' : 'طاقم'})`,
        role: member?.role
      })) || [];
    } catch (error) {
      console.error('Error fetching crew members:', error);
      throw error;
    }
  },

  // New method to get box crew members with details
  async getBoxCrewMembers(boxId) {
    try {
      // Check if the financial_box_crew_members table exists by attempting the query
      const { data, error } = await supabase
        ?.from('financial_box_crew_members')
        ?.select(`
          *,
          crew_members (
            id,
            name,
            role,
            phone,
            email,
            join_date,
            profit_share,
            crew_debts (
              id,
              amount,
              debt_type
            )
          )
        `)
        ?.eq('financial_box_id', boxId)
        ?.eq('is_active', true)
        ?.order('assigned_at', { ascending: false });
      
      if (error) {
        // Handle the specific case where the table doesn't exist
        if (error?.message?.includes('relation "public.financial_box_crew_members" does not exist') || 
            error?.message?.includes('Could not find the table')) {
          console.warn('financial_box_crew_members table not found. Please apply the migration.');
          // Return empty array instead of throwing error
          return [];
        }
        throw new Error(error.message);
      }
      
      // Transform data to match UI expectations
      return data?.map(assignment => {
        const member = assignment?.crew_members;
        const totalDebt = member?.crew_debts?.reduce((total, debt) => {
          const amount = parseFloat(debt?.amount || 0);
          return debt?.debt_type === 'add' ? total + amount : total - amount;
        }, 0) || 0;

        return {
          id: member?.id,
          name: member?.name,
          role: member?.role,
          phone: member?.phone,
          email: member?.email,
          currentDebt: totalDebt,
          profitShare: parseFloat(member?.profit_share || 0),
          joinDate: member?.join_date,
          paymentStatus: totalDebt > 0 ? 'unpaid' : 'paid',
          assignedAt: assignment?.assigned_at
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching box crew members:', error);
      // Return empty array instead of throwing error to prevent UI crashes
      return [];
    }
  },

  // New method to assign crew members to box
  async assignCrewMembers(boxId, crewMemberIds) {
    try {
      // First remove existing assignments
      const { error: deleteError } = await supabase
        ?.from('financial_box_crew_members')
        ?.delete()
        ?.eq('financial_box_id', boxId);
      
      if (deleteError) {
        // Handle the specific case where the table doesn't exist
        if (deleteError?.message?.includes('relation "public.financial_box_crew_members" does not exist') || 
            deleteError?.message?.includes('Could not find the table')) {
          console.warn('financial_box_crew_members table not found. Cannot assign crew members. Please apply the migration.');
          return false;
        }
        throw new Error(deleteError.message);
      }
      
      // Then add new assignments
      if (crewMemberIds?.length > 0) {
        const assignments = crewMemberIds?.map(memberId => ({
          financial_box_id: boxId,
          crew_member_id: memberId
        }));
        
        const { error: insertError } = await supabase
          ?.from('financial_box_crew_members')
          ?.insert(assignments);
        
        if (insertError) throw new Error(insertError.message);
      }
      
      return true;
    } catch (error) {
      console.error('Error assigning crew members:', error);
      return false;
    }
  },

  // New method to confirm payment and complete financial box
  async confirmPaymentAndComplete(boxId, totalPaymentAmount) {
    try {
      // Get current box data
      const { data: currentBox, error: fetchError } = await supabase
        ?.from('financial_boxes')
        ?.select('total_amount, status')
        ?.eq('id', boxId)
        ?.single();
      
      if (fetchError) throw new Error(fetchError.message);
      
      const currentAmount = parseFloat(currentBox?.total_amount || 0);
      const newAmount = Math.max(0, currentAmount - totalPaymentAmount);
      
      // Update financial box with deducted amount and completed status
      const { data, error } = await supabase
        ?.from('financial_boxes')
        ?.update({ 
          total_amount: newAmount,
          status: 'completed'
        })
        ?.eq('id', boxId)
        ?.select(`
          *,
          captains (
            id,
            name
          )
        `)
        ?.single();
      
      if (error) throw new Error(error.message);
      
      return {
        ...data,
        captainName: data?.captains?.name || 'غير محدد',
        captainId: data?.captain_id,
        crewCount: data?.crew_count,
        totalAmount: parseFloat(data?.total_amount || 0),
        previousAmount: currentAmount,
        deductedAmount: totalPaymentAmount
      };
    } catch (error) {
      console.error('Error confirming payment and completing box:', error);
      throw error;
    }
  }
};