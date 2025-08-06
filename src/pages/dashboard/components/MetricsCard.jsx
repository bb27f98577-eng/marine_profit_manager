import React from 'react';
import Icon from '../../../components/AppIcon';
import { formatNumberEnglish } from '../../../utils/localization';

const MetricsCard = ({ title, amount, currency = 'ر.س', icon, trend, trendValue, color = 'primary', onClick, isExpandable = false }) => {
  const formatAmount = (value) => {
    if (typeof value !== 'number') return '0';
    return formatNumberEnglish(value);
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    return trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus';
  };

  return (
    <div 
      className={`bg-card border border-border rounded-lg p-6 elevation-1 transition-all duration-200 hover:elevation-2 ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } ${isExpandable ? 'group' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          color === 'primary' ? 'bg-primary/10 text-primary' :
          color === 'success' ? 'bg-success/10 text-success' :
          color === 'warning' ? 'bg-warning/10 text-warning' :
          color === 'error'? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'
        }`}>
          <Icon name={icon} size={24} />
        </div>
        
        {isExpandable && (
          <Icon 
            name="ChevronDown" 
            size={20} 
            className="text-muted-foreground group-hover:text-foreground transition-colors rtl:rotate-180" 
          />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2 rtl:space-x-reverse">
            <span className="text-2xl font-bold text-foreground">
              {formatAmount(amount)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {currency}
            </span>
          </div>
          
          {trend && trendValue && (
            <div className={`flex items-center space-x-1 rtl:space-x-reverse ${getTrendColor()}`}>
              <Icon name={getTrendIcon()} size={16} />
              <span className="text-sm font-medium">
                {typeof trendValue === 'number' ? `${formatNumberEnglish(trendValue)}%` : trendValue}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;