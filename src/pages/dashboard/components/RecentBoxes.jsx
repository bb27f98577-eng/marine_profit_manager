import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { dashboardService } from '../../../services/dashboardService';

const RecentBoxes = () => {
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentBoxes();
  }, []);

  const fetchRecentBoxes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService?.getRecentBoxes(3);
      setBoxes(data);
    } catch (err) {
      console.error('Error fetching recent boxes:', err);
      setError(err?.message || 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'غير محدد';
    return new Intl.DateTimeFormat('ar-SA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })?.format(new Date(date));
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success';
      case 'draft': return 'bg-warning/10 text-warning';
      case 'pending': return 'bg-accent/10 text-accent';
      case 'cancelled': return 'bg-error/10 text-error';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'draft': return 'مسودة';
      case 'pending': return 'معلق';
      case 'cancelled': return 'ملغي';
      default: return 'غير محدد';
    }
  };

  const handleBoxClick = (boxId) => {
    navigate(`/financial-boxes-management?box=${boxId}`);
  };

  const handleViewAll = () => {
    navigate('/financial-boxes-management');
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">الصناديق الحديثة</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3]?.map(i => (
            <div key={i} className="p-4 border border-border rounded-lg animate-pulse">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">الصناديق الحديثة</h3>
        </div>
        <div className="text-center py-8">
          <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={fetchRecentBoxes}
            iconName="RefreshCw"
            iconPosition="right"
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">الصناديق الحديثة</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAll}
          iconName="ArrowLeft"
          iconPosition="left"
          className="text-primary hover:text-primary/80"
        >
          عرض الكل
        </Button>
      </div>
      <div className="space-y-4">
        {boxes?.map((box) => (
          <div
            key={box?.id}
            onClick={() => handleBoxClick(box?.id)}
            className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer hover:elevation-1"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Package" size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{box?.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    آخر فاتورة: {formatDate(box?.lastBillDate)}
                  </p>
                </div>
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(box?.paymentStatus)}`}>
                {getStatusText(box?.paymentStatus)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="flex items-center space-x-1 rtl:space-x-reverse text-muted-foreground">
                  <Icon name="FileText" size={16} />
                  <span>{box?.billsCount} فاتورة</span>
                </div>
              </div>
              
              <div className="text-left">
                <span className="font-semibold text-foreground">
                  {formatAmount(box?.totalAmount)} ر.س
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {boxes?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">لا توجد صناديق مالية</p>
          <Button
            variant="outline"
            onClick={() => navigate('/financial-boxes-management')}
            iconName="Plus"
            iconPosition="right"
          >
            إنشاء صندوق جديد
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentBoxes;