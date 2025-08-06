import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import MetricsCard from './components/MetricsCard';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import RecentBoxes from './components/RecentBoxes';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Use real metrics instead of mock data
  const { metrics, loading: metricsLoading, error: metricsError, refreshMetrics } = useDashboardMetrics();

  // Mock activity data (this can be replaced with real data later)
  const recentActivities = [
    {
      id: 1,
      type: 'invoice',
      title: 'فاتورة جديدة - رحلة الخليج',
      description: 'تم إضافة فاتورة بقيمة 12,500 ر.س إلى صندوق رحلة الخليج',
      amount: 12500,
      status: 'completed',
      timestamp: new Date('2025-01-15T14:30:00')
    },
    {
      id: 2,
      type: 'payment',
      title: 'دفعة للطاقم',
      description: 'تم توزيع الأرباح على 8 أعضاء من الطاقم',
      amount: 24000,
      status: 'completed',
      timestamp: new Date('2025-01-14T10:15:00')
    },
    {
      id: 3,
      type: 'crew',
      title: 'عضو طاقم جديد',
      description: 'تم إضافة أحمد محمد كعضو جديد في الطاقم',
      status: 'pending',
      timestamp: new Date('2025-01-13T16:45:00')
    },
    {
      id: 4,
      type: 'box',
      title: 'صندوق مالي جديد',
      description: 'تم إنشاء صندوق "رحلة البحر الأحمر" بنجاح',
      timestamp: new Date('2025-01-12T09:20:00')
    },
    {
      id: 5,
      type: 'profit',
      title: 'حساب الأرباح',
      description: 'تم حساب وتوزيع أرباح شهر ديسمبر 2024',
      amount: 45600,
      status: 'completed',
      timestamp: new Date('2025-01-11T11:30:00')
    }
  ];

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMetricClick = (metric) => {
    switch (metric) {
      case 'crew-debts': navigate('/crew-management');
        break;
      case 'invoices': navigate('/invoice-management');
        break;
      case 'owner-balance': navigate('/profit-distribution');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading state for metrics
  if (metricsLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header onMenuToggle={handleSidebarToggle} isMenuOpen={isSidebarOpen} />
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        <main className={`transition-all duration-300 ease-smooth ${
          isSidebarCollapsed ? 'lg:mr-16' : 'lg:mr-72'
        } pt-16 pb-20 lg:pb-8`}>
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="Loader2" size={32} className="text-muted-foreground animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">جاري تحميل بيانات لوحة التحكم...</h3>
                <p className="text-muted-foreground">الرجاء الانتظار</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header onMenuToggle={handleSidebarToggle} isMenuOpen={isSidebarOpen} />
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <main className={`transition-all duration-300 ease-smooth ${
        isSidebarCollapsed ? 'lg:mr-16' : 'lg:mr-72'
      } pt-16 pb-20 lg:pb-8`}>
        <div className="container mx-auto px-4 py-6">
          <Breadcrumb />
          
          {/* Error Display */}
          {metricsError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Icon name="AlertCircle" size={20} className="text-destructive" />
                  <p className="text-destructive font-medium">خطأ في تحميل البيانات: {metricsError}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshMetrics}
                  className="text-destructive hover:text-destructive"
                >
                  <Icon name="RefreshCw" size={16} />
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          )}
          
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              مرحباً بك في مدير الأرباح البحرية
            </h1>
            <p className="text-muted-foreground">
              نظرة شاملة على العمليات المالية والطاقم لعملك البحري
            </p>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <MetricsCard
              title="إجمالي ديون الطاقم"
              amount={metrics?.totalCrewDebts}
              icon="Users"
              color="error"
              trend="down"
              trendValue={5.2}
              onClick={() => handleMetricClick('crew-debts')}
              isExpandable
            />
            
            <MetricsCard
              title="الفواتير غير الموزعة"
              amount={metrics?.undistributedInvoices}
              icon="FileText"
              color="warning"
              trend="up"
              trendValue={12.8}
              onClick={() => handleMetricClick('invoices')}
              isExpandable
            />
            
            <MetricsCard
              title="رصيد مالك القارب"
              amount={metrics?.boatOwnerBalance}
              icon="Wallet"
              color="success"
              trend="up"
              trendValue={8.4}
              onClick={() => handleMetricClick('owner-balance')}
              isExpandable
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-3 gap-6 mb-8">
            {/* Left Column - Recent Boxes */}
            <div className="lg:col-span-1">
              <RecentBoxes />
            </div>

            {/* Center Column - Activity Feed */}
            <div className="lg:col-span-1">
              <ActivityFeed />
            </div>

            {/* Right Column - Quick Actions */}
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;