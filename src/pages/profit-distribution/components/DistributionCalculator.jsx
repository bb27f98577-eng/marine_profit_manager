import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const DistributionCalculator = ({ 
  totalAmount, 
  crewMembers, 
  calculationResults,
  onRecalculate 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [customCrewCount, setCustomCrewCount] = useState(crewMembers?.length);

  const handleCrewCountChange = (e) => {
    const count = parseInt(e?.target?.value) || 0;
    setCustomCrewCount(count);
    onRecalculate(count);
  };

  if (!calculationResults) {
    return (
      <div className="bg-card border border-border rounded-lg elevation-1 p-8">
        <div className="text-center">
          <Icon name="Calculator" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
            لم يتم حساب التوزيع بعد
          </h3>
          <p className="text-muted-foreground">
            اختر الصندوق المالي واضغط على "حساب التوزيع" لبدء العملية
          </p>
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
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Icon name="Calculator" size={20} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              حساب توزيع الأرباح
            </h3>
            <p className="text-sm text-muted-foreground">
              التوزيع الآلي حسب النظام البحري
            </p>
          </div>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-muted-foreground" 
        />
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            {/* Owner Share */}
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                <Icon name="Crown" size={20} className="text-primary" />
                <h4 className="font-semibold text-foreground">نصيب مالك القارب</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">النسبة الأساسية:</span>
                  <span className="font-medium">50%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">خصم نصف حصة الكابتن:</span>
                  <span className="font-medium text-destructive">
                    -{calculationResults?.captainExtraShare?.toLocaleString('ar-SA')} ريال
                  </span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">النصيب النهائي:</span>
                    <span className="font-bold text-primary">
                      {calculationResults?.ownerShare?.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Crew Share */}
            <div className="bg-secondary/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                <Icon name="Users" size={20} className="text-secondary" />
                <h4 className="font-semibold text-foreground">نصيب الطاقم</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">النسبة الأساسية:</span>
                  <span className="font-medium">50%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">عدد أفراد الطاقم:</span>
                  <span className="font-medium">{calculationResults?.crewCount} فرد</span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">إجمالي نصيب الطاقم:</span>
                    <span className="font-bold text-secondary">
                      {calculationResults?.totalCrewShare?.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Share */}
            <div className="bg-accent/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                <Icon name="User" size={20} className="text-accent" />
                <h4 className="font-semibold text-foreground">الحصة الفردية</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">حصة الفرد العادي:</span>
                  <span className="font-medium">
                    {calculationResults?.individualShare?.toLocaleString('ar-SA')} ريال
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">حصة الكابتن:</span>
                  <span className="font-medium">
                    {calculationResults?.captainShare?.toLocaleString('ar-SA')} ريال
                  </span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="text-xs text-muted-foreground">
                    * الكابتن يحصل على حصة إضافية نصف حصة
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Crew Count Adjustment */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-foreground">تعديل عدد أفراد الطاقم</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRecalculate(customCrewCount)}
                iconName="RefreshCw"
                iconPosition="right"
              >
                إعادة حساب
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="عدد أفراد الطاقم"
                type="number"
                value={customCrewCount}
                onChange={handleCrewCountChange}
                min="1"
                max="50"
                description="يشمل الكابتن وجميع أفراد الطاقم"
              />
              <div className="bg-card rounded-lg p-3">
                <div className="text-sm text-muted-foreground mb-1">تأثير التغيير:</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>الحصة الفردية الجديدة:</span>
                    <span className="font-medium">
                      {(calculationResults?.totalCrewShare / customCrewCount)?.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>حصة الكابتن الجديدة:</span>
                    <span className="font-medium">
                      {((calculationResults?.totalCrewShare / customCrewCount) * 1.5)?.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributionCalculator;