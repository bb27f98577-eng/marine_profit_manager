import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DistributionSummary = ({ 
  calculationResults, 
  selectedBox, 
  crewMembers,
  onExportReport,
  onResetCalculation,
  onConfirmFinalPayment
}) => {
  if (!calculationResults) {
    return null;
  }

  const totalDistributed = calculationResults?.ownerShare + calculationResults?.totalCrewShare;
  const paidMembers = crewMembers?.filter(member => member?.paymentStatus === 'paid')?.length;
  const pendingMembers = crewMembers?.filter(member => member?.paymentStatus === 'pending')?.length;
  const unpaidMembers = crewMembers?.filter(member => member?.paymentStatus === 'unpaid')?.length;
  
  // Check if all crew members have been paid
  const allCrewPaid = crewMembers?.length > 0 && crewMembers?.every(member => member?.paymentStatus === 'paid');

  const summaryCards = [
    {
      title: 'إجمالي المبلغ الموزع',
      value: totalDistributed?.toLocaleString('ar-SA'),
      unit: 'ريال',
      icon: 'TrendingUp',
      color: 'primary',
      description: 'المبلغ الكامل المحسوب للتوزيع'
    },
    {
      title: 'نصيب مالك القارب',
      value: calculationResults?.ownerShare?.toLocaleString('ar-SA'),
      unit: 'ريال',
      icon: 'Crown',
      color: 'secondary',
      description: `${((calculationResults?.ownerShare / totalDistributed) * 100)?.toFixed(1)}% من الإجمالي`
    },
    {
      title: 'إجمالي نصيب الطاقم',
      value: calculationResults?.totalCrewShare?.toLocaleString('ar-SA'),
      unit: 'ريال',
      icon: 'Users',
      color: 'accent',
      description: `موزع على ${calculationResults?.crewCount} فرد`
    },
    {
      title: 'المدفوعات المكتملة',
      value: paidMembers,
      unit: 'فرد',
      icon: 'CheckCircle',
      color: 'success',
      description: `${pendingMembers} معلق، ${unpaidMembers} غير مدفوع`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards?.map((card, index) => (
          <div key={index} className="bg-card border border-border rounded-lg elevation-1 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 bg-${card?.color}/10 rounded-lg flex items-center justify-center`}>
                <Icon name={card?.icon} size={20} className={`text-${card?.color}`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  {card?.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {card?.unit}
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground text-sm mb-1">
                {card?.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {card?.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Final Payment Confirmation */}
      {allCrewPaid && (
        <div className="bg-success/5 border border-success/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Icon name="CheckCircle2" size={24} className="text-success" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-semibold text-success mb-1">
                  جاهز لتأكيد الدفع النهائي
                </h3>
                <p className="text-sm text-muted-foreground">
                  تم دفع جميع مستحقات الطاقم. يمكنك الآن خصم المبلغ الإجمالي من الصندوق وإكمال العملية.
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium">المبلغ المطلوب خصمه: </span>
                  <span className="text-success font-bold">{totalDistributed?.toLocaleString('ar-SA')} ريال</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="default"
              size="lg"
              onClick={() => onConfirmFinalPayment?.(totalDistributed)}
              iconName="CreditCard"
              iconPosition="right"
              className="bg-success hover:bg-success/90 text-white"
            >
              تأكيد الدفع
            </Button>
          </div>
        </div>
      )}

      {/* Distribution Breakdown */}
      <div className="bg-card border border-border rounded-lg elevation-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="PieChart" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">
                تفصيل التوزيع
              </h3>
              <p className="text-sm text-muted-foreground">
                نظرة شاملة على توزيع الأرباح
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetCalculation}
              iconName="RotateCcw"
              iconPosition="right"
            >
              إعادة تعيين
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onExportReport}
              iconName="Download"
              iconPosition="right"
            >
              تصدير التقرير
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Owner Breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center space-x-2 rtl:space-x-reverse">
              <Icon name="Crown" size={16} className="text-primary" />
              <span>تفصيل نصيب المالك</span>
            </h4>
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">النسبة الأساسية (50%)</span>
                <span className="font-medium text-foreground">
                  {(totalDistributed / 2)?.toLocaleString('ar-SA')} ريال
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">خصم نصف حصة الكابتن</span>
                <span className="font-medium text-destructive">
                  -{calculationResults?.captainExtraShare?.toLocaleString('ar-SA')} ريال
                </span>
              </div>
              
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">النصيب النهائي</span>
                  <span className="font-bold text-primary text-lg">
                    {calculationResults?.ownerShare?.toLocaleString('ar-SA')} ريال
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Crew Breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center space-x-2 rtl:space-x-reverse">
              <Icon name="Users" size={16} className="text-secondary" />
              <span>تفصيل نصيب الطاقم</span>
            </h4>
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">النسبة الأساسية (50%)</span>
                <span className="font-medium text-foreground">
                  {calculationResults?.totalCrewShare?.toLocaleString('ar-SA')} ريال
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">عدد أفراد الطاقم</span>
                <span className="font-medium text-foreground">
                  {calculationResults?.crewCount} فرد
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">الحصة الفردية</span>
                <span className="font-medium text-foreground">
                  {calculationResults?.individualShare?.toLocaleString('ar-SA')} ريال
                </span>
              </div>
              
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">حصة الكابتن</span>
                  <span className="font-bold text-secondary text-lg">
                    {calculationResults?.captainShare?.toLocaleString('ar-SA')} ريال
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  (حصة فردية + نصف حصة إضافية)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Overview */}
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-semibold text-foreground mb-4 flex items-center space-x-2 rtl:space-x-reverse">
            <Icon name="Activity" size={16} className="text-accent" />
            <span>حالة المدفوعات</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-success/5 border border-success/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-success mb-1">{paidMembers}</div>
              <div className="text-sm text-muted-foreground">مدفوع</div>
            </div>
            
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-warning mb-1">{pendingMembers}</div>
              <div className="text-sm text-muted-foreground">معلق</div>
            </div>
            
            <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-muted-foreground mb-1">{unpaidMembers}</div>
              <div className="text-sm text-muted-foreground">غير مدفوع</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionSummary;