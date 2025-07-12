import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const languages = [
    { code: 'en' as Language, name: 'English' },
    { code: 'hi' as Language, name: 'हिन्दी' },
    { code: 'mw' as Language, name: 'मारवाड़ी' }
  ];

  if (!user) return null;

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary">
              Artisan Manager
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/orders" 
              className="text-foreground hover:text-primary transition-colors"
            >
              {t('orders')}
            </Link>
            {user.role === 'admin' && (
              <Link 
                to="/leaders" 
                className="text-foreground hover:text-primary transition-colors"
              >
                {t('leaders')}
              </Link>
            )}
            <Link 
              to={user.role === 'leader' ? '/leader-dashboard' : '/admin-dashboard'} 
              className="text-foreground hover:text-primary transition-colors"
            >
              {t('dashboard')}
            </Link>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">Change language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? 'bg-accent' : ''}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-3">
              <span className="hidden sm:block text-sm text-muted-foreground">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-9 w-9 p-0"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">{t('logout')}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex justify-center space-x-6">
            <Link 
              to="/orders" 
              className="text-sm text-foreground hover:text-primary transition-colors"
            >
              {t('orders')}
            </Link>
            {user.role === 'admin' && (
              <Link 
                to="/leaders" 
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                {t('leaders')}
              </Link>
            )}
            <Link 
              to={user.role === 'leader' ? '/leader-dashboard' : '/admin-dashboard'} 
              className="text-sm text-foreground hover:text-primary transition-colors"
            >
              {t('dashboard')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};