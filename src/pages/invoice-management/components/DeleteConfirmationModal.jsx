import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, invoiceData }) => {
  if (!isOpen || !invoiceData) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })?.format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-lg elevation-3 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <Icon name="Trash2" size={20} className="text-destructive" />
            </div>
            <h2 className="text-xl font-heading font-semibold text-foreground">
              حذف الفاتورة
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-foreground mb-4">
              هل أنت متأكد من رغبتك في حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            
            {/* Invoice Details */}
            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">التاريخ:</span>
                <span className="text-sm font-medium text-foreground">
                  {formatDate(invoiceData?.date)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">المبلغ:</span>
                <span className="text-sm font-bold text-destructive">
                  {formatCurrency(invoiceData?.amount)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">رقم الطاقم:</span>
                <span className="text-sm font-medium text-foreground">
                  {invoiceData?.captainCrewNumber}
                </span>
              </div>
              
              {invoiceData?.observations && (
                <div className="pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">الملاحظات:</span>
                  <p className="text-sm text-foreground mt-1">
                    {invoiceData?.observations}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start space-x-3 rtl:space-x-reverse p-4 bg-warning/10 border border-warning/20 rounded-lg mb-6">
            <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-warning mb-1">تحذير</p>
              <p className="text-muted-foreground">
                سيؤثر حذف هذه الفاتورة على حسابات توزيع الأرباح للصندوق المالي
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={onClose}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              iconName="Trash2"
              iconPosition="right"
            >
              حذف الفاتورة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;