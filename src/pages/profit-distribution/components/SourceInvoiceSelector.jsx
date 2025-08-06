import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const SourceInvoiceSelector = ({
  financialBoxes,
  selectedBox,
  onBoxSelect,
  totalAmount,
  onCalculateDistribution,
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Transform financial boxes into options format for Select component
  // Filter out completed boxes - only show active/draft boxes
  const boxOptions = financialBoxes
    ?.filter((box) => box?.status !== 'completed')
    ?.map((box) => ({
      value: box?.id,
      label: box?.name,
      description: `${box?.invoiceCount} فاتورة • ${box?.totalAmount?.toLocaleString('ar-SA')} ريال${box?.crewCount ? ` • ${box?.crewCount} طاقم` : ''}`
    })) || [];

  return (
    <div className="bg-card border border-border rounded-lg elevation-1">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="FileText" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              اختيار مصدر الأرباح
            </h3>
            <p className="text-sm text-muted-foreground">
              حدد الصندوق المالي لحساب توزيع الأرباح
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
        <div className="border-t border-border p-4">
          {loading ? (
            <div className="text-center py-8">
              <Icon name="Loader2" size={24} className="text-primary animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">جاري تحميل الصناديق المالية...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    الصندوق المالي
                  </label>
                  <Select
                    value={selectedBox}
                    onChange={onBoxSelect}
                    options={boxOptions}
                    placeholder="اختر الصندوق المالي"
                  />
                </div>

                {selectedBox && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">
                        {financialBoxes?.find(box => box?.id === selectedBox)?.invoiceCount || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">عدد الفواتير</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-success">
                        {totalAmount?.toLocaleString('ar-SA')}
                      </div>
                      <div className="text-sm text-muted-foreground">إجمالي المبلغ (ريال)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        {financialBoxes?.find(box => box?.id === selectedBox)?.crewCount || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">عدد الطاقم المتوقع</div>
                    </div>
                  </div>
                )}

                <Button
                  variant="default"
                  size="lg"
                  onClick={onCalculateDistribution}
                  disabled={!selectedBox}
                  iconName="Calculator"
                  iconPosition="right"
                  className="w-full"
                >
                  حساب التوزيع
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SourceInvoiceSelector;