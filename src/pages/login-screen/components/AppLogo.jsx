import React from 'react';
import Icon from '../../../components/AppIcon';

const AppLogo = () => {
  return (
    <div className="flex flex-col items-center space-y-4 mb-8">
      {/* Logo Icon */}
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center elevation-2 animate-fade-in">
          <Icon name="Anchor" size={40} color="white" />
        </div>
        
        {/* Decorative waves */}
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-secondary/20 rounded-full animate-pulse"></div>
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-accent/30 rounded-full animate-pulse delay-300"></div>
      </div>

      {/* App Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          مدير الأرباح البحرية
        </h1>
        <p className="text-sm font-caption text-muted-foreground">
          Marine Profit Manager
        </p>
        <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
      </div>

      {/* Welcome Message */}
      <div className="text-center space-y-1 mt-6">
        <p className="text-lg font-medium text-foreground">
          مرحباً بك
        </p>
        <p className="text-sm text-muted-foreground">
          سجل دخولك لإدارة أعمالك البحرية
        </p>
      </div>
    </div>
  );
};

export default AppLogo;