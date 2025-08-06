import React, { useState } from 'react';
// Importing icons from lucide-react, assuming it's available in the environment.
// If not, a simpler Icon component can be used.
import { Plus, Minus, Crown, User, Trash2, X, AlertCircle, Loader2, Save, Receipt, Edit2 } from 'lucide-react';

// Mock AppIcon component for demonstration purposes
// In a real application, this would be a shared component.
const Icon = ({ name, size = 24, className = '' }) => {
  const LucideIcon = {
    Plus: Plus,
    Minus: Minus,
    Crown: Crown,
    User: User,
    Trash2: Trash2,
    X: X,
    AlertCircle: AlertCircle,
    Loader2: Loader2,
    Save: Save,
    Receipt: Receipt,
    Edit2: Edit2,
  }[name];

  if (!LucideIcon) {
    return <div className={`w-${size / 4} h-${size / 4} bg-gray-300 rounded-full ${className}`}></div>; // Fallback for unknown icons
  }

  return <LucideIcon size={size} className={className} />;
};

// Mock Button component for demonstration purposes
// In a real application, this would be a shared UI component.
const Button = ({ children, variant = 'default', size = 'md', onClick, iconName, iconPosition = 'left', disabled, type = 'button', className = '' }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2 text-base',
    lg: 'h-12 px-6 text-lg',
    icon: 'h-10 w-10',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className} ${iconPosition === 'right' ? 'flex-row-reverse' : ''}`}
    >
      {iconName && <Icon name={iconName} size={size === 'sm' ? 16 : 20} className={children ? (iconPosition === 'right' ? 'mr-2' : 'ml-2 rtl:mr-2') : ''} />}
      {children}
    </button>
  );
};

// Mock Input component for demonstration purposes
// In a real application, this would be a shared UI component.
const Input = ({ label, type = 'text', placeholder, value, onChange, error, min, step, required, disabled }) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        step={step}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};


const CrewMemberDetail = ({ member, onClose, onUpdateMember, onDeleteMember, crewService }) => {
  const [editingDebt, setEditingDebt] = useState(null);
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [debtForm, setDebtForm] = useState({
    amount: '',
    description: '',
    date: new Date()?.toISOString()?.split('T')?.[0],
    type: 'add'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [debtHistory, setDebtHistory] = useState(member?.debtHistory || []);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Formats currency with English digits and SAR currency symbol
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { // Changed locale to 'en-US' for English digits
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    })?.format(amount);
  };

  const refreshMemberData = async () => {
    try {
      setLoading(true);
      // Mocking crewService calls as they are external dependencies
      const updatedMember = await crewService?.getById(member?.id);
      const updatedDebtHistory = await crewService?.getDebtHistory(member?.id);
      
      const memberWithHistory = {
        ...updatedMember,
        debtHistory: updatedDebtHistory
      };
      
      onUpdateMember(member?.id, memberWithHistory);
      setDebtHistory(updatedDebtHistory);
    } catch (err) {
      console.error('Error refreshing member data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDebt = async (e) => {
    e?.preventDefault();
    
    const newErrors = {};
    if (!debtForm?.amount || parseFloat(debtForm?.amount) <= 0) {
      newErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    }
    if (!debtForm?.description?.trim()) {
      newErrors.description = 'وصف الدين مطلوب';
    }

    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      // Mocking crewService call
      await crewService?.addDebt(member?.id, {
        amount: parseFloat(debtForm?.amount),
        description: debtForm?.description?.trim(),
        type: debtForm?.type,
        date: debtForm?.date
      });

      await refreshMemberData();
      
      setIsAddingDebt(false);
      setDebtForm({
        amount: '',
        description: '',
        date: new Date()?.toISOString()?.split('T')?.[0],
        type: 'add'
      });
      setErrors({});
    } catch (err) {
      setErrors({ general: err?.message || 'حدث خطأ أثناء إضافة الدين' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditDebt = (debtId) => {
    const debt = debtHistory?.find(d => d?.id === debtId);
    if (debt) {
      setDebtForm({
        amount: debt?.amount?.toString(),
        description: debt?.description,
        date: debt?.date,
        type: debt?.type
      });
      setEditingDebt(debtId);
    }
  };

  const handleUpdateDebt = async (e) => {
    e?.preventDefault();
    
    const newErrors = {};
    if (!debtForm?.amount || parseFloat(debtForm?.amount) <= 0) {
      newErrors.amount = 'المبلغ يجب أن يكون أكبر من صفر';
    }
    if (!debtForm?.description?.trim()) {
      newErrors.description = 'وصف الدين مطلوب';
    }

    if (Object.keys(newErrors)?.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      // Mocking crewService call
      await crewService?.updateDebt(editingDebt, {
        amount: parseFloat(debtForm?.amount),
        description: debtForm?.description?.trim(),
        type: debtForm?.type,
        date: debtForm?.date
      });

      await refreshMemberData();
      
      setEditingDebt(null);
      setDebtForm({
        amount: '',
        description: '',
        date: new Date()?.toISOString()?.split('T')?.[0],
        type: 'add'
      });
      setErrors({});
    } catch (err) {
      setErrors({ general: err?.message || 'حدث خطأ أثناء تحديث الدين' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDebt = (debtId) => {
    setConfirmMessage('هل أنت متأكد من حذف هذا الدين؟');
    setConfirmAction(() => async () => {
      try {
        setLoading(true);
        // Mocking crewService call
        await crewService?.deleteDebt(debtId);
        await refreshMemberData();
      } catch (err) {
        setErrors({ general: err?.message || 'حدث خطأ أثناء حذف الدين' });
      } finally {
        setLoading(false);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleDeleteMember = () => {
    setConfirmMessage(`هل أنت متأكد من حذف العضو "${member?.name}" نهائياً؟ سيتم حذف جميع بيانات الديون المرتبطة به.`);
    setConfirmAction(() => () => {
      onDeleteMember(member?.id);
      onClose();
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  const cancelEdit = () => {
    setEditingDebt(null);
    setIsAddingDebt(false);
    setDebtForm({
      amount: '',
      description: '',
      date: new Date()?.toISOString()?.split('T')?.[0],
      type: 'add'
    });
    setErrors({});
  };

  const ConfirmModal = () => {
    if (!showConfirmModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-card border border-border rounded-lg w-full max-w-sm elevation-3 animate-slide-in p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">تأكيد الإجراء</h3>
          <p className="text-muted-foreground mb-6">{confirmMessage}</p>
          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={confirmAction}
              disabled={loading}
            >
              تأكيد
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden elevation-3 animate-slide-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              member?.role === 'captain' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
            }`}>
              <Icon name={member?.role === 'captain' ? 'Crown' : 'User'} size={24} />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground">{member?.name}</h2>
              <p className="text-sm text-muted-foreground">
                {member?.role === 'captain' ? 'قبطان' : 'بحار'} • انضم في {new Date(member?.joinDate)?.toLocaleDateString('en-US')}
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

        {/* Member Stats */}
        <div className="p-6 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <h3 className="text-sm text-muted-foreground mb-1">إجمالي الدين</h3>
              <p className={`text-2xl font-bold ${member?.debt > 0 ? 'text-destructive' : 'text-success'}`}>
                {formatCurrency(member?.debt)}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <h3 className="text-sm text-muted-foreground mb-1">حصة الربح</h3>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(member?.profitShare)}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <h3 className="text-sm text-muted-foreground mb-1">الحصة النهائية</h3>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(member?.finalShare)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error Display */}
          {errors?.general && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Icon name="AlertCircle" size={20} className="text-destructive" />
                <p className="text-destructive font-medium">{errors?.general}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setErrors({})}>
                  <Icon name="X" size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Add New Debt Button */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-foreground">تاريخ الديون</h3>
            <Button
              variant="default"
              onClick={() => setIsAddingDebt(true)}
              iconName="Plus"
              iconPosition="right"
              disabled={isAddingDebt || editingDebt || loading}
            >
              إضافة دين جديد
            </Button>
          </div>

          {/* Add/Edit Debt Form */}
          {(isAddingDebt || editingDebt) && (
            <div className="bg-muted/20 border border-border rounded-lg p-4 mb-6">
              <h4 className="text-md font-medium text-foreground mb-4">
                {editingDebt ? 'تعديل الدين' : 'إضافة دين جديد'}
              </h4>
              <form onSubmit={editingDebt ? handleUpdateDebt : handleAddDebt} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="المبلغ *"
                    type="number"
                    placeholder="0.00"
                    value={debtForm?.amount}
                    onChange={(e) => setDebtForm({ ...debtForm, amount: e?.target?.value })}
                    error={errors?.amount}
                    min="0"
                    step="0.01"
                    required
                    disabled={loading}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">نوع العملية *</label>
                    <div className="flex space-x-4 rtl:space-x-reverse">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="debtType"
                          value="add"
                          checked={debtForm?.type === 'add'}
                          onChange={(e) => setDebtForm({ ...debtForm, type: e?.target?.value })}
                          className="ml-2 rtl:mr-2"
                          disabled={loading}
                        />
                        <span className="text-sm text-destructive">إضافة دين</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="debtType"
                          value="subtract"
                          checked={debtForm?.type === 'subtract'}
                          onChange={(e) => setDebtForm({ ...debtForm, type: e?.target?.value })}
                          className="ml-2 rtl:mr-2"
                          disabled={loading}
                        />
                        <span className="text-sm text-success">سداد دين</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">الوصف *</label>
                    <textarea
                      placeholder="أدخل وصف الدين..."
                      value={debtForm?.description}
                      onChange={(e) => setDebtForm({ ...debtForm, description: e?.target?.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                      rows="3"
                      required
                      disabled={loading}
                    />
                    {errors?.description && (
                      <p className="text-sm text-destructive">{errors?.description}</p>
                    )}
                  </div>
                  <Input
                    label="التاريخ *"
                    type="date"
                    value={debtForm?.date}
                    onChange={(e) => setDebtForm({ ...debtForm, date: e?.target?.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="flex space-x-3 rtl:space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                    disabled={loading}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    iconName={loading ? "Loader2" : "Save"}
                    iconPosition="right"
                    disabled={loading}
                    className={loading ? "animate-spin" : ""}
                  >
                    {loading ? 'جاري الحفظ...' : (editingDebt ? 'تحديث' : 'إضافة')}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Debt History */}
          <div className="space-y-3">
            {loading && debtHistory?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="Loader2" size={32} className="text-muted-foreground animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">جاري تحميل تاريخ الديون...</h3>
              </div>
            ) : debtHistory?.length > 0 ? (
              debtHistory?.sort((a, b) => new Date(b?.date) - new Date(a?.date))?.map((debt) => (
                  <div key={debt?.id} className="bg-card border border-border rounded-lg p-4 hover:elevation-1 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            debt?.type === 'add' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                          }`}>
                            <Icon name={debt?.type === 'add' ? 'Plus' : 'Minus'} size={16} />
                          </div>
                          <div>
                            <p className={`text-lg font-semibold ${
                              debt?.type === 'add' ? 'text-destructive' : 'text-success'
                            }`}>
                              {formatCurrency(debt?.amount)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(debt?.date)?.toLocaleDateString('en-US')} {/* Changed locale to 'en-US' */}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-foreground">{debt?.description}</p>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditDebt(debt?.id)}
                          className="h-8 w-8"
                          disabled={isAddingDebt || editingDebt || loading}
                        >
                          <Icon name="Edit2" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDebt(debt?.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={isAddingDebt || editingDebt || loading}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Receipt" size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">لا توجد ديون مسجلة</h3>
                <p className="text-muted-foreground mb-4">ابدأ بإضافة أول دين لهذا العضو</p>
                <Button
                  variant="default"
                  onClick={() => setIsAddingDebt(true)}
                  iconName="Plus"
                  iconPosition="right"
                  disabled={isAddingDebt || editingDebt || loading}
                >
                  إضافة دين جديد
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Delete Member Button */}
        <div className="p-6 border-t border-border bg-muted/20 flex justify-center">
          <Button
            variant="destructive"
            size="md" // Changed size to 'md' for a slightly larger button
            onClick={handleDeleteMember}
            iconName="Trash2"
            iconPosition="right"
            disabled={loading}
            className="w-full md:w-auto" // Make it full width on small screens, auto on larger
          >
            حذف العضو نهائياً
          </Button>
        </div>
      </div>
      <ConfirmModal />
    </div>
  );
};

export default CrewMemberDetail;
