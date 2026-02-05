import { useEffect, useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Navbar } from '@/components/layout/Navbar';
import { ClientDashboard } from '@/components/dashboard/ClientDashboard';
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard';
import { AssistantDashboard } from '@/components/dashboard/AssistantDashboard';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { ClientCreditsView } from '@/components/credits/ClientCreditsView';
import { CertificatesView } from '@/components/certificates/CertificatesView';
import { DelinquencyReports } from '@/components/reports/DelinquencyReports';
import { ClientSearch } from '@/components/clients/ClientSearch';
import { PaymentReports } from '@/components/reports/PaymentReports';
import { CreditManagement } from '@/components/credits/CreditManagement';
import { UserManagement } from '@/components/users/UserManagement';
import { SystemAudit } from '@/components/audit/SystemAudit';
import { authService } from '@/lib/auth.backend';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authService.getCurrentUser(token).then((response) => {
        if (response?.success && response.user?.id) {
          setUser(response.user);
        }
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLoginSuccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const response = await authService.getCurrentUser(token);
      console.log('Usuario recibido tras login:', response);
      if (response?.success && response.user?.id) {
        setUser(response.user);
        setCurrentSection('dashboard');
      } else {
        console.warn('No se recibió un usuario válido tras login:', response);
      }
    } else {
      console.warn('No se encontró accessToken tras login');
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      await authService.logout(token);
      localStorage.removeItem('accessToken');
    }
    setUser(null);
    setCurrentSection('dashboard');
  };

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
  };

  const renderContent = () => {
    if (!user) return null;

    switch (currentSection) {
      case 'dashboard':
        if (user.role === 'cliente') {
          return <ClientDashboard user={user} onNavigate={handleNavigate} />;
        } else if (user.role === 'gerente') {
          return <ManagerDashboard user={user} onNavigate={handleNavigate} />;
        } else if (user.role === 'asistente') {
          return <AssistantDashboard user={user} onNavigate={handleNavigate} />;
        } else {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Rol desconocido</h2>
              <p className="text-muted-foreground">
                No se reconoce el rol de usuario. Contacte a soporte.
              </p>
            </div>
          );
        }

      case 'pagos':
        if (user.role === 'cliente') {
          return <PaymentForm user={user} />;
        }
        break;

      case 'mis-creditos':
        if (user.role === 'cliente') {
          return <ClientCreditsView user={user} onNavigate={handleNavigate} />;
        }
        break;

      case 'certificados':
        if (user.role === 'cliente') {
          return <CertificatesView user={user} />;
        }
        break;

      case 'creditos':
        if (user.role === 'gerente') {
          return <CreditManagement user={user} />;
        }
        break;

      case 'usuarios':
        if (user.role === 'gerente') {
          return <UserManagement user={user} />;
        }
        break;

      case 'reportes':
        if (user.role === 'gerente' || user.role === 'asistente') {
          return <PaymentReports user={user} />;
        }
        break;

      case 'reportes-morosidad':
        if (user.role === 'asistente') {
          return <DelinquencyReports user={user} />;
        }
        break;

      case 'clientes':
        if (user.role === 'asistente' || user.role === 'gerente') {
          return <ClientSearch user={user} />;
        }
        break;

      case 'auditoria':
        if (user.role === 'gerente') {
          return <SystemAudit user={user} />;
        }
        break;

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Sección no encontrada</h2>
            <p className="text-muted-foreground">
              La sección solicitada no existe o no tiene permisos para acceder.
            </p>
          </div>
        );
    }

    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
        <p className="text-muted-foreground">
          No tiene permisos para acceder a esta sección.
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginForm 
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthMode('register')}
      />
    ) : (
      <RegisterForm 
        onRegisterSuccess={() => setAuthMode('login')}
        onSwitchToLogin={() => setAuthMode('login')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentSection={currentSection}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;