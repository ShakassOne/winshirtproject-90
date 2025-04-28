
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      // Try to get the saved theme from localStorage
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      
      // If no theme is saved, use the system preference
      if (!savedTheme) {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? 'dark' : 'light';
      }
      
      return savedTheme || 'dark';
    }
    return 'dark';
  });
  
  // Function to toggle the theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  // Apply the theme when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      localStorage.setItem('theme', theme);
    }
  }, [theme]);
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={toggleTheme} 
        variant="outline" 
        size="icon" 
        className="rounded-full bg-winshirt-space-light border border-winshirt-purple/30"
      >
        {theme === 'dark' ? (
          <Moon className="h-[1.2rem] w-[1.2rem] text-blue-200" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400" />
        )}
        <span className="sr-only">
          {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        </span>
      </Button>
    </div>
  );
};

export default ThemeToggle;
