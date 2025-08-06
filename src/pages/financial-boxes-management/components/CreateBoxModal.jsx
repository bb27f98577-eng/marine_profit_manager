import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CreateBoxModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    crewCount: '',
    description: '',
    status: 'draft'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'draft', label: 'مسودة' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' }
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'اسم الصندوق مطلوب';
    } else if (formData?.name?.trim()?.length < 3) {
      newErrors.name = 'اسم الصندوق يجب أن يكون 3 أحرف على الأقل';
    }

    if (!formData?.crewCount || formData?.crewCount?.toString()?.trim() === '') {
      newErrors.crewCount = 'عدد الطاقم مطلوب';
    } else if (isNaN(formData?.crewCount) || parseInt(formData?.crewCount) < 0) {
      newErrors.crewCount = 'عدد الطاقم يجب أن يكون رقم صحيح أكبر من أو يساوي صفر';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Convert any Arabic numerals in numeric fields to English
      const processedFormData = {
        ...formData,
        crewCount: parseInt(formData?.crewCount) || 0
      };

      await onSubmit?.(processedFormData);
      
      // Reset form on success
      setFormData({
        name: '',
        crewCount: '',
        description: '',
        status: 'draft'
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating box:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      crewCount: '',
      description: '',
      status: 'draft'
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-lg w-full max-w-md elevation-3 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-heading font-semibold text-foreground">
            إنشاء صندوق جديد
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isSubmitting}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="اسم الصندوق"
            type="text"
            placeholder="أدخل اسم الصندوق"
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            error={errors?.name}
            required
            disabled={isSubmitting}
          />

          <Input
            label="عدد الطاقم"
            type="number"
            placeholder="أدخل عدد الطاقم"
            value={formData?.crewCount}
            onChange={(e) => handleInputChange('crewCount', e?.target?.value)}
            error={errors?.crewCount}
            required
            disabled={isSubmitting}
            min="0"
          />

          <Input
            label="الوصف (اختياري)"
            type="text"
            placeholder="أدخل وصف الصندوق"
            value={formData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            disabled={isSubmitting}
          />

          <Select
            label="حالة الصندوق"
            options={statusOptions}
            value={formData?.status}
            onChange={(value) => handleInputChange('status', value)}
            disabled={isSubmitting}
          />

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}>
              إلغاء
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              iconName="Plus"
              iconPosition="right">
              إنشاء الصندوق
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoxModal;