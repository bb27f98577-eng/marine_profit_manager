import React from 'react';
import Icon from '../../../components/AppIcon';
import { formatCurrencyEnglish, formatDateEnglish, formatNumberEnglish } from '../../../utils/localization';

const InvoiceSummaryCards = ({ invoices, selectedBox }) => {
  const totalAmount = invoices?.reduce((sum, invoice) => sum + invoice?.amount, 0);
  const invoiceCount = invoices?.length;
  const lastEntryDate = invoices?.length > 0 
    ? new Date(Math.max(...invoices.map(inv => new Date(inv.date))))
    : null;

  const formatCurrency = (amount) => {
    return formatCurrencyEnglish(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'لا توجد فواتير';
    return formatDateEnglish(date, 'dd/MM/yyyy');
  };

  const summaryData = [
    {
      id: 1,
      title: 'إجمالي المبلغ',
      value: formatCurrency(totalAmount),
      icon: 'DollarSign',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      id: 2,
      title: 'عدد الفواتير',
      value: formatNumberEnglish(invoiceCount),
      icon: 'FileText',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      id: 3,
      title: 'آخر فاتورة',
      value: formatDate(lastEntryDate),
      icon: 'Calendar',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {summaryData?.map((item) => (
        <div key={item?.id} className="bg-card border border-border rounded-lg p-6 elevation-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {item?.title}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {item?.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${item?.bgColor} flex items-center justify-center`}>
              <Icon name={item?.icon} size={24} className={item?.color} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvoiceSummaryCards;