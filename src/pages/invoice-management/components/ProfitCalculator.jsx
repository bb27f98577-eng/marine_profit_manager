import React from 'react';
import Icon from '../../../components/AppIcon';
import { formatCurrencyEnglish, formatNumberEnglish } from '../../../utils/localization';

const ProfitCalculator = ({ invoices, selectedBox, boxSettings }) => {
  const totalAmount = invoices?.reduce((sum, invoice) => sum + invoice?.amount, 0);
  
  // Get crew count from box settings
  const crewCount = boxSettings?.crewCount || 0;
  const captainName = boxSettings?.captainName || 'القبطان';
  
  // Calculate profit distribution - corrected logic
  const ownerShare = totalAmount * 0.5; // 50% to owner
  const crewTotalShare = totalAmount * 0.5; // 50% to crew
  
  // Captain gets 1.5 shares, deducted from owner's 50%
  // Total shares = (crewCount - 1) regular crew + 1.5 captain shares
  const regularCrewCount = crewCount > 0 ? crewCount - 1 : 0; // Excluding captain
  const totalShares = regularCrewCount + 1.5; // Captain gets 1.5 shares
  
  const shareValue = totalShares > 0 ? crewTotalShare / totalShares : 0;
  const regularCrewShare = shareValue;
  const captainShare = shareValue * 1.5;
  
  // Captain's extra share is deducted from owner
  const captainExtraShare = shareValue * 0.5; // The extra 0.5 share
  const adjustedOwnerShare = ownerShare - captainExtraShare;

  const formatCurrency = (amount) => {
    return formatCurrencyEnglish(amount);
  };

  if (totalAmount === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 elevation-1">
        <div className="text-center py-8">
          <Icon name="Calculator" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">حاسبة توزيع الأرباح</h3>
          <p className="text-muted-foreground">
            أضف فواتير لعرض حساب توزيع الأرباح
          </p>
        </div>
      </div>
    );
  }

  if (crewCount === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 elevation-1">
        <div className="text-center py-8">
          <Icon name="AlertTriangle" size={48} className="text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">تحديد عدد الطاقم مطلوب</h3>
          <p className="text-muted-foreground">
            يرجى تحديد عدد أفراد الطاقم في إعدادات الصندوق لحساب توزيع الأرباح
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 elevation-1">
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
        <Icon name="Calculator" size={24} className="text-primary" />
        <h3 className="text-lg font-heading font-semibold text-foreground">
          حاسبة توزيع الأرباح
        </h3>
      </div>

      {/* Crew Count Info */}
      <div className="bg-info/10 border border-info/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Icon name="Users" size={20} className="text-info" />
            <span className="text-sm font-medium text-info">عدد أفراد الطاقم</span>
          </div>
          <span className="text-lg font-bold text-info">{formatNumberEnglish(crewCount)} فرد</span>
        </div>
      </div>

      {/* Total Amount */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
        <div className="text-center">
          <p className="text-sm font-medium text-primary mb-2">إجمالي المبلغ للتوزيع</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
        </div>
      </div>

      {/* Distribution Breakdown */}
      <div className="space-y-4">
        {/* Owner Share */}
        <div className="flex items-center justify-between p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Icon name="Crown" size={20} className="text-accent" />
            <div>
              <p className="font-medium text-foreground">نصيب مالك القارب</p>
              <p className="text-sm text-muted-foreground">50% - النصف الإضافي للقبطان</p>
            </div>
          </div>
          <p className="text-lg font-bold text-accent">{formatCurrency(adjustedOwnerShare)}</p>
        </div>

        {/* Captain Share */}
        <div className="flex items-center justify-between p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Icon name="Anchor" size={20} className="text-secondary" />
            <div>
              <p className="font-medium text-foreground">نصيب القبطان ({captainName})</p>
              <p className="text-sm text-muted-foreground">حصة ونصف (1.5 حصة)</p>
            </div>
          </div>
          <p className="text-lg font-bold text-secondary">{formatCurrency(captainShare)}</p>
        </div>

        {/* Regular Crew Share */}
        {regularCrewCount > 0 && (
          <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Icon name="Users" size={20} className="text-success" />
              <div>
                <p className="font-medium text-foreground">نصيب كل فرد من الطاقم</p>
                <p className="text-sm text-muted-foreground">{regularCrewCount} أفراد</p>
              </div>
            </div>
            <p className="text-lg font-bold text-success">{formatCurrency(regularCrewShare)}</p>
          </div>
        )}
      </div>

      {/* Calculation Example */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="font-medium text-foreground mb-4">مثال على التوزيع</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>إجمالي المبلغ:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>نصيب المالك (50%):</span>
            <span>{formatCurrency(ownerShare)}</span>
          </div>
          <div className="flex justify-between">
            <span>نصيب الطاقم (50%):</span>
            <span>{formatCurrency(crewTotalShare)}</span>
          </div>
          <div className="flex justify-between text-primary">
            <span>القبطان (1.5 حصة):</span>
            <span>{formatCurrency(captainShare)}</span>
          </div>
          {regularCrewCount > 0 && (
            <div className="flex justify-between text-success">
              <span>كل فرد طاقم ({formatNumberEnglish(regularCrewCount)} أفراد):</span>
              <span>{formatCurrency(regularCrewShare)}</span>
            </div>
          )}
          <div className="flex justify-between text-accent pt-2 border-t">
            <span>المالك بعد الخصم:</span>
            <span>{formatCurrency(adjustedOwnerShare)}</span>
          </div>
        </div>
      </div>

      {/* Summary Note */}
      <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>نظام التوزيع المحدث:</strong> 50% لمالك القارب، 50% للطاقم
            </p>
            <p>
              <strong>حصة القبطان:</strong> يحصل على حصة ونصف (1.5) من نصيب الطاقم، والنصف الإضافي يُخصم من نصيب المالك
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;