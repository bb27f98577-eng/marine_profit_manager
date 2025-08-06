import { supabase } from '../lib/supabaseClient';

// Safe function execution helper
const safeExecute = async (operation, fallback) => {
  try {
    return await operation();
  } catch (error) {
    console.warn('Primary operation failed, attempting fallback:', error?.message);
    if (typeof fallback === 'function') {
      return await fallback();
    }
    throw error;
  }
};

// Safe data transformation helper
const safeTransform = (data, transformer) => {
  try {
    if (!data || !Array.isArray(data)) return [];
    return data?.map(transformer)?.filter(Boolean);
  } catch (error) {
    console.error('Data transformation error:', error);
    return [];
  }
};

export const crewService = {
  async getAll() {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Primary operation with RPC
      const primaryOperation = async () => {
        const { data, error } = await supabase
          ?.rpc('get_all_crew_members_with_debt');
        
        if (error) throw error;
        return data;
      };

      // Fallback operation with direct query
      const fallbackOperation = async () => {
        const { data: fallbackData, error: fallbackError } = await supabase
          ?.from('crew_members')
          ?.select(`
            id,
            name,
            role,
            phone,
            email,
            join_date,
            profit_share,
            is_active,
            created_at,
            updated_at,
            crew_debts (
              id,
              amount,
              debt_type
            )
          `)
          ?.eq('is_active', true)
          ?.order('created_at', { ascending: false });
          
        if (fallbackError) throw fallbackError;
        
        // Safely calculate debt totals
        return fallbackData?.map(member => {
          const totalDebt = (member?.crew_debts || [])?.reduce((total, debt) => {
            const amount = parseFloat(debt?.amount || 0);
            return debt?.debt_type === 'add' ? total + amount : total - amount;
          }, 0);
          
          return {
            id: member?.id,
            name: member?.name,
            role: member?.role,
            phone: member?.phone,
            email: member?.email,
            join_date: member?.join_date,
            profit_share: member?.profit_share,
            total_debt: totalDebt,
            final_share: (parseFloat(member?.profit_share || 0) - totalDebt),
            is_active: member?.is_active,
            created_at: member?.created_at,
            updated_at: member?.updated_at
          };
        }) || [];
      };

      let data = await safeExecute(primaryOperation, fallbackOperation);
      
      // Transform data safely
      return safeTransform(data, member => ({
        id: member?.id,
        name: member?.name || '',
        role: member?.role || '',
        phone: member?.phone || '',
        email: member?.email || '',
        debt: parseFloat(member?.total_debt || 0),
        profitShare: parseFloat(member?.profit_share || 0),
        finalShare: parseFloat(member?.final_share || 0),
        joinDate: member?.join_date,
        lastDebtUpdate: member?.updated_at,
        isActive: Boolean(member?.is_active)
      }));
    } catch (error) {
      console.error('Error fetching crew members:', error);
      throw new Error(`Failed to fetch crew members: ${error?.message || 'Unknown error'}`);
    }
  },

  async getById(id) {
    try {
      if (!supabase || !id) {
        throw new Error('Invalid parameters');
      }

      // Primary operation with RPC
      const primaryOperation = async () => {
        const { data, error } = await supabase
          ?.rpc('get_crew_member_with_debt', { member_id: id });
        
        if (error) throw error;
        return data;
      };

      // Fallback operation with direct query
      const fallbackOperation = async () => {
        const { data: fallbackData, error: fallbackError } = await supabase
          ?.from('crew_members')
          ?.select(`
            id,
            name,
            role,
            phone,
            email,
            join_date,
            profit_share,
            is_active,
            created_at,
            updated_at,
            crew_debts (
              id,
              amount,
              debt_type
            )
          `)
          ?.eq('id', id)
          ?.eq('is_active', true)
          ?.single();
          
        if (fallbackError) throw fallbackError;
        
        if (!fallbackData) {
          throw new Error('Crew member not found');
        }
        
        // Safely calculate debt total
        const totalDebt = (fallbackData?.crew_debts || [])?.reduce((total, debt) => {
          const amount = parseFloat(debt?.amount || 0);
          return debt?.debt_type === 'add' ? total + amount : total - amount;
        }, 0);
        
        return [{
          id: fallbackData?.id,
          name: fallbackData?.name,
          role: fallbackData?.role,
          phone: fallbackData?.phone,
          email: fallbackData?.email,
          join_date: fallbackData?.join_date,
          profit_share: fallbackData?.profit_share,
          total_debt: totalDebt,
          final_share: (parseFloat(fallbackData?.profit_share || 0) - totalDebt),
          is_active: fallbackData?.is_active,
          created_at: fallbackData?.created_at,
          updated_at: fallbackData?.updated_at
        }];
      };

      let data = await safeExecute(primaryOperation, fallbackOperation);
      
      if (!data || data?.length === 0) {
        throw new Error('Crew member not found');
      }
      
      const member = data?.[0];
      return {
        id: member?.id,
        name: member?.name || '',
        role: member?.role || '',
        phone: member?.phone || '',
        email: member?.email || '',
        debt: parseFloat(member?.total_debt || 0),
        profitShare: parseFloat(member?.profit_share || 0),
        finalShare: parseFloat(member?.final_share || 0),
        joinDate: member?.join_date,
        lastDebtUpdate: member?.updated_at,
        isActive: Boolean(member?.is_active)
      };
    } catch (error) {
      console.error('Error fetching crew member:', error);
      throw new Error(`Failed to fetch crew member: ${error?.message || 'Unknown error'}`);
    }
  },

  async create(memberData) {
    try {
      if (!supabase || !memberData?.name) {
        throw new Error('Invalid parameters');
      }

      const { data, error } = await supabase
        ?.from('crew_members')
        ?.insert({
          name: String(memberData?.name || '')?.trim(),
          role: memberData?.role || 'crew',
          phone: memberData?.phone ? String(memberData?.phone)?.trim() : null,
          email: memberData?.email ? String(memberData?.email)?.trim() : null,
          join_date: memberData?.joinDate || new Date()?.toISOString()?.split('T')?.[0],
          profit_share: parseFloat(memberData?.profitShare || 0),
          is_active: true
        })
        ?.select()
        ?.single();
      
      if (error) throw error;
      
      return {
        id: data?.id,
        name: data?.name || '',
        role: data?.role || '',
        phone: data?.phone || '',
        email: data?.email || '',
        debt: 0.00,
        profitShare: parseFloat(data?.profit_share || 0),
        finalShare: parseFloat(data?.profit_share || 0),
        joinDate: data?.join_date,
        lastDebtUpdate: data?.created_at,
        isActive: Boolean(data?.is_active),
        debtHistory: []
      };
    } catch (error) {
      console.error('Error creating crew member:', error);
      throw new Error(`Failed to create crew member: ${error?.message || 'Unknown error'}`);
    }
  },

  async update(id, updates) {
    try {
      if (!supabase || !id || !updates) {
        throw new Error('Invalid parameters');
      }

      const { data, error } = await supabase
        ?.from('crew_members')
        ?.update({
          name: String(updates?.name || '')?.trim(),
          role: updates?.role || 'crew',
          phone: updates?.phone ? String(updates?.phone)?.trim() : null,
          email: updates?.email ? String(updates?.email)?.trim() : null,
          profit_share: parseFloat(updates?.profitShare || 0)
        })
        ?.eq('id', id)
        ?.select()
        ?.single();
      
      if (error) throw error;
      
      // Get updated member with debt calculations
      return await this.getById(id);
    } catch (error) {
      console.error('Error updating crew member:', error);
      throw new Error(`Failed to update crew member: ${error?.message || 'Unknown error'}`);
    }
  },

  async delete(id) {
    try {
      // First try using the RPC function
      let { data, error } = await supabase
        ?.rpc('delete_crew_member_permanently', { member_id: id });
      
      // If RPC fails, fall back to manual deletion
      if (error && error?.message?.includes('schema cache')) {
        console.warn('RPC function not found in schema cache, falling back to manual deletion:', error?.message);
        
        // Delete crew debts first (foreign key constraint)
        const { error: debtError } = await supabase
          ?.from('crew_debts')
          ?.delete()
          ?.eq('crew_member_id', id);
          
        if (debtError) throw new Error(debtError.message);
        
        // Then delete the crew member
        const { error: memberError } = await supabase
          ?.from('crew_members')
          ?.delete()
          ?.eq('id', id);
          
        if (memberError) throw new Error(memberError.message);
        
        data = true;
      } else if (error) {
        throw new Error(error.message);
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting crew member:', error);
      throw error;
    }
  },

  async getDebtHistory(memberId) {
    try {
      // First attempt: Try using the RPC function
      let { data, error } = await supabase
        ?.rpc('get_crew_member_debt_history', { member_id: memberId });
      
      // If RPC fails, fall back to direct query
      if (error && error?.message?.includes('schema cache')) {
        console.warn('RPC function not found in schema cache, falling back to direct query:', error?.message);
        
        const { data: fallbackData, error: fallbackError } = await supabase
          ?.from('crew_debts')
          ?.select('*')
          ?.eq('crew_member_id', memberId)
          ?.order('debt_date', { ascending: false })
          ?.order('created_at', { ascending: false });
          
        if (fallbackError) throw new Error(fallbackError.message);
        data = fallbackData;
      } else if (error) {
        throw new Error(error.message);
      }
      
      return data?.map(debt => ({
        id: debt?.id,
        amount: parseFloat(debt?.amount),
        description: debt?.description,
        date: debt?.debt_date,
        type: debt?.debt_type,
        timestamp: debt?.created_at
      })) || [];
    } catch (error) {
      console.error('Error fetching debt history:', error);
      throw error;
    }
  },

  async addDebt(memberId, debtData) {
    try {
      const { data, error } = await supabase
        ?.from('crew_debts')
        ?.insert({
          crew_member_id: memberId,
          amount: parseFloat(debtData?.amount),
          description: debtData?.description?.trim(),
          debt_type: debtData?.type || 'add',
          debt_date: debtData?.date || new Date()?.toISOString()?.split('T')?.[0]
        })
        ?.select()
        ?.single();
      
      if (error) throw new Error(error.message);
      
      return {
        id: data?.id,
        amount: parseFloat(data?.amount),
        description: data?.description,
        date: data?.debt_date,
        type: data?.debt_type,
        timestamp: data?.created_at
      };
    } catch (error) {
      console.error('Error adding debt:', error);
      throw error;
    }
  },

  async updateDebt(debtId, debtData) {
    try {
      const { data, error } = await supabase
        ?.from('crew_debts')
        ?.update({
          amount: parseFloat(debtData?.amount),
          description: debtData?.description?.trim(),
          debt_type: debtData?.type,
          debt_date: debtData?.date
        })
        ?.eq('id', debtId)
        ?.select()
        ?.single();
      
      if (error) throw new Error(error.message);
      
      return {
        id: data?.id,
        amount: parseFloat(data?.amount),
        description: data?.description,
        date: data?.debt_date,
        type: data?.debt_type,
        timestamp: data?.updated_at
      };
    } catch (error) {
      console.error('Error updating debt:', error);
      throw error;
    }
  },

  async deleteDebt(debtId) {
    try {
      const { error } = await supabase
        ?.from('crew_debts')
        ?.delete()
        ?.eq('id', debtId);
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (error) {
      console.error('Error deleting debt:', error);
      throw error;
    }
  }
};