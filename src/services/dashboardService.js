import { supabase } from '../lib/supabaseClient';

// دالة مساعدة لتوحيد تنسيق الأنشطة
const formatActivity = (type, item, financialBoxName = null) => {
  const amount = parseFloat(item.amount || 0);
  const formattedAmount = amount.toLocaleString('en-US', { // استخدام 'en-US' لتنسيق الأرقام
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2
  });

  switch (type) {
    case 'invoice':
      return {
        id: `invoice-${item.id}`,
        type: 'invoice',
        title: `فاتورة جديدة - ${financialBoxName || 'غير محدد'}`,
        description: `تم إضافة فاتورة رقم ${item.invoice_number} بقيمة ${formattedAmount}`,
        amount: amount,
        status: item.is_paid ? 'completed' : 'pending',
        timestamp: new Date(item.created_at)
      };
    case 'crew':
      return {
        id: `crew-${item.id}`,
        type: 'crew',
        title: 'عضو طاقم جديد',
        description: `تم إضافة ${item.name} كعضو جديد في الطاقم (${item.role === 'captain' ? 'كابتن' : 'طاقم'})`,
        status: 'completed',
        timestamp: new Date(item.created_at)
      };
    case 'box':
      return {
        id: `box-${item.id}`,
        type: 'box',
        title: 'صندوق مالي جديد',
        description: `تم إنشاء صندوق "${item.name}" بنجاح`,
        status: 'completed', // افتراضي للصناديق المنشأة حديثا
        timestamp: new Date(item.created_at)
      };
    case 'debt':
      return {
        id: `debt-${item.id}`,
        type: 'payment', // يمكن أن يكون 'debt' أو 'transaction'
        title: item.debt_type === 'add' ? 'إضافة دين' : 'خصم دين',
        description: `تم ${item.debt_type === 'add' ? 'إضافة' : 'خصم'} مبلغ ${formattedAmount} ${item.debt_type === 'add' ? 'إلى' : 'من'} ${item.crew_members?.name || 'عضو طاقم'}`,
        amount: amount,
        status: 'completed', // افتراضي لأنشطة الديون المسجلة
        timestamp: new Date(item.created_at)
      };
    default:
      return null;
  }
};

export const dashboardService = {
  /**
   * يجلب أحدث الصناديق المالية.
   * @param {number} limit - الحد الأقصى لعدد الصناديق المراد جلبها.
   * @returns {Promise<Array<Object>>} - قائمة بالصناديق المالية المحولة.
   */
  async getRecentBoxes(limit = 3) {
    try {
      // جلب الصناديق المالية أولاً
      const { data: boxesData, error: boxesError } = await supabase
        .from('financial_boxes')
        .select(`
          id,
          name,
          status,
          total_amount,
          last_bill_date,
          created_at,
          updated_at
        `)
        .order('updated_at', { ascending: false })
        .limit(limit);
      
      if (boxesError) throw new Error(boxesError.message);
      
      // جلب عدد الفواتير لكل صندوق
      const boxIds = boxesData?.map(box => box.id) || [];
      let invoiceCounts = {};
      
      if (boxIds.length > 0) {
        const { data: invoiceData, error: invoiceError } = await supabase
          .from('invoices')
          .select('financial_box_id')
          .in('financial_box_id', boxIds);
        
        if (invoiceError) {
          console.warn('Warning: Could not fetch invoice counts:', invoiceError.message);
        } else {
          invoiceCounts = invoiceData.reduce((acc, invoice) => {
            acc[invoice.financial_box_id] = (acc[invoice.financial_box_id] || 0) + 1;
            return acc;
          }, {});
        }
      }
      
      // تحويل البيانات لتناسب واجهة المستخدم
      return boxesData.map(box => ({
        id: box.id,
        name: box.name,
        lastBillDate: box.last_bill_date,
        totalAmount: parseFloat(box.total_amount || 0),
        billsCount: invoiceCounts[box.id] || 0,
        status: box.status, // استخدام الحالة الفعلية من قاعدة البيانات
        paymentStatus: box.status // يمكن أن يكون هذا هو نفسه 'status' أو منطق مختلف
      })) || [];
    } catch (error) {
      console.error('Error fetching recent boxes:', error);
      throw error;
    }
  },

  /**
   * يجلب أحدث الأنشطة من مصادر مختلفة.
   * @param {number} limit - الحد الأقصى لعدد الأنشطة المراد جلبها.
   * @returns {Promise<Array<Object>>} - قائمة بالأنشطة المحولة، مرتبة حسب الطابع الزمني.
   */
  async getRecentActivity(limit = 5) {
    try {
      // جلب جميع البيانات بشكل متزامن باستخدام Promise.all
      const [
        { data: invoicesData, error: invoicesError },
        { data: crewData, error: crewError },
        { data: boxesData, error: boxesError },
        { data: debtsData, error: debtsError }
      ] = await Promise.all([
        supabase
          .from('invoices')
          .select(`
            id,
            amount,
            invoice_number,
            created_at,
            is_paid,
            financial_boxes (
              name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit + 2), // جلب أكثر قليلاً لضمان الحصول على الأحدث بعد الدمج والفرز
        
        supabase
          .from('crew_members')
          .select('id, name, created_at, role')
          .order('created_at', { ascending: false })
          .limit(limit + 2),
        
        supabase
          .from('financial_boxes')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(limit + 2),
        
        supabase
          .from('crew_debts')
          .select(`
            id,
            amount,
            debt_type,
            created_at,
            crew_members (
              name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit + 2)
      ]);

      const activities = [];

      // معالجة الفواتير
      if (!invoicesError && invoicesData) {
        invoicesData.forEach(invoice => {
          activities.push(formatActivity('invoice', invoice, invoice.financial_boxes?.name));
        });
      } else if (invoicesError) {
        console.warn('Warning: Could not fetch recent invoices:', invoicesError.message);
      }
      
      // معالجة أعضاء الطاقم
      if (!crewError && crewData) {
        crewData.forEach(member => {
          activities.push(formatActivity('crew', member));
        });
      } else if (crewError) {
        console.warn('Warning: Could not fetch recent crew members:', crewError.message);
      }
      
      // معالجة الصناديق المالية
      if (!boxesError && boxesData) {
        boxesData.forEach(box => {
          activities.push(formatActivity('box', box));
        });
      } else if (boxesError) {
        console.warn('Warning: Could not fetch recent financial boxes:', boxesError.message);
      }
      
      // معالجة أنشطة الديون
      if (!debtsError && debtsData) {
        debtsData.forEach(debt => {
          activities.push(formatActivity('debt', debt));
        });
      } else if (debtsError) {
        console.warn('Warning: Could not fetch recent debt activities:', debtsError.message);
      }
      
      // فرز جميع الأنشطة حسب الطابع الزمني والتقييد بالحد الأقصى
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // استخدام getTime() للمقارنة
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }
};
