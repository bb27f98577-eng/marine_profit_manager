import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PaymentConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  paymentData, 
  onConfirm 
}) => {
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm({
        ...paymentData,
        notes,
        paymentMethod,
        timestamp: new Date()?.toISOString()
      });
      onClose();
    } catch (error) {
      console.error('Payment confirmation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !paymentData) return null;

  const { type, members, totalAmount } = paymentData;
  const isBatchPayment = type === 'batch';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-lg elevation-3 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="CreditCard" size={20} className="text-success" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">
                {isBatchPayment ? 'تأكيد الدفع المجمع' : 'تأكيد الدفع الفردي'}
              </h3>
              <p className="text-sm text-muted-foreground">
                تأكيد عملية الدفع للطاقم
              </p>
            </div>
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
        <div className="p-4 space-y-4">
          {/* Payment Summary */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">ملخص الدفعة</h4>
            
            {isBatchPayment ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">عدد أفراد الطاقم:</span>
                  <span className="font-medium">{members?.length} فرد</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">إجمالي المبلغ:</span>
                  <span className="font-bold text-success">
                    {totalAmount?.toLocaleString('ar-SA')} ريال
                  </span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="text-xs text-muted-foreground mb-1">أفراد الطاقم:</div>
                  <div className="space-y-1">
                    {members?.slice(0, 3)?.map(member => (
                      <div key={member?.id} className="flex justify-between text-xs">
                        <span>{member?.name}</span>
                        <span>{member?.amount?.toLocaleString('ar-SA')} ريال</span>
                      </div>
                    ))}
                    {members?.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        و {members?.length - 3} آخرين...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">اسم الطاقم:</span>
                  <span className="font-medium">{members?.[0]?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المنصب:</span>
                  <span className="font-medium">
                    {members?.[0]?.role === 'captain' ? 'كابتن' : 'طاقم'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المبلغ:</span>
                  <span className="font-bold text-success">
                    {totalAmount?.toLocaleString('ar-SA')} ريال
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              طريقة الدفع
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  paymentMethod === 'cash' ?'border-primary bg-primary/10 text-primary' :'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                <Icon name="Banknote" size={16} className="mx-auto mb-1" />
                نقداً
              </button>
              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  paymentMethod === 'transfer' ?'border-primary bg-primary/10 text-primary' :'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                <Icon name="CreditCard" size={16} className="mx-auto mb-1" />
                تحويل
              </button>
            </div>
          </div>

          {/* Notes */}
          <Input
            label="ملاحظات (اختياري)"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e?.target?.value)}
            placeholder="أضف ملاحظات حول عملية الدفع..."
            description="يمكنك إضافة تفاصيل إضافية حول عملية الدفع"
          />

          {/* Warning */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <div className="flex items-start space-x-2 rtl:space-x-reverse">
              <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-warning mb-1">تنبيه مهم</div>
                <div className="text-muted-foreground">
                  بعد تأكيد الدفع، لن يمكن التراجع عن هذه العملية. 
                  تأكد من صحة المبالغ قبل المتابعة.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            إلغاء
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            loading={isProcessing}
            iconName="Check"
            iconPosition="right"
          >
            تأكيد الدفع
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmationDialog;