import React from 'react';

const BackgroundPattern = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30"></div>
      
      {/* Animated wave patterns */}
      <div className="absolute inset-0">
        {/* Wave 1 */}
        <div className="absolute top-0 left-0 w-full h-full">
          <svg
            className="absolute top-0 left-0 w-full h-full opacity-5"
            viewBox="0 0 1200 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,400 C300,300 600,500 1200,400 L1200,0 L0,0 Z"
              fill="url(#wave1)"
              className="animate-pulse"
            />
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-secondary)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Wave 2 */}
        <div className="absolute bottom-0 right-0 w-full h-full">
          <svg
            className="absolute bottom-0 right-0 w-full h-full opacity-3"
            viewBox="0 0 1200 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1200,400 C900,500 600,300 0,400 L0,800 L1200,800 Z"
              fill="url(#wave2)"
              className="animate-pulse delay-1000"
            />
            <defs>
              <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-accent)" />
                <stop offset="100%" stopColor="var(--color-primary)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Anchor icons */}
        <div className="absolute top-20 right-20 text-primary/10 animate-pulse">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
            <path d="M12 8v13l-4-4"/>
            <path d="M12 21l4-4"/>
          </svg>
        </div>
        
        <div className="absolute bottom-32 left-16 text-secondary/10 animate-pulse delay-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
            <path d="M12 8v13l-4-4"/>
            <path d="M12 21l4-4"/>
          </svg>
        </div>

        <div className="absolute top-1/2 right-8 text-accent/10 animate-pulse delay-1000">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
            <path d="M12 8v13l-4-4"/>
            <path d="M12 21l4-4"/>
          </svg>
        </div>

        {/* Geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-secondary/20 rounded-full animate-pulse delay-700"></div>
        <div className="absolute top-3/4 left-1/6 w-1.5 h-1.5 bg-accent/20 rounded-full animate-pulse delay-300"></div>
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-foreground) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
    </div>
  );
};

export default BackgroundPattern;