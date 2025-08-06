import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import { formatCurrencyEnglish, formatNumberEnglish } from '../../../utils/localization';

const BoxStats = ({ boxes }) => {
  const stats = React.useMemo(() => {
    const totalBoxes = boxes?.length;
    const completedBoxes = boxes?.filter(box => box?.status === 'completed')?.length;
    const draftBoxes = boxes?.filter(box => box?.status === 'draft')?.length;
    const cancelledBoxes = boxes?.filter(box => box?.status === 'cancelled')?.length;
    const totalAmount = boxes?.reduce((sum, box) => sum + box?.totalAmount, 0);
    const totalInvoices = boxes?.reduce((sum, box) => sum + box?.invoiceCount, 0);

    return {
      totalBoxes,
      completedBoxes,
      draftBoxes,
      cancelledBoxes,
      totalAmount,
      totalInvoices
    };
  }, [boxes]);

  const formatCurrency = (amount) => {
    return formatCurrencyEnglish(amount);
  };

  const formatNumber = (number) => {
    return formatNumberEnglish(number);
  };

  const statCards = [
    {
      title: 'إجمالي الصناديق',
      value: formatNumber(stats?.totalBoxes),
      icon: 'Package',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'الصناديق المكتملة',
      value: formatNumber(stats?.completedBoxes),
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'المسودات',
      value: formatNumber(stats?.draftBoxes),
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'الملغية',
      value: formatNumber(stats?.cancelledBoxes),
      icon: 'XCircle',
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      title: 'إجمالي المبلغ',
      value: formatCurrency(stats?.totalAmount),
      icon: 'DollarSign',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'إجمالي الفواتير',
      value: formatNumber(stats?.totalInvoices),
      icon: 'FileText',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {statCards?.map((stat, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-4 elevation-1">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat?.bgColor}`}>
              <Icon name={stat?.icon} size={20} className={stat?.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-caption text-muted-foreground truncate">
                {stat?.title}
              </p>
              <p className="text-lg font-semibold text-foreground truncate">
                {stat?.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BoxStats;