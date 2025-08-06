import React from 'react';
import { cn } from '../../utils/cn';
import Icon from '../AppIcon';
import Button from './Button';

const ErrorState = React.forwardRef(({
  className,
  error = "حدث خطأ غير متوقع",
  title = "عذراً، حدث خطأ",
  size = "default",
  showIcon = true,
  onRetry = null,
  retryText = "إعادة المحاولة",
  children,
  ...props
}, ref) => {
  // Size variants
  const sizeVariants = {
    sm: {
      container: "p-4",
      icon: 20,
      title: "text-base",
      message: "text-sm"
    },
    default: {
      container: "p-8",
      icon: 24,
      title: "text-lg",
      message: "text-base"
    },
    lg: {
      container: "p-12",
      icon: 32,
      title: "text-xl",
      message: "text-lg"
    }
  };

  const currentSize = sizeVariants?.[size] || sizeVariants?.default;

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center w-full text-center",
        currentSize?.container,
        className
      )}
      {...props}
    >
      {showIcon && (
        <div className="mb-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <Icon 
              name="AlertTriangle" 
              size={currentSize?.icon} 
              className="text-destructive" 
            />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <h3 className={cn(
          "font-semibold text-foreground",
          currentSize?.title
        )}>
          {title}
        </h3>
        
        <p className={cn(
          "text-muted-foreground",
          currentSize?.message
        )}>
          {error}
        </p>
      </div>
      {onRetry && (
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={onRetry}
            iconName="RefreshCw"
            iconPosition="right"
          >
            {retryText}
          </Button>
        </div>
      )}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
});

ErrorState.displayName = "ErrorState";

export default ErrorState;