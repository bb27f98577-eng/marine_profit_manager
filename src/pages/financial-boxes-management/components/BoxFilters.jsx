import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const BoxFilters = ({ 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange, 
  statusFilter, 
  onStatusFilterChange,
  onCreateNew 
}) => {
  const sortOptions = [
    { value: 'name', label: 'الاسم' },
    { value: 'date', label: 'التاريخ' },
    { value: 'amount', label: 'المبلغ' },
    { value: 'status', label: 'الحالة' },
    { value: 'invoiceCount', label: 'عدد الفواتير' }
  ];

  const statusOptions = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'draft', label: 'مسودة' },
    { value: 'cancelled', label: 'ملغي' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 elevation-1">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4 rtl:lg:space-x-reverse">
        {/* Left Section - Create Button */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Button
            onClick={onCreateNew}
            iconName="Plus"
            iconPosition="right"
            className="whitespace-nowrap"
          >
            إنشاء صندوق جديد
          </Button>
        </div>

        {/* Right Section - Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 rtl:sm:space-x-reverse">
          {/* Search */}
          <div className="flex-1 min-w-0 sm:max-w-xs">
            <div className="relative">
              <Input
                type="text"
                placeholder="البحث في الصناديق..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e?.target?.value)}
                className="pr-10 rtl:pr-4 rtl:pl-10"
              />
              <div className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Icon name="Search" size={16} className="text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:min-w-[140px]">
            <Select
              placeholder="تصفية الحالة"
              options={statusOptions}
              value={statusFilter}
              onChange={onStatusFilterChange}
            />
          </div>

          {/* Sort */}
          <div className="sm:min-w-[120px]">
            <Select
              placeholder="ترتيب حسب"
              options={sortOptions}
              value={sortBy}
              onChange={onSortChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxFilters;