import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const InvoiceFormModal = ({ isOpen, onClose, onSubmit, editingInvoice = null, boxSettings, availableBoxes = [] }) => {
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    observations: '',
    financialBoxId: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingInvoice) {
      setFormData({
        amount: editingInvoice?.amount?.toString(),
        date: editingInvoice?.date,
        observations: editingInvoice?.observations || '',
        financialBoxId: editingInvoice?.financialBoxId || boxSettings?.id || ''
      });
    } else {
      setFormData({
        amount: '',
        date: new Date()?.toISOString()?.split('T')?.[0],
        observations: '',
        financialBoxId: boxSettings?.id || ''
      });
    }
    setErrors({});
  }, [editingInvoice, isOpen, boxSettings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.amount || parseFloat(formData?.amount) <= 0) {
      newErrors.amount = 'يجب إدخال مبلغ صحيح';
    }

    if (!formData?.date) {
      newErrors.date = 'يجب اختيار التاريخ';
    }

    if (!formData?.financialBoxId) {
      newErrors.financialBoxId = 'يجب اختيار الصندوق المالي';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const invoiceData = {
        ...formData,
        amount: parseFloat(formData?.amount),
        id: editingInvoice?.id || Date.now()
      };
      
      await onSubmit(invoiceData);
      onClose();
    } catch (error) {
      console.error('Error submitting invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Get selected box details for crew count display
  const selectedBox = availableBoxes?.find(box => box?.value === formData?.financialBoxId) || boxSettings;
  const selectedBoxData = selectedBox?.data || boxSettings;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs animate-fade-in"
        onClick={handleClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-lg elevation-3 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-heading font-semibold text-foreground">
            {editingInvoice ? 'تعديل الفاتورة' : 'إضافة فاتورة جديدة'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Financial Box Selection */}
          <Select
            label="الصندوق المالي"
            placeholder="اختر الصندوق المالي"
            value={formData?.financialBoxId}
            onChange={(value) => handleInputChange('financialBoxId', value)}
            options={availableBoxes}
            error={errors?.financialBoxId}
            required
            searchable
            className="w-full"
          />

          {/* Crew Count Display */}
          {selectedBoxData && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Icon name="Users" size={20} className="text-primary" />
                  <span className="text-sm font-medium text-primary">عدد أفراد الطاقم</span>
                </div>
                <span className="text-lg font-bold text-primary">{selectedBoxData?.crewCount || 0} فرد</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                الصندوق المحدد: {selectedBoxData?.name || 'غير محدد'}
              </p>
            </div>
          )}

          {/* Amount Input */}
          <Input
            label="المبلغ (ريال سعودي)"
            type="number"
            placeholder="0.00"
            value={formData?.amount}
            onChange={(e) => handleInputChange('amount', e?.target?.value)}
            error={errors?.amount}
            required
            min="0"
            step="0.01"
            className="text-right"
          />

          {/* Date Input */}
          <Input
            label="تاريخ الفاتورة"
            type="date"
            value={formData?.date}
            onChange={(e) => handleInputChange('date', e?.target?.value)}
            error={errors?.date}
            required
          />

          {/* Observations Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              الملاحظات (اختياري)
            </label>
            <textarea
              value={formData?.observations}
              onChange={(e) => handleInputChange('observations', e?.target?.value)}
              placeholder="أدخل أي ملاحظات إضافية..."
              rows={3}
              className="w-full px-3 py-2 text-sm bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
              dir="rtl"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              iconName={editingInvoice ? 'Save' : 'Plus'}
              iconPosition="right"
            >
              {editingInvoice ? 'حفظ التعديلات' : 'إضافة الفاتورة'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceFormModal;