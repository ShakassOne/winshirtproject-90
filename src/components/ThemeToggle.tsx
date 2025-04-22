
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ThemeType = 'light' | 'dark';

const ThemeToggle: React.FC = () => {
  // Get theme from localStorage if available, otherwise use system preference or default to dark
  const getInitialTheme = (): ThemeType => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme as ThemeType;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    return 'dark'; // Default to dark theme
  };

  const [theme, setTheme] = useState<ThemeType>(getInitialTheme);

  // Apply theme when component mounts and when theme changes
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
    
    // Apply background and text colors based on theme
    if (theme === 'light') {
      document.body.style.backgroundColor = '#FFFFFF';
      document.body.style.color = '#000000';
    } else {
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#FFFFFF';
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 rounded-full bg-winshirt-space/80 backdrop-blur-sm border border-winshirt-purple/30"
    >
      {theme === 'dark' ? (
        <Sun className="h-6 w-6 text-yellow-400" />
      ) : (
        <Moon className="h-6 w-6 text-winshirt-purple" />
      )}
    </Button>
  );
};

export default ThemeToggle;
