import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const AddCrewMemberModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'crew',
    initialDebt: 0,
    debtDescription: '',
    joinDate: new Date()?.toISOString()?.split('T')?.[0]
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData?.name?.trim()) {
      newErrors.name = 'اسم العضو مطلوب';
    }
    if (formData?.initialDebt < 0) {
      newErrors.initialDebt = 'مبلغ الدين لا يمكن أن يكون سالباً';
    }

    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create new crew member
    const newMember = {
      id: Date.now()?.toString(),
      name: formData?.name?.trim(),
      role: formData?.role,
      debt: parseFloat(formData?.initialDebt) || 0,
      debtDescription: formData?.debtDescription?.trim(),
      joinDate: formData?.joinDate,
      profitShare: 0,
      finalShare: 0,
      lastDebtUpdate: new Date()?.toISOString()
    };

    onAdd(newMember);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      role: 'crew',
      initialDebt: 0,
      debtDescription: '',
      joinDate: new Date()?.toISOString()?.split('T')?.[0]
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-lg w-full max-w-md elevation-3 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-heading font-semibold text-foreground flex items-center space-x-2 rtl:space-x-reverse">
            <Icon name="UserPlus" size={24} />
            <span>إضافة عضو جديد</span>
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Input */}
          <Input
            label="اسم العضو"
            type="text"
            placeholder="أدخل اسم عضو الطاقم"
            value={formData?.name}
            onChange={(e) => setFormData({ ...formData, name: e?.target?.value })}
            error={errors?.name}
            required
          />

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">المنصب</label>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="crew"
                  checked={formData?.role === 'crew'}
                  onChange={(e) => setFormData({ ...formData, role: e?.target?.value })}
                  className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                />
                <span className="text-sm text-foreground">بحار</span>
              </label>
              <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="captain"
                  checked={formData?.role === 'captain'}
                  onChange={(e) => setFormData({ ...formData, role: e?.target?.value })}
                  className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                />
                <span className="text-sm text-foreground">قبطان</span>
              </label>
            </div>
          </div>

          {/* Join Date */}
          <Input
            label="تاريخ الانضمام"
            type="date"
            value={formData?.joinDate}
            onChange={(e) => setFormData({ ...formData, joinDate: e?.target?.value })}
            required
          />

          {/* Initial Debt */}
          <Input
            label="الدين الأولي (اختياري)"
            type="number"
            placeholder="0.00"
            value={formData?.initialDebt}
            onChange={(e) => setFormData({ ...formData, initialDebt: e?.target?.value })}
            error={errors?.initialDebt}
            min="0"
            step="0.01"
            description="أدخل مبلغ الدين الأولي بالريال السعودي"
          />

          {/* Debt Description */}
          {parseFloat(formData?.initialDebt) > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">وصف الدين</label>
              <textarea
                placeholder="أدخل وصف أو سبب الدين..."
                value={formData?.debtDescription}
                onChange={(e) => setFormData({ ...formData, debtDescription: e?.target?.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                rows="3"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 rtl:space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="default"
              iconName="Plus"
              iconPosition="right"
              className="flex-1"
            >
              إضافة العضو
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCrewMemberModal;