import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, boxName }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onConfirm();
      onClose();
    } catch (error) {
      console.error('Error deleting box:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-lg w-full max-w-md elevation-3 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
              <Icon name="AlertTriangle" size={20} className="text-error" />
            </div>
            <h2 className="text-xl font-heading font-semibold text-foreground">
              تأكيد الحذف
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isDeleting}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-foreground mb-4">
            هل أنت متأكد من حذف الصندوق المالي "{boxName}"؟
          </p>
          
          <div className="bg-error/5 border border-error/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <Icon name="AlertCircle" size={16} className="text-error mt-0.5" />
              <div className="text-sm text-error">
                <p className="font-medium mb-1">تحذير:</p>
                <ul className="space-y-1 text-xs">
                  <li>• سيتم حذف جميع الفواتير المرتبطة بهذا الصندوق</li>
                  <li>• لا يمكن التراجع عن هذا الإجراء</li>
                  <li>• ستفقد جميع البيانات المالية المرتبطة</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              loading={isDeleting}
              iconName="Trash2"
              iconPosition="right"
            >
              حذف الصندوق
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;