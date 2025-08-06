import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const DebtUpdateModal = ({ isOpen, onClose, member, onUpdate }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      updateType: 'add',
      debtAmount: 0,
      debtDescription: '',
      updateDate: new Date()?.toISOString()?.split('T')?.[0]
    }
  });

  const updateType = watch('updateType');
  const amount = parseFloat(watch('debtAmount') || 0);

  // Reset form when member changes
  useEffect(() => {
    if (member) {
      reset({
        updateType: 'add',
        debtAmount: 0,
        debtDescription: '',
        updateDate: new Date()?.toISOString()?.split('T')?.[0]
      });
    }
  }, [member, reset]);

  const calculateNewAmount = () => {
    let currentDebt = member?.debt ?? 0;
    if (updateType === 'add') return currentDebt + amount;
    if (updateType === 'subtract') return Math.max(0, currentDebt - amount);
    return amount;
  };

  const onSubmit = (data) => {
    const newDebt = calculateNewAmount();

    const debtUpdate = {
      id: Date.now()?.toString(),
      memberId: member?.id,
      previousAmount: member?.debt,
      newAmount: newDebt,
      updateAmount: amount,
      updateType: data?.updateType,
      description: data?.debtDescription?.trim(),
      updateDate: data?.updateDate,
      timestamp: new Date()?.toISOString()
    };

    onUpdate(member?.id, newDebt, debtUpdate);
    handleClose();
  };

  const handleClose = () => {
    reset({
      updateType: 'add',
      debtAmount: 0,
      debtDescription: '',
      updateDate: new Date()?.toISOString()?.split('T')?.[0]
    });
    onClose();
  };

  if (!isOpen || !member) return null;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    })?.format(amount);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-lg w-full max-w-md elevation-3 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-heading font-semibold text-foreground flex items-center space-x-2 rtl:space-x-reverse">
            <Icon name="Edit3" size={24} />
            <span>تحديث دين العضو</span>
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Update Type Radio Group */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">نوع التحديث</label>
            <Controller
              name="updateType"
              control={control}
              render={({ field }) => (
                <div className="flex space-x-6 rtl:space-x-reverse">
                  <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                    <input
                      type="radio"
                      value="add"
                      checked={field?.value === 'add'}
                      onChange={() => field?.onChange('add')}
                      className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-foreground">إضافة دين</span>
                  </label>
                  <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                    <input
                      type="radio"
                      value="subtract"
                      checked={field?.value === 'subtract'}
                      onChange={() => field?.onChange('subtract')}
                      className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-foreground">خصم دين</span>
                  </label>
                  <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                    <input
                      type="radio"
                      value="set"
                      checked={field?.value === 'set'}
                      onChange={() => field?.onChange('set')}
                      className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-foreground">تعيين دين</span>
                  </label>
                </div>
              )}
            />
          </div>

          {/* Amount Input */}
          <Controller
            name="debtAmount"
            control={control}
            rules={{
              required: 'المبلغ مطلوب',
              validate: (v) => parseFloat(v) > 0 || 'المبلغ يجب أن يكون أكبر من صفر'
            }}
            render={({ field }) => (
              <Input
                {...field}
                label="المبلغ"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                error={errors?.debtAmount?.message}
                required
              />
            )}
          />

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              وصف التحديث <span className="text-destructive">*</span>
            </label>
            <Controller
              name="debtDescription"
              control={control}
              rules={{ required: 'وصف التحديث مطلوب' }}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="أدخل وصف أو سبب تحديث الدين..."
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  rows="3"
                />
              )}
            />
            {errors?.debtDescription && (
              <p className="text-sm text-destructive">{errors?.debtDescription?.message}</p>
            )}
          </div>

          {/* Update Date */}
          <Controller
            name="updateDate"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="تاريخ التحديث"
                type="date"
                required
              />
            )}
          />

          {/* Preview Section */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
            <h3 className="text-sm font-medium text-foreground mb-2">معاينة التحديث</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الدين الحالي:</span>
                <span className="font-medium">{formatCurrency(member?.debt || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {updateType === 'add' && 'إضافة:'}
                  {updateType === 'subtract' && 'خصم:'}
                  {updateType === 'set' && 'تحديد إلى:'}
                </span>
                <span className={`font-medium ${updateType === 'add' ? 'text-destructive' : updateType === 'subtract' ? 'text-success' : 'text-foreground'}`}>
                  {formatCurrency(amount)}
                </span>
              </div>
              <hr className="my-2 border-border" />
              <div className="flex justify-between">
                <span className="text-foreground font-medium">الدين الجديد:</span>
                <span className="font-semibold text-lg">{formatCurrency(calculateNewAmount())}</span>
              </div>
            </div>
          </div>

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
              iconName="Save"
              iconPosition="right"
              className="flex-1"
            >
              تحديث الدين
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebtUpdateModal;