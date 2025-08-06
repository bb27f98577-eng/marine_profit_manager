import { supabase } from '../lib/supabaseClient';

// تعريف الاستعلام المشترك لـ SELECT لتقليل التكرار
const INVOICE_SELECT_QUERY = `
  *,
  financial_boxes (
    id,
    name,
    captain_id,
    crew_count,
    captains (
      id,
      name
    )
  )
`;

// دالة مساعدة لتحويل بيانات الفاتورة من snake_case إلى camelCase
// وتوحيد تنسيق البيانات العائدة من Supabase
const transformInvoiceData = (invoice) => {
  if (!invoice) return null; // التعامل مع الحالات الفارغة

  return {
    id: invoice.id,
    date: invoice.invoice_date,
    amount: parseFloat(invoice.amount || 0), // التأكد من أن المبلغ رقم
    observations: invoice.description,
    invoiceNumber: invoice.invoice_number,
    isPaid: invoice.is_paid,
    financialBoxId: invoice.financial_box_id,
    financialBoxName: invoice.financial_boxes?.name,
    captainCrewNumber: invoice.financial_boxes?.crew_count,
    captainName: invoice.financial_boxes?.captains?.name || 'غير محدد',
    createdAt: invoice.created_at,
    updatedAt: invoice.updated_at
  };
};

export const invoiceService = {
  /**
   * يجلب جميع الفواتير، مع إمكانية التصفية حسب الصندوق المالي.
   * يتضمن بيانات الصندوق المالي والقبطان المرتبطة.
   * @param {string} financialBoxId - معرّف الصندوق المالي للتصفية.
   * @returns {Promise<Array<Object>>} - قائمة بالفواتير المحولة.
   */
  async getAll(financialBoxId = null) {
    try {
      let query = supabase
        .from('invoices')
        .select(INVOICE_SELECT_QUERY)
        .order('invoice_date', { ascending: false });
      
      if (financialBoxId) {
        query = query.eq('financial_box_id', financialBoxId);
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      // تحويل البيانات باستخدام الدالة المساعدة
      return data ? data.map(transformInvoiceData) : [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  /**
   * يجلب فاتورة واحدة بناءً على معرّفها.
   * يتضمن بيانات الصندوق المالي والقبطان المرتبطة.
   * @param {string} id - معرّف الفاتورة.
   * @returns {Promise<Object>} - كائن الفاتورة المحول.
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(INVOICE_SELECT_QUERY)
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      
      // تحويل البيانات باستخدام الدالة المساعدة
      return transformInvoiceData(data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  },

  /**
   * ينشئ فاتورة جديدة.
   * @param {Object} invoiceData - بيانات الفاتورة الجديدة.
   * @returns {Promise<Object>} - كائن الفاتورة المحول الذي تم إنشاؤه.
   */
  async create(invoiceData) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceData.invoiceNumber || `INV-${Date.now()}`,
          invoice_date: invoiceData.date,
          amount: parseFloat(invoiceData.amount),
          description: invoiceData.observations?.trim() || null,
          financial_box_id: invoiceData.financialBoxId,
          is_paid: invoiceData.isPaid || false
        })
        .select(INVOICE_SELECT_QUERY) // استخدام الاستعلام المشترك
        .single();
      
      if (error) {
        // معالجة خطأ تكرار رقم الفاتورة بشكل خاص
        if (error.code === '23505' && error.message.includes('invoice_number')) {
          throw new Error('رقم الفاتورة موجود بالفعل، يرجى استخدام رقم آخر');
        }
        throw new Error(error.message);
      }
      
      // تحويل البيانات باستخدام الدالة المساعدة
      return transformInvoiceData(data);
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  /**
   * يحدث فاتورة موجودة.
   * @param {string} id - معرّف الفاتورة المراد تحديثها.
   * @param {Object} updates - البيانات المراد تحديثها.
   * @returns {Promise<Object>} - كائن الفاتورة المحول الذي تم تحديثه.
   */
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          invoice_number: updates.invoiceNumber,
          invoice_date: updates.date,
          amount: parseFloat(updates.amount),
          description: updates.observations?.trim() || null,
          is_paid: updates.isPaid
        })
        .eq('id', id)
        .select(INVOICE_SELECT_QUERY) // استخدام الاستعلام المشترك
        .single();
      
      if (error) {
        // معالجة خطأ تكرار رقم الفاتورة بشكل خاص
        if (error.code === '23505' && error.message.includes('invoice_number')) {
          throw new Error('رقم الفاتورة موجود بالفعل، يرجى استخدام رقم آخر');
        }
        throw new Error(error.message);
      }
      
      // تحويل البيانات باستخدام الدالة المساعدة
      return transformInvoiceData(data);
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  },

  /**
   * يحذف فاتورة بناءً على معرّفها.
   * @param {string} id - معرّف الفاتورة المراد حذفها.
   * @returns {Promise<boolean>} - صحيح إذا تم الحذف بنجاح.
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  },

  /**
   * يحدث حالة دفع فاتورة.
   * @param {string} id - معرّف الفاتورة.
   * @param {boolean} isPaid - حالة الدفع الجديدة.
   * @returns {Promise<Object>} - بيانات الفاتورة المحدثة.
   */
  async updatePaymentStatus(id, isPaid) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({ is_paid: isPaid })
        .eq('id', id)
        .select() // هنا لا نحتاج للبيانات المرتبطة الكاملة، فقط بيانات الفاتورة نفسها
        .single();
      
      if (error) throw new Error(error.message);
      // يمكن تحويل البيانات هنا إذا لزم الأمر، ولكن select() بدون query string سيعيد البيانات الأصلية
      return data; 
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  /**
   * يجلب الفواتير ضمن نطاق تاريخي محدد.
   * @param {string} financialBoxId - معرّف الصندوق المالي للتصفية.
   * @param {string} startDate - تاريخ البدء (بصيغة YYYY-MM-DD).
   * @param {string} endDate - تاريخ الانتهاء (بصيغة YYYY-MM-DD).
   * @returns {Promise<Array<Object>>} - قائمة بالفواتير.
   */
  async getInvoicesByDateRange(financialBoxId, startDate, endDate) {
    try {
      let query = supabase
        .from('invoices')
        .select(INVOICE_SELECT_QUERY) // استخدام الاستعلام المشترك
        .gte('invoice_date', startDate)
        .lte('invoice_date', endDate)
        .order('invoice_date', { ascending: false });
      
      if (financialBoxId) {
        query = query.eq('financial_box_id', financialBoxId);
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      // تحويل البيانات باستخدام الدالة المساعدة
      return data ? data.map(transformInvoiceData) : [];
    } catch (error) {
      console.error('Error fetching invoices by date range:', error);
      throw error;
    }
  },

  /**
   * يجلب إحصائيات الفواتير (الإجمالي، المدفوع، غير المدفوع).
   * @param {string} financialBoxId - معرّف الصندوق المالي للتصفية.
   * @returns {Promise<Object>} - كائن يحتوي على إحصائيات الفواتير.
   */
  async getInvoiceStats(financialBoxId = null) {
    try {
      let query = supabase
        .from('invoices')
        .select('amount, is_paid'); // هنا لا نحتاج لجلب البيانات المرتبطة الكاملة
      
      if (financialBoxId) {
        query = query.eq('financial_box_id', financialBoxId);
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      const stats = data.reduce((acc, invoice) => {
        const amount = parseFloat(invoice.amount || 0);
        acc.totalAmount += amount;
        acc.totalCount += 1;
        
        if (invoice.is_paid) {
          acc.paidAmount += amount;
          acc.paidCount += 1;
        } else {
          acc.unpaidAmount += amount;
          acc.unpaidCount += 1;
        }
        
        return acc;
      }, {
        totalAmount: 0,
        totalCount: 0,
        paidAmount: 0,
        paidCount: 0,
        unpaidAmount: 0,
        unpaidCount: 0
      }); // لا حاجة لـ || {} هنا لأن reduce سيضمن القيم الأولية
      
      return stats;
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      throw error;
    }
  }
};
