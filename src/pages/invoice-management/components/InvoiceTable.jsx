import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { formatCurrencyEnglish, formatDateEnglish } from '../../../utils/localization';

const InvoiceTable = ({ invoices, onEditInvoice, onDeleteInvoice, currentPage, itemsPerPage }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const formatCurrency = (amount) => {
    return formatCurrencyEnglish(amount);
  };

  const formatDate = (dateString) => {
    return formatDateEnglish(dateString, 'dd/MM/yyyy');
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedInvoices = [...invoices]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];

    if (sortField === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortField === 'amount') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    } else if (typeof aValue === 'string') {
      aValue = aValue?.toLowerCase();
      bValue = bValue?.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field) => {
    if (sortField !== field) return 'ArrowUpDown';
    return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  if (invoices?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد فواتير</h3>
        <p className="text-muted-foreground mb-6">
          لم يتم إضافة أي فواتير في هذا الصندوق بعد
        </p>
        <Button variant="default" iconName="Plus" iconPosition="right">
          إضافة أول فاتورة
        </Button>
      </div>);

  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden elevation-1">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">#</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">التاريخ</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">المبلغ</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">الملاحظات</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedInvoices?.map((invoice, index) =>
            <tr key={invoice?.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Icon name="Calendar" size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {formatDate(invoice?.date)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-success/10 text-success">
                    {formatCurrency(invoice?.amount)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-foreground line-clamp-2 max-w-xs">
                    {invoice?.observations || 'لا توجد ملاحظات'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditInvoice(invoice)}
                    className="text-primary hover:text-primary/80 hover:bg-primary/10">

                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteInvoice(invoice?.id)}
                    className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">

                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden divide-y divide-border">
        {sortedInvoices?.map((invoice, index) =>
        <div key={invoice?.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                فاتورة #{(currentPage - 1) * itemsPerPage + index + 1}
              </span>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditInvoice(invoice)}
                className="text-primary hover:text-primary/80 hover:bg-primary/10 h-8 w-8">

                  <Icon name="Edit" size={14} />
                </Button>
                <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteInvoice(invoice?.id)}
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-8 w-8">

                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {formatDate(invoice?.date)}
                </span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-success/10 text-success">
                {formatCurrency(invoice?.amount)}
              </span>
            </div>

            {invoice?.observations &&
          <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {invoice?.observations}
                </p>
              </div>
          }
          </div>
        )}
      </div>
    </div>);

};

export default InvoiceTable;