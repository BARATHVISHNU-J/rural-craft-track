import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

export const RegisterAdminPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    adminKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { registerAdmin } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await registerAdmin(formData);
      if (success) {
        toast.success('Admin registration successful!');
        navigate('/admin-dashboard');
      } else {
        toast.error('Invalid admin key or registration failed');
      }
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Artisan Manager</h1>
          <p className="text-muted-foreground mt-2">Admin Registration</p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('registerAdmin')}</CardTitle>
            <CardDescription>
              Create your admin account with valid admin key
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('username')}</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminKey">{t('adminKey')}</Label>
                <Input
                  id="adminKey"
                  type="password"
                  value={formData.adminKey}
                  onChange={(e) => handleChange('adminKey', e.target.value)}
                  placeholder="Enter admin verification key"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('loading') : t('register')}
              </Button>
            </form>

            {/* Demo Info */}
            <div className="mt-6 p-3 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Demo Admin Key:</h4>
              <p className="text-xs font-mono">ARTISAN_ADMIN_2024</p>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  {t('login')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};