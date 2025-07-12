import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'leader' | 'admin';
  phone?: string;
  village?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerLeader: (data: { name: string; email: string; phone: string; password: string }) => Promise<boolean>;
  registerAdmin: (data: { username: string; email: string; password: string; adminKey: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Mock admin key for demo purposes
  const ADMIN_KEY = 'ARTISAN_ADMIN_2024';

  useEffect(() => {
    // Check for stored user data on app start
    const storedUser = localStorage.getItem('artisan_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    const mockUsers = [
      {
        id: '1',
        name: 'Priya Sharma',
        email: 'priya@artisan.org',
        role: 'leader' as const,
        phone: '+91 98765 43210',
        village: 'Jodhpur Village'
      },
      {
        id: '2',
        name: 'Admin User',
        email: 'admin@artisan.org',
        role: 'admin' as const
      }
    ];

    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password123') {
      setUser(foundUser);
      localStorage.setItem('artisan_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('artisan_user');
  };

  const registerLeader = async (data: { name: string; email: string; phone: string; password: string }): Promise<boolean> => {
    // Mock registration - in real app, this would call an API
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: 'leader',
      phone: data.phone,
      village: 'New Village'
    };
    
    setUser(newUser);
    localStorage.setItem('artisan_user', JSON.stringify(newUser));
    return true;
  };

  const registerAdmin = async (data: { username: string; email: string; password: string; adminKey: string }): Promise<boolean> => {
    // Check admin key
    if (data.adminKey !== ADMIN_KEY) {
      return false;
    }

    // Mock registration - in real app, this would call an API
    const newUser: User = {
      id: Date.now().toString(),
      name: data.username,
      email: data.email,
      role: 'admin'
    };
    
    setUser(newUser);
    localStorage.setItem('artisan_user', JSON.stringify(newUser));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, registerLeader, registerAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};