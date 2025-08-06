import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Breadcrumb = ({ customItems = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeMap = {
    '/dashboard': { label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    '/financial-boxes-management': { label: 'إدارة الصناديق المالية', icon: 'Package' },
    '/invoice-management': { label: 'إدارة الفواتير', icon: 'FileText' },
    '/crew-management': { label: 'إدارة الطاقم', icon: 'Users' },
    '/profit-distribution': { label: 'توزيع الأرباح', icon: 'TrendingUp' }
  };

  const generateBreadcrumbs = () => {
    if (customItems) return customItems;

    const pathSegments = location.pathname?.split('/')?.filter(Boolean);
    const breadcrumbs = [{ path: '/dashboard', label: 'لوحة التحكم', icon: 'Home' }];

    if (location.pathname !== '/dashboard') {
      const currentRoute = routeMap?.[location.pathname];
      if (currentRoute) {
        breadcrumbs?.push({
          path: location.pathname,
          label: currentRoute?.label,
          icon: currentRoute?.icon
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (location.pathname === '/login-screen' || breadcrumbs?.length <= 1) {
    return null;
  }

  const handleNavigation = (path) => {
    if (path !== location.pathname) {
      navigate(path);
    }
  };

  return (
    <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-muted-foreground mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 rtl:space-x-reverse">
        {breadcrumbs?.map((item, index) => (
          <li key={item?.path} className="flex items-center space-x-2 rtl:space-x-reverse">
            {index > 0 && (
              <Icon 
                name="ChevronLeft" 
                size={16} 
                className="text-muted-foreground rtl:rotate-180" 
              />
            )}
            
            {index === breadcrumbs?.length - 1 ? (
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-foreground">
                <Icon name={item?.icon} size={16} />
                <span className="font-medium">{item?.label}</span>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(item?.path)}
                iconName={item?.icon}
                iconPosition="right"
                className="h-auto p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {item?.label}
              </Button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;