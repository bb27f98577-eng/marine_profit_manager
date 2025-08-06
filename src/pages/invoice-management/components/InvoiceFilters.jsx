import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';


const InvoiceFilters = ({ onFilterChange, onAddInvoice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const sortOptions = [
    { value: 'date', label: 'التاريخ' },
    { value: 'amount', label: 'المبلغ' },
    { value: 'captainCrewNumber', label: 'رقم الطاقم' },
    { value: 'observations', label: 'الملاحظات' }
  ];

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchTerm(value);
    onFilterChange({
      search: value,
      dateRange,
      amountRange,
      sortBy,
      sortOrder
    });
  };

  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    onFilterChange({
      search: searchTerm,
      dateRange: newDateRange,
      amountRange,
      sortBy,
      sortOrder
    });
  };

  const handleAmountRangeChange = (field, value) => {
    const newAmountRange = { ...amountRange, [field]: value };
    setAmountRange(newAmountRange);
    onFilterChange({
      search: searchTerm,
      dateRange,
      amountRange: newAmountRange,
      sortBy,
      sortOrder
    });
  };

  const handleSortChange = (field, value) => {
    const newSort = field === 'sortBy' ? { sortBy: value, sortOrder } : { sortBy, sortOrder: value };
    if (field === 'sortBy') setSortBy(value);
    if (field === 'sortOrder') setSortOrder(value);
    
    onFilterChange({
      search: searchTerm,
      dateRange,
      amountRange,
      ...newSort
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setAmountRange({ min: '', max: '' });
    setSortBy('date');
    setSortOrder('desc');
    onFilterChange({
      search: '',
      dateRange: { start: '', end: '' },
      amountRange: { min: '', max: '' },
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6 elevation-1">
      {/* Top Row - Search and Add Button */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="البحث في الفواتير..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            iconName={isFiltersExpanded ? 'ChevronUp' : 'ChevronDown'}
            iconPosition="right"
          >
            فلاتر متقدمة
          </Button>
          
          <Button
            variant="default"
            onClick={onAddInvoice}
            iconName="Plus"
            iconPosition="right"
          >
            إضافة فاتورة
          </Button>
        </div>
      </div>
      {/* Expanded Filters */}
      {isFiltersExpanded && (
        <div className="border-t border-border pt-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">نطاق التاريخ</label>
              <div className="space-y-2">
                <Input
                  type="date"
                  placeholder="من تاريخ"
                  value={dateRange?.start}
                  onChange={(e) => handleDateRangeChange('start', e?.target?.value)}
                />
                <Input
                  type="date"
                  placeholder="إلى تاريخ"
                  value={dateRange?.end}
                  onChange={(e) => handleDateRangeChange('end', e?.target?.value)}
                />
              </div>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">نطاق المبلغ (ريال)</label>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="الحد الأدنى"
                  value={amountRange?.min}
                  onChange={(e) => handleAmountRangeChange('min', e?.target?.value)}
                />
                <Input
                  type="number"
                  placeholder="الحد الأقصى"
                  value={amountRange?.max}
                  onChange={(e) => handleAmountRangeChange('max', e?.target?.value)}
                />
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">ترتيب حسب</label>
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={(value) => handleSortChange('sortBy', value)}
                placeholder="اختر الترتيب"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">نوع الترتيب</label>
              <Select
                options={[
                  { value: 'asc', label: 'تصاعدي' },
                  { value: 'desc', label: 'تنازلي' }
                ]}
                value={sortOrder}
                onChange={(value) => handleSortChange('sortOrder', value)}
                placeholder="اختر النوع"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={clearFilters}
              iconName="X"
              iconPosition="right"
              className="text-muted-foreground hover:text-foreground"
            >
              مسح الفلاتر
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceFilters;