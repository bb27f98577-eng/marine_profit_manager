import React from 'react';
import { cn } from '../../utils/cn';


const LoadingState = React.forwardRef(({
  className,
  message = "جاري التحميل...",
  size = "default",
  showIcon = true,
  children,
  ...props
}, ref) => {
  // Size variants
  const sizeVariants = {
    sm: {
      container: "p-4",
      icon: 20,
      text: "text-sm"
    },
    default: {
      container: "p-8",
      icon: 24,
      text: "text-base"
    },
    lg: {
      container: "p-12",
      icon: 32,
      text: "text-lg"
    }
  };

  const currentSize = sizeVariants?.[size] || sizeVariants?.default;

  // Loading spinner component
  const LoadingSpinner = ({ size: spinnerSize = 24 }) => (
    <div className="inline-block">
      <svg
        className="animate-spin text-primary"
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center w-full",
        currentSize?.container,
        className
      )}
      {...props}
    >
      {showIcon && (
        <div className="mb-4">
          <LoadingSpinner size={currentSize?.icon} />
        </div>
      )}
      {(message || children) && (
        <div className="text-center">
          {children || (
            <p className={cn(
              "text-muted-foreground font-medium",
              currentSize?.text
            )}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

LoadingState.displayName = "LoadingState";

export default LoadingState;