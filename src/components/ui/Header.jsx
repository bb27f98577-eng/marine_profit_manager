import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = ({ onMenuToggle, isMenuOpen = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const primaryNavItems = [
    { path: '/dashboard', label: 'لوحة التحكم', icon: 'LayoutDashboard' },
    { path: '/financial-boxes-management', label: 'إدارة الصناديق المالية', icon: 'Package' },
    { path: '/invoice-management', label: 'إدارة الفواتير', icon: 'FileText' },
    { path: '/crew-management', label: 'إدارة الطاقم', icon: 'Users' },
    { path: '/profit-distribution', label: 'توزيع الأرباح', icon: 'TrendingUp' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMoreMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  if (location.pathname === '/login-screen') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border elevation-1">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Icon name={isMenuOpen ? 'X' : 'Menu'} size={20} />
          </Button>
          
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Anchor" size={20} color="white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-heading font-semibold text-foreground">
                مدير الأرباح البحرية
              </h1>
              <p className="text-xs font-caption text-muted-foreground">
                Marine Profit Manager
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse">
          {primaryNavItems?.slice(0, 4)?.map((item) => (
            <Button
              key={item?.path}
              variant={isActivePath(item?.path) ? "default" : "ghost"}
              size="sm"
              onClick={() => handleNavigation(item?.path)}
              iconName={item?.icon}
              iconPosition="right"
              className="text-sm font-medium"
            >
              {item?.label}
            </Button>
          ))}
          
          {/* More Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              iconName="MoreHorizontal"
              iconPosition="right"
              className="text-sm font-medium"
            >
              المزيد
            </Button>
            
            {isMoreMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg elevation-2 py-2 animate-fade-in">
                {primaryNavItems?.slice(4)?.map((item) => (
                  <button
                    key={item?.path}
                    onClick={() => handleNavigation(item?.path)}
                    className={`w-full px-4 py-2 text-right text-sm font-medium flex items-center justify-between hover:bg-muted transition-colors ${
                      isActivePath(item?.path) ? 'bg-primary/10 text-primary' : 'text-foreground'
                    }`}
                  >
                    <span>{item?.label}</span>
                    <Icon name={item?.icon} size={16} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Navigation */}
        <nav className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          >
            <Icon name="MoreVertical" size={20} />
          </Button>
          
          {isMoreMenuOpen && (
            <div className="absolute top-full right-4 mt-2 w-64 bg-popover border border-border rounded-lg elevation-2 py-2 animate-fade-in">
              {primaryNavItems?.map((item) => (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`w-full px-4 py-3 text-right text-sm font-medium flex items-center justify-between hover:bg-muted transition-colors ${
                    isActivePath(item?.path) ? 'bg-primary/10 text-primary' : 'text-foreground'
                  }`}
                >
                  <span>{item?.label}</span>
                  <Icon name={item?.icon} size={18} />
                </button>
              ))}
            </div>
          )}
        </nav>
      </div>
      {/* Mobile Overlay */}
      {isMoreMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMoreMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;