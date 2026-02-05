import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  User, 
  CreditCard, 
  FileText, 
  Users, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { authService, User as UserType } from '@/lib/auth';
import logo from '@/assets/el-granito-logo.png';

interface NavbarProps {
  user: UserType;
  onLogout: () => void;
  onNavigate: (section: string) => void;
  currentSection: string;
}

export const Navbar = ({ user, onLogout, onNavigate, currentSection }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getMenuItems = () => {
    const common = [
      { id: 'dashboard', label: 'Dashboard', icon: User },
    ];

    switch (user.role) {
      case 'cliente':
        return [
          ...common,
          { id: 'mis-creditos', label: 'Mis Créditos', icon: CreditCard },
          { id: 'pagos', label: 'Realizar Pago', icon: FileText },
          { id: 'certificados', label: 'Certificados', icon: FileText },
        ];
      case 'asistente':
        return [
          ...common,
          { id: 'reportes-morosidad', label: 'Morosidad', icon: FileText },
          { id: 'clientes', label: 'Clientes', icon: Users },
        ];
      case 'gerente':
        return [
          ...common,
          { id: 'creditos', label: 'Gestión Créditos', icon: CreditCard },
          { id: 'usuarios', label: 'Usuarios', icon: Users },
          { id: 'reportes', label: 'Reportes', icon: FileText },
          { id: 'auditoria', label: 'Auditoría', icon: Settings },
        ];
      default:
        return common;
    }
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <nav className="navbar-granito shadow-elegant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          {/* Logo y nombre */}
          <div className="flex items-center">
            <img src={logo} alt="El Granito" className="h-24 w-24 mr-3 object-contain" />
          </div>

          {/* Menú desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentSection === item.id ? "default" : "ghost"}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 transition-all duration-300 ${
                    currentSection === item.id 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'text-green-700 hover:bg-green-50 hover:text-green-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Usuario y logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <User className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">{user.name}</span>
              <span className="text-xs text-green-600 capitalize">
                ({user.role})
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 border-green-500 text-green-700 hover:bg-green-500 hover:text-white transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </Button>

            {/* Botón menú móvil */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-green-600 hover:bg-green-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-green-200 bg-green-50">
              <div className="flex items-center space-x-2 mb-4 px-3 py-2">
                <User className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">{user.name}</span>
                <span className="text-xs text-green-600 capitalize">
                  ({user.role})
                </span>
              </div>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentSection === item.id ? "default" : "ghost"}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full justify-start flex items-center space-x-2 transition-all duration-300 ${
                      currentSection === item.id 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'text-green-700 hover:bg-green-100 hover:text-green-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};