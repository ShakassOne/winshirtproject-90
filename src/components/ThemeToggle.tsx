
import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ThemeToggleProps {
  className?: string;
}

type ThemeType = 'light' | 'dark';
type BackgroundType = 'solid' | 'gradient';

interface ThemeSettings {
  theme: ThemeType;
  backgroundType: {
    light: BackgroundType;
    dark: BackgroundType;
  };
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
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

  // Get background type from localStorage or default
  const getInitialBackgroundType = (): { light: BackgroundType; dark: BackgroundType } => {
    const savedSettings = localStorage.getItem('themeSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        return {
          light: parsedSettings.backgroundType?.light || 'solid',
          dark: parsedSettings.backgroundType?.dark || 'gradient'
        };
      } catch (e) {
        console.error('Error parsing theme settings', e);
      }
    }
    
    return {
      light: 'solid',
      dark: 'gradient'
    };
  };

  const [theme, setTheme] = useState<ThemeType>(getInitialTheme);
  const [backgroundType, setBackgroundType] = useState<{
    light: BackgroundType;
    dark: BackgroundType;
  }>(getInitialBackgroundType);

  // Apply theme when component mounts and when theme changes
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
    
    // Apply proper background class based on current theme and its background type
    const bgClass = theme === 'dark' 
      ? (backgroundType.dark === 'gradient' ? 'bg-theme-gradient' : 'bg-theme-solid')
      : (backgroundType.light === 'gradient' ? 'bg-theme-gradient' : 'bg-theme-solid');
      
    // Remove all theme background classes first
    document.body.classList.remove(
      'bg-theme-solid', 
      'bg-theme-gradient'
    );
    
    // Add the current background class
    document.body.classList.add(bgClass);
    
    // Save settings to localStorage
    const settings: ThemeSettings = {
      theme,
      backgroundType
    };
    localStorage.setItem('themeSettings', JSON.stringify(settings));
  }, [theme, backgroundType]);

  // Apply theme on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    const savedSettings = localStorage.getItem('themeSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        if (parsedSettings.backgroundType) {
          setBackgroundType(parsedSettings.backgroundType);
        }
      } catch (e) {
        console.error('Error parsing theme settings', e);
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };
  
  const updateBackgroundType = (themeKey: ThemeType, type: BackgroundType) => {
    setBackgroundType(prev => ({
      ...prev,
      [themeKey]: type
    }));
  };
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-50 rounded-full bg-winshirt-space/80 backdrop-blur-sm border border-winshirt-purple/30 ${className}`}
      >
        {theme === 'dark' ? (
          <Sun className="h-6 w-6 text-yellow-400" />
        ) : (
          <Moon className="h-6 w-6 text-winshirt-purple" />
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-16 z-50 rounded-full bg-winshirt-space/80 backdrop-blur-sm border border-winshirt-purple/30"
      >
        <Sun className="h-6 w-6 text-winshirt-purple-light" />
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-winshirt-space border-winshirt-purple/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-winshirt-blue-light">Personnalisation du thème</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Light Theme Settings */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-winshirt-blue-light">Thème clair</h3>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-winshirt-space-light">
                <Label htmlFor="light-background" className="text-lg">Arrière-plan avec dégradé</Label>
                <Switch
                  id="light-background"
                  checked={backgroundType.light === 'gradient'}
                  onCheckedChange={(checked) => 
                    updateBackgroundType('light', checked ? 'gradient' : 'solid')
                  }
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="bg-white h-24 rounded-lg flex items-center justify-center cursor-pointer border-2 transition-all"
                  onClick={() => updateBackgroundType('light', 'solid')}
                  style={{ borderColor: backgroundType.light === 'solid' ? '#7E69AB' : 'transparent' }}
                >
                  <span className="text-black font-medium">Couleur unie</span>
                </div>
                <div 
                  className="bg-gradient-to-br from-gray-100 to-gray-200 h-24 rounded-lg flex items-center justify-center cursor-pointer border-2 transition-all"
                  onClick={() => updateBackgroundType('light', 'gradient')}
                  style={{ borderColor: backgroundType.light === 'gradient' ? '#7E69AB' : 'transparent' }}
                >
                  <span className="text-black font-medium">Dégradé</span>
                </div>
              </div>
            </div>
            
            {/* Dark Theme Settings */}
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-winshirt-blue-light">Thème sombre</h3>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-winshirt-space-light">
                <Label htmlFor="dark-background" className="text-lg">Arrière-plan avec dégradé</Label>
                <Switch
                  id="dark-background"
                  checked={backgroundType.dark === 'gradient'}
                  onCheckedChange={(checked) => 
                    updateBackgroundType('dark', checked ? 'gradient' : 'solid')
                  }
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="bg-black h-24 rounded-lg flex items-center justify-center cursor-pointer border-2 transition-all"
                  onClick={() => updateBackgroundType('dark', 'solid')}
                  style={{ borderColor: backgroundType.dark === 'solid' ? '#7E69AB' : 'transparent' }}
                >
                  <span className="text-white font-medium">Couleur unie</span>
                </div>
                <div 
                  className="bg-gradient-to-br from-winshirt-space to-purple-900 h-24 rounded-lg flex items-center justify-center cursor-pointer border-2 transition-all"
                  onClick={() => updateBackgroundType('dark', 'gradient')}
                  style={{ borderColor: backgroundType.dark === 'gradient' ? '#7E69AB' : 'transparent' }}
                >
                  <span className="text-white font-medium">Dégradé</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              className="bg-winshirt-purple hover:bg-winshirt-purple-dark text-lg"
              onClick={() => setIsOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ThemeToggle;
