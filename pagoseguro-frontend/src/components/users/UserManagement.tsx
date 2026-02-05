import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Users, UserPlus, Shield, AlertCircle } from 'lucide-react';
import { authService } from '@/lib/auth.backend';
import { userService } from '@/lib/users.backend';
import { User as UserType } from '@/lib/users.backend';
import { useToast } from '@/hooks/use-toast';

interface UserManagementProps {
  user: UserType;
}

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'cliente' | 'asistente' | 'gerente';
  status: 'active' | 'inactive';
  registrationDate: string;
  lastLogin?: string;
}

export const UserManagement = ({ user }: UserManagementProps) => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const data = await userService.getAllUsers(token);
    const mapped = Array.isArray(data) ? data.map((u: any) => ({
      id: u.id,
      name: u.fullName || '',
      email: u.email,
      role: (u.role || '').toLowerCase(),
      status: (u.status || '').toLowerCase(),
      registrationDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
      lastLogin: u.lastLogin ? new Date(u.lastLogin).toISOString().split('T')[0] : undefined
    })) : [];
    setUsers(mapped);
  };

  // Asegúrate de que users es un array antes de usar .filter
  const filteredUsers = Array.isArray(users)
    ? users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const registerAssistant = async () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    // Validaciones
    if (newUserName.length < 3 || newUserName.length > 50) {
      toast({
        title: "Error",
        description: "El nombre debe tener entre 3 y 50 caracteres",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      toast({
        title: "Error",
        description: "Por favor ingrese un correo electrónico válido",
        variant: "destructive"
      });
      return;
    }

    if (newUserPassword.length < 8) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 8 caracteres",
        variant: "destructive"
      });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*])/;
    if (!passwordRegex.test(newUserPassword)) {
      toast({
        title: "Error",
        description: "La contraseña no es segura. Intente con una más fuerte.",
        variant: "destructive"
      });
      return;
    }

    // Verificar si el correo ya existe
    const existingUser = users.find(u => u.email.toLowerCase() === newUserEmail.toLowerCase());
    if (existingUser) {
      toast({
        title: "Error",
        description: "El correo ingresado ya está registrado. Intente con otro.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await authService.registerAssistant({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword
      }, user);

      if (result.success) {
        toast({
          title: "Asistente Registrado",
          description: `El asistente ${newUserName} ha sido registrado exitosamente`,
          variant: "default"
        });

        // Limpiar formulario
        setNewUserName('');
        setNewUserEmail('');
        setNewUserPassword('');
        setIsAddingUser(false);
        
        // Recargar usuarios
        loadUsers();
      } else {
        toast({
          title: "Error",
          description: result.message || "Error al registrar el asistente",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error en el registro. Intente nuevamente más tarde.",
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    const newStatus = targetUser.status === 'active' ? 'INACTIVE' : 'ACTIVE';
    const result = await userService.updateUser(userId, { status: newStatus }, token);
    if (result.success) {
      toast({
        title: "Estado Actualizado",
        description: `El usuario ha sido ${newStatus === 'ACTIVE' ? 'activado' : 'desactivado'}`,
        variant: "default"
      });
      loadUsers();
    } else {
      toast({
        title: "Error",
        description: result.message || "Error al actualizar estado",
        variant: "destructive"
      });
    }
  };

  const getStats = () => {
    const safeUsers = Array.isArray(users) ? users : [];
    const totalUsers = safeUsers.length;
    const activeUsers = safeUsers.filter(u => u.status === 'active').length;
    const clients = safeUsers.filter(u => u.role === 'cliente').length;
    const assistants = safeUsers.filter(u => u.role === 'asistente').length;
    
    return { totalUsers, activeUsers, clients, assistants };
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'gerente': return 'destructive';
      case 'asistente': return 'warning';
      case 'cliente': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'gerente': return 'Gerente';
      case 'asistente': return 'Asistente';
      case 'cliente': return 'Cliente';
      default: return role;
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-hero p-6 rounded-lg shadow-glow text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">Gestión de Usuarios</h1>
        <p className="opacity-90">Administre usuarios del sistema y registre nuevos asistentes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <UserPlus className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.clients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistentes</CardTitle>
            <Shield className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.assistants}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros y Acciones</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, correo o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Registrar Asistente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Asistente</DialogTitle>
                  <DialogDescription>
                    Complete la información para registrar un nuevo asistente administrativo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      placeholder="Nombre del asistente"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Contraseña Inicial</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Contraseña segura"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un símbolo
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={registerAssistant} className="flex-1">
                      Registrar Asistente
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {filteredUsers.length} usuario(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((systemUser) => (
                  <TableRow key={systemUser.id}>
                    <TableCell className="font-medium">{systemUser.name}</TableCell>
                    <TableCell>{systemUser.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleColor(systemUser.role) as any}>
                        {getRoleLabel(systemUser.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={systemUser.status === 'active' ? 'success' : 'secondary'}>
                        {systemUser.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{systemUser.registrationDate}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {systemUser.lastLogin || 'Nunca'}
                    </TableCell>
                    <TableCell>
                      {systemUser.role !== 'gerente' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(systemUser.id)}
                        >
                          {systemUser.status === 'active' ? 'Desactivar' : 'Activar'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};