import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/Navbar";
import { LoginPage } from "@/components/auth/LoginPage";
import { RegisterLeaderPage } from "@/components/auth/RegisterLeaderPage";
import { RegisterAdminPage } from "@/components/auth/RegisterAdminPage";
import { LeaderDashboard } from "@/components/dashboards/LeaderDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { OrdersPage } from "@/components/orders/OrdersPage";
import { LeadersPage } from "@/components/leaders/LeadersPage";
import { ArtisanRecordsPage } from "@/components/artisans/ArtisanRecordsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

const AuthenticatedApp = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register-leader" element={<RegisterLeaderPage />} />
        <Route path="/register-admin" element={<RegisterAdminPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Navigate 
            to={user.role === 'leader' ? '/leader-dashboard' : '/admin-dashboard'} 
            replace 
          />
        } 
      />
      <Route 
        path="/leader-dashboard" 
        element={
          <ProtectedRoute>
            <LeaderDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/leaders" 
        element={
          <ProtectedRoute>
            <LeadersPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/artisan-records" 
        element={
          <ProtectedRoute>
            <ArtisanRecordsPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register-leader" element={<Navigate to="/" replace />} />
      <Route path="/register-admin" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthenticatedApp />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
