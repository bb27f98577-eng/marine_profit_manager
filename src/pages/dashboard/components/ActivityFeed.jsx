import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { dashboardService } from '../../../services/dashboardService';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const ActivityFeed = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecentActivity = useCallback(async () => {
    let isMounted = true;
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getRecentActivity(5);
      if (isMounted) {
        setActivities(data || []);
      }
    } catch (err) {
      if (isMounted) {
        console.error('Error fetching recent activity:', err);
        setError(err.message || 'حدث خطأ في تحميل النشاط الأخير');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
    return () => { isMounted = false };
  }, []);

  useEffect(() => {
    fetchRecentActivity();
  }, [fetchRecentActivity]);

  const formatDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ar-SA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return '--/--/---- --:--';
    }
  }, []);

  const formatAmount = useCallback((amount) => {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }, []);

  const getActivityIcon = useCallback((type) => {
    const icons = {
      invoice: 'FileText',
      payment: 'CreditCard',
      crew: 'Users',
      box: 'Package',
      profit: 'TrendingUp'
    };
    return icons[type] || 'Activity';
  }, []);

  const getActivityColor = useCallback((type) => {
    const colors = {
      invoice: 'text-primary bg-primary/10',
      payment: 'text-success bg-success/10',
      crew: 'text-secondary bg-secondary/10',
      box: 'text-warning bg-warning/10',
      profit: 'text-accent bg-accent/10'
    };
    return colors[type] || 'text-muted-foreground bg-muted';
  }, []);

  const handleViewAll = useCallback(() => {
    navigate('/activity-log');
  }, [navigate]);

  const handleRetry = useCallback(() => {
    fetchRecentActivity();
  }, [fetchRecentActivity]);

  const handleActivityClick = useCallback((activity) => {
    // Example navigation based on activity type
    if (activity.type === 'invoice') {
      navigate(`/invoices/${activity.referenceId}`);
    }
    // Add other navigation cases as needed
  }, [navigate]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">النشاط الأخير</h3>
          <LoadingSpinner size={20} />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 p-3 rounded-lg animate-pulse">
              <div className="w-10 h-10 bg-muted rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-1/2" />
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
          <h3 className="text-lg font-semibold text-foreground">النشاط الأخير</h3>
        </div>
        <div className="text-center py-6 space-y-4">
          <div className="text-destructive flex flex-col items-center">
            <Icon name="AlertCircle" size={40} className="mb-2" />
            <p>{error}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleRetry}
            iconName="RefreshCw"
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">النشاط الأخير</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            عرض الكل
          </Button>
        </div>
        <div className="text-center py-6 space-y-2">
          <Icon name="Activity" size={40} className="mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">لا توجد أنشطة حديثة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">النشاط الأخير</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAll}
          iconName="ArrowLeft"
          iconPosition="left"
        >
          عرض الكل
        </Button>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            onClick={() => handleActivityClick(activity)}
            className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
              <Icon name={getActivityIcon(activity.type)} size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.title}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatDate(activity.timestamp)}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {activity.description}
              </p>
              
              {activity.amount && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {formatAmount(activity.amount)} ر.س
                  </span>
                  {activity.status && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'completed' ? 'bg-success/10 text-success' :
                      activity.status === 'pending' ? 'bg-warning/10 text-warning' : 
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {activity.status === 'completed' ? 'مكتمل' :
                       activity.status === 'pending' ? 'معلق' : 'ملغي'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ActivityFeed);