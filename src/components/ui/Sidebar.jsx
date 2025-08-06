import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ isCollapsed = false, isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navigationItems = [
    { path: '/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { path: '/financial-boxes-management', label: 'إدارة الصناديق المالية', icon: 'Package' },
    { path: '/invoice-management', label: 'إدارة الفواتير', icon: 'FileText' },
    { path: '/crew-management', label: 'إدارة الطاقم', icon: 'Users' },
    { path: '/profit-distribution', label: 'توزيع الأرباح', icon: 'TrendingUp' }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')?.matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldUseDark);
    document.documentElement?.classList?.toggle('dark', shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement?.classList?.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  if (location.pathname === '/login-screen') {
    return null;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`fixed top-0 right-0 h-full bg-card border-l border-border elevation-1 transition-all duration-300 ease-smooth z-40 ${
        isCollapsed ? 'w-16' : 'w-72'
      } hidden lg:block`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!isCollapsed && (
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Anchor" size={24} color="white" />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-semibold text-foreground">
                    مدير الأرباح البحرية
                  </h2>
                  <p className="text-xs font-caption text-muted-foreground">
                    Marine Profit Manager
                  </p>
                </div>
              </div>
            )}
            
            {isCollapsed && (
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mx-auto">
                <Icon name="Anchor" size={24} color="white" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 focus-ring ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground elevation-1'
                    : 'text-foreground hover:bg-muted'
                } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                title={isCollapsed ? item?.label : undefined}
              >
                <Icon name={item?.icon} size={20} />
                {!isCollapsed && <span className="flex-1 text-right">{item?.label}</span>}
              </button>
            ))}
          </nav>

          {/* Theme Toggle */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "default"}
              onClick={toggleTheme}
              iconName={isDarkMode ? 'Sun' : 'Moon'}
              iconPosition={isCollapsed ? undefined : "right"}
              className={`w-full ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              title={isCollapsed ? (isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي') : undefined}
            >
              {!isCollapsed && (isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي')}
            </Button>
          </div>
        </div>
      </aside>
      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 right-0 w-72 bg-card border-l border-border elevation-2 transform transition-transform duration-300 ease-smooth z-50 lg:hidden ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Anchor" size={24} color="white" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-semibold text-foreground">
                  مدير الأرباح البحرية
                </h2>
                <p className="text-xs font-caption text-muted-foreground">
                  Marine Profit Manager
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 focus-ring ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground elevation-1'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span>{item?.label}</span>
                <Icon name={item?.icon} size={20} />
              </button>
            ))}
          </nav>

          {/* Theme Toggle */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={toggleTheme}
              iconName={isDarkMode ? 'Sun' : 'Moon'}
              iconPosition="right"
              className="w-full justify-between"
            >
              {isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            </Button>
          </div>
        </div>
      </aside>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      {/* Bottom Tab Bar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border elevation-2 z-40 lg:hidden">
        <div className="flex items-center justify-around py-2">
          {navigationItems?.slice(0, 4)?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path)}
              className={`flex flex-col items-center justify-center min-w-touch min-h-touch px-2 py-1 rounded-lg transition-all duration-200 ${
                isActivePath(item?.path)
                  ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={item?.icon} size={20} />
              <span className="text-xs font-caption mt-1 leading-tight text-center">
                {item?.label?.split(' ')?.[0]}
              </span>
            </button>
          ))}
          
          <button
            onClick={() => handleNavigation('/profit-distribution')}
            className={`flex flex-col items-center justify-center min-w-touch min-h-touch px-2 py-1 rounded-lg transition-all duration-200 ${
              isActivePath('/profit-distribution')
                ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name="TrendingUp" size={20} />
            <span className="text-xs font-caption mt-1 leading-tight text-center">
              الأرباح
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;