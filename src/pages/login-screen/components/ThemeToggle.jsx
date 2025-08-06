import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
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

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card elevation-1 transition-all duration-300"
        aria-label={isDarkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
      >
        <Icon 
          name={isDarkMode ? 'Sun' : 'Moon'} 
          size={20} 
          className={`transition-all duration-300 ${isDarkMode ? 'text-amber-500 rotate-0' : 'text-slate-600 rotate-180'}`}
        />
      </Button>
    </div>
  );
};

export default ThemeToggle;