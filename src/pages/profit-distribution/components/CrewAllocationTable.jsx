import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const CrewAllocationTable = ({
  crewMembers,
  calculationResults,
  onDebtDeduction,
  onPaymentConfirm,
  onBatchPayment,
  crewCountMismatch = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [debtAdjustments, setDebtAdjustments] = useState({});

  const handleMemberSelect = (memberId, checked) => {
    if (checked) {
      setSelectedMembers([...selectedMembers, memberId]);
    } else {
      setSelectedMembers(selectedMembers?.filter((id) => id !== memberId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedMembers(crewMembers?.map((member) => member?.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleDebtAdjustment = (memberId, amount) => {
    setDebtAdjustments({
      ...debtAdjustments,
      [memberId]: parseFloat(amount) || 0
    });
  };

  const validateDebtDeduction = (member) => {
    const additionalDeduction = debtAdjustments?.[member?.id] || 0;
    const currentDebt = member?.currentDebt || 0;
    const baseShare = member?.role === 'captain' ?
      calculationResults?.captainShare :
      calculationResults?.individualShare;

    // Check if additional deduction is more than 1
    if (additionalDeduction <= 1) {
      return {
        isValid: false,
        message: 'يجب أن يكون الخصم الإضافي أكثر من 1 ريال'
      };
    }

    // Check if current debts are less than basic share
    if (currentDebt >= baseShare) {
      return {
        isValid: false,
        message: 'الديون الحالية يجب أن تكون أقل من الحصة الأساسية'
      };
    }

    return { isValid: true };
  };

  const handleDebtDeductionClick = (member) => {
    const validation = validateDebtDeduction(member);
    
    if (!validation?.isValid) {
      // Show error message - you could use a toast or alert here
      alert(validation?.message);
      return;
    }

    onDebtDeduction(member?.id);
  };

  const calculateFinalPayout = (member) => {
    if (!calculationResults) return 0;

    const baseShare = member?.role === 'captain' ?
    calculationResults?.captainShare :
    calculationResults?.individualShare;

    const debtDeduction = debtAdjustments?.[member?.id] || member?.currentDebt || 0;
    return Math.max(0, baseShare - debtDeduction);
  };

  const getTotalSelectedAmount = () => {
    return selectedMembers?.reduce((total, memberId) => {
      const member = crewMembers?.find((m) => m?.id === memberId);
      return total + calculateFinalPayout(member);
    }, 0);
  };

  if (!calculationResults) {
    return (
      <div className="bg-card border border-border rounded-lg elevation-1 p-8">
        <div className="text-center">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
            جدول توزيع الأرباح غير متاح
          </h3>
          <p className="text-muted-foreground">
            يرجى حساب التوزيع أولاً لعرض تفاصيل الطاقم
          </p>
        </div>
      </div>
    );
  }

  if (crewCountMismatch) {
    return (
      <div className="bg-card border border-destructive/20 rounded-lg elevation-1 p-8">
        <div className="text-center">
          <Icon name="AlertTriangle" size={48} className="text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-heading font-semibold text-destructive mb-2">
            عدم تطابق في عدد الطاقم
          </h3>
          <p className="text-muted-foreground mb-4">
            عدد أفراد الطاقم الحالي لا يتطابق مع إعدادات الصندوق المالي
          </p>
          <div className="bg-muted/30 rounded-lg p-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-foreground">العدد الفعلي:</span>
                <span className="mr-2 text-primary">{crewMembers?.length}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">العدد المطلوب:</span>
                <span className="mr-2 text-destructive">حسب إعدادات الصندوق</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg elevation-1">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
            <Icon name="Users" size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              جدول توزيع الأرباح على الطاقم
            </h3>
            <p className="text-sm text-muted-foreground">
              تفاصيل الحصص والخصومات لكل فرد من إدارة الطاقم
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-sm font-medium text-primary">
            {selectedMembers?.length} محدد
          </span>
          <Icon
            name={isExpanded ? "ChevronUp" : "ChevronDown"}
            size={20}
            className="text-muted-foreground"
          />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border">
          {/* Batch Actions */}
          <div className="p-4 bg-muted/30 border-b border-border">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <Checkbox
                  label="تحديد الكل"
                  checked={selectedMembers?.length === crewMembers?.length}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedMembers?.length} من {crewMembers?.length} محدد
                </span>
              </div>
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="text-sm font-medium text-foreground">
                  إجمالي المحدد: {getTotalSelectedAmount()?.toLocaleString('ar-SA')} ريال
                </span>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onBatchPayment(selectedMembers)}
                  disabled={selectedMembers?.length === 0}
                  iconName="CreditCard"
                  iconPosition="right"
                >
                  دفع مجمع
                </Button>
              </div>
            </div>
          </div>

          {/* Crew Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right p-3 text-sm font-medium text-foreground">تحديد</th>
                  <th className="text-right p-3 text-sm font-medium text-foreground">اسم الطاقم</th>
                  <th className="text-right p-3 text-sm font-medium text-foreground">المنصب</th>
                  <th className="text-right p-3 text-sm font-medium text-foreground">الحصة الأساسية</th>
                  <th className="text-right p-3 text-sm font-medium text-foreground">الديون الحالية</th>
                  <th className="text-right p-3 text-sm font-medium text-foreground">خصم إضافي</th>
                  <th className="text-right p-3 text-sm font-medium text-foreground">المبلغ النهائي</th>
                  <th className="text-right p-3 text-sm font-medium text-foreground">الحالة</th>
                  <th className="text-right p-3 text-sm font-medium text-foreground">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {crewMembers?.map((member, index) => {
                  const baseShare = member?.role === 'captain' ?
                    calculationResults?.captainShare :
                    calculationResults?.individualShare;
                  const finalPayout = calculateFinalPayout(member);
                  const isSelected = selectedMembers?.includes(member?.id);

                  return (
                    <tr
                      key={member?.id}
                      className={`border-b border-border hover:bg-muted/30 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleMemberSelect(member?.id, e?.target?.checked)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Icon
                              name={member?.role === 'captain' ? 'Crown' : 'User'}
                              size={16}
                              className="text-primary"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{member?.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {member?.phone && `هاتف: ${member?.phone}`}
                              {member?.email && ` • إيميل: ${member?.email}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          member?.role === 'captain' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                        }`}>
                          {member?.role === 'captain' ? 'كابتن' : 'طاقم'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-foreground">
                          {baseShare?.toLocaleString('ar-SA')} ريال
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-medium ${
                          member?.currentDebt > 0 ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          {member?.currentDebt?.toLocaleString('ar-SA')} ريال
                        </span>
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={debtAdjustments?.[member?.id] || ''}
                          onChange={(e) => handleDebtAdjustment(member?.id, e?.target?.value)}
                          placeholder="0"
                          className="w-24"
                          min="0"
                        />
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${
                          finalPayout > 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {finalPayout?.toLocaleString('ar-SA')} ريال
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          member?.paymentStatus === 'paid' ? 'bg-success/10 text-success' :
                          member?.paymentStatus === 'pending' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                        }`}>
                          {member?.paymentStatus === 'paid' ? 'مدفوع' :
                           member?.paymentStatus === 'pending' ? 'معلق' : 'غير مدفوع'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPaymentConfirm(member?.id)}
                            disabled={member?.paymentStatus === 'paid'}
                            iconName="Check"
                          >
                            تأكيد
                          </Button>
                          {member?.currentDebt > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDebtDeductionClick(member)}
                              iconName="Minus"
                            >
                              خصم
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="p-4 bg-muted/30 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {crewMembers?.length}
                </div>
                <div className="text-sm text-muted-foreground">إجمالي الطاقم</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {calculationResults?.totalCrewShare?.toLocaleString('ar-SA')}
                </div>
                <div className="text-sm text-muted-foreground">إجمالي الحصص (ريال)</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {crewMembers?.reduce((total, member) => total + (member?.currentDebt || 0), 0)?.toLocaleString('ar-SA')}
                </div>
                <div className="text-sm text-muted-foreground">إجمالي الديون (ريال)</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {crewMembers?.reduce((total, member) => total + calculateFinalPayout(member), 0)?.toLocaleString('ar-SA')}
                </div>
                <div className="text-sm text-muted-foreground">صافي المدفوعات (ريال)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewAllocationTable;