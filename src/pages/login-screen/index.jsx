import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLogo from './components/AppLogo';
import LoginForm from './components/LoginForm';
import ThemeToggle from './components/ThemeToggle';
import BackgroundPattern from './components/BackgroundPattern';

const LoginScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/dashboard');
    }

    // Set document direction for RTL
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';

    return () => {
      // Cleanup on unmount
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <BackgroundPattern />
      {/* Theme Toggle */}
      <ThemeToggle />
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 elevation-2 animate-fade-in">
            {/* App Logo */}
            <AppLogo />

            {/* Login Form */}
            <LoginForm />
          </div>

          {/* Footer */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-xs text-muted-foreground">
              © {new Date()?.getFullYear()} مدير الأرباح البحرية. جميع الحقوق محفوظة.
            </p>
            <p className="text-xs text-muted-foreground">
              Marine Profit Manager - Version 1.0.0
            </p>
          </div>
        </div>
      </div>
      {/* Loading Overlay */}
      <div id="loading-overlay" className="hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center">
        <div className="bg-card rounded-lg p-6 flex items-center space-x-4 rtl:space-x-reverse elevation-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
          <span className="text-foreground font-medium">جاري تسجيل الدخول...</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;