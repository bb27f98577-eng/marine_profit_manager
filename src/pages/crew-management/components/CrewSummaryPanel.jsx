import React from 'react';
import Icon from '../../../components/AppIcon';
import { formatCurrencyEnglish } from '../../../utils/localization';

const CrewSummaryPanel = ({ crewData, totalProfitDistribution }) => {
  const formatCurrency = (amount) => {
    return formatCurrencyEnglish(amount || 0);
  };

  const summaryStats = [
  {
    title: 'إجمالي أفراد الطاقم',
    value: crewData?.length,
    icon: 'Users',
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  {
    title: 'القباطنة',
    value: crewData?.filter((member) => member?.role === 'captain')?.length,
    icon: 'Crown',
    color: 'text-accent',
    bgColor: 'bg-accent/10'
  },
  {
    title: 'البحارة',
    value: crewData?.filter((member) => member?.role === 'crew')?.length,
    icon: 'User',
    color: 'text-secondary',
    bgColor: 'bg-secondary/10'
  }];


  const financialStats = [
  {
    title: 'إجمالي الديون',
    value: formatCurrency(crewData?.reduce((sum, member) => sum + member?.debt, 0)),
    icon: 'AlertTriangle',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10'
  },
  {
    title: 'إجمالي حصص الأرباح',
    value: formatCurrency(crewData?.reduce((sum, member) => sum + member?.profitShare, 0)),
    icon: 'TrendingUp',
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  {
    title: 'صافي المستحقات',
    value: formatCurrency(crewData?.reduce((sum, member) => sum + member?.finalShare, 0)),
    icon: 'Calculator',
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  }];


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Crew Statistics */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-heading font-semibold text-foreground mb-3 sm:mb-4 flex items-center space-x-2 rtl:space-x-reverse">
          <Icon name="Users" size={18} sm:size={20} />
          <span>إحصائيات الطاقم</span>
        </h3>
        
        <div className="space-y-3 sm:space-y-4">
          {summaryStats?.map((stat, index) =>
          <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50">
              <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse min-w-0 flex-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${stat?.bgColor} shrink-0`}>
                  <Icon name={stat?.icon} size={16} sm:size={20} className={stat?.color} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground truncate">{stat?.title}</span>
              </div>
              <span className={`text-base sm:text-lg font-semibold ${stat?.color} shrink-0`}>
                {stat?.value}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Financial Summary */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-heading font-semibold text-foreground mb-3 sm:mb-4 flex items-center space-x-2 rtl:space-x-reverse">
          <Icon name="DollarSign" size={18} sm:size={20} />
          <span>الملخص المالي</span>
        </h3>
        
        <div className="space-y-3 sm:space-y-4">
          {financialStats?.map((stat, index) =>
          <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50">
              <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse min-w-0 flex-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${stat?.bgColor} shrink-0`}>
                  <Icon name={stat?.icon} size={16} sm:size={20} className={stat?.color} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground truncate">{stat?.title}</span>
              </div>
              <span className={`text-xs sm:text-base font-semibold ${stat?.color} shrink-0`}>
                {stat?.value}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-heading font-semibold text-foreground mb-3 sm:mb-4 flex items-center space-x-2 rtl:space-x-reverse">
          <Icon name="Activity" size={18} sm:size={20} />
          <span>النشاط الأخير</span>
        </h3>
        
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <Icon name="UserPlus" size={12} sm:size={16} className="text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-foreground">تم إضافة عضو جديد للطاقم</p>
              <p className="text-xs text-muted-foreground">منذ ساعتين</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
              <Icon name="Calculator" size={12} sm:size={16} className="text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-foreground">تم تحديث حسابات الديون</p>
              <p className="text-xs text-muted-foreground">أمس</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="TrendingUp" size={12} sm:size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-foreground">تم توزيع الأرباح الشهرية</p>
              <p className="text-xs text-muted-foreground">منذ 3 أيام</p>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

export default CrewSummaryPanel;