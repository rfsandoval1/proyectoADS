import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, User, CreditCard, Calendar } from 'lucide-react';
import { creditService } from '@/lib/credits.backend';
import { dashboardService } from '@/lib/dashboard.backend';
import { User as UserType } from '@/lib/auth';

interface ClientSearchProps {
  user: UserType;
}

interface ClientData {
  id: string;
  name: string;
  cedula: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  registrationDate: string;
  totalCredits: number;
  activeCredits: number;
  totalPayments: number;
  lastPaymentDate: string;
}

export const ClientSearch = ({ user }: ClientSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientesBase, setClientesBase] = useState<ClientData[]>([]);
  const [searchResults, setSearchResults] = useState<ClientData[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagosQuemados, setPagosQuemados] = useState<any[]>([]); // Cambiado a any[] por ahora

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // CORRECCIÓN: Obtener el token desde localStorage
        const token = localStorage.getItem('accessToken');
        
        console.log('🔐 Token from localStorage:', token ? 'exists' : 'MISSING');
        
        if (!token) {
          setError('No se encontró token de autenticación. Por favor, inicie sesión nuevamente.');
          setLoading(false);
          return;
        }
        
        const response = await creditService.getClients(token);
        
        console.log('📦 Response received:', response);
        
        if (response.success && response.data) {
          setClientesBase(response.data);
          setSearchResults(response.data);
        } else {
          setClientesBase([]);
          setSearchResults([]);
        }
      } catch (error) {
        console.error('❌ Error fetching clients:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar clientes');
        setClientesBase([]);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []); // Removido user?.authToken de las dependencias

  const searchClients = () => {
    if (!searchTerm.trim()) {
      setSearchResults(clientesBase);
      return;
    }

    const filteredResults = clientesBase.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cedula.includes(searchTerm)
    );
    setSearchResults(filteredResults);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchClients();
  };

  const selectClient = (client: ClientData) => {
    setSelectedClient(client);
  };

  const renderPaymentStatus = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'overdue':
        return 'Vencido';
      default:
        return 'Desconocido';
    }
  };

  useEffect(() => {
    const fetchRecentPayments = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No authentication token found. Please log in.');
          return;
        }

        // Usar el servicio de dashboard para obtener todos los pagos
        const response = await dashboardService.getPaymentsReport(token);

        if (response.success && response.data) {
          // Filtrar pagos del cliente seleccionado
          const clientPayments = response.data
            .filter((payment: any) => payment.clientId === selectedClient?.id)
            .map((payment: any, index: number) => ({
              id: payment.invoiceNumber || `PAY-${String(index + 1).padStart(3, '0')}`,
              installmentNumber: index + 1,
              date: payment.date,
              amount: payment.amount,
              status: payment.status?.toLowerCase() || 'pending',
              method: payment.method || 'No especificado'
            }));
          setPagosQuemados(clientPayments);
        } else {
          setPagosQuemados([]);
        }
      } catch (error) {
        console.error('Error fetching recent payments:', error);
        setPagosQuemados([]);
      }
    };

    if (selectedClient) {
      fetchRecentPayments();
    }
  }, [selectedClient]);

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Mostrar error si no hay token
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-hero p-6 rounded-lg shadow-glow text-primary-foreground">
          <h1 className="text-2xl font-bold mb-2">Consulta de Clientes</h1>
          <p className="opacity-90">Buscar información completa de clientes registrados</p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">⚠️ {error}</div>
              <Button onClick={() => window.location.href = '/login'}>
                Ir a Iniciar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-hero p-6 rounded-lg shadow-glow text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">Consulta de Clientes</h1>
        <p className="opacity-90">Buscar información completa de clientes registrados</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Búsqueda de Cliente</CardTitle>
          <CardDescription>
            Ingrese nombre, cédula o RUC para buscar un cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, cédula o RUC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">
                Buscar
              </Button>
            </div>
          </form>

          {searchResults.length === 0 && searchTerm && (
            <div className="text-center py-8 text-muted-foreground">
              Los datos ingresados no corresponden a ningún cliente existente
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Resultados de Búsqueda ({searchResults.length})</h3>
              <div className="grid gap-4">
                {searchResults.map((client) => (
                  <Card key={client.id} className="cursor-pointer hover:shadow-card transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{client.name}</h4>
                            <Badge variant={client.status === 'active' ? 'success' : 'secondary'}>
                              {client.status === 'active' ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>Cédula/RUC: {client.cedula}</div>
                            <div>Créditos Activos: {client.activeCredits}</div>
                            <div>Total Pagos: {client.totalPayments}</div>
                            <div>Último Pago: {client.lastPaymentDate}</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => selectClient(client)}>
                          Ver Detalles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedClient && (
        <Card>
          <CardHeader>
            <CardTitle>Información Detallada del Cliente</CardTitle>
            <CardDescription>
              Datos completos y historial de {selectedClient.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Datos Personales
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Nombre:</strong> {selectedClient.name}</div>
                  <div><strong>Cédula/RUC:</strong> {selectedClient.cedula}</div>
                  <div><strong>Correo:</strong> {selectedClient.email}</div>
                  <div><strong>Teléfono:</strong> {selectedClient.phone}</div>
                  <div><strong>Dirección:</strong> {selectedClient.address}</div>
                  <div><strong>Fecha de Registro:</strong> {selectedClient.registrationDate}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Resumen Financiero
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Total Créditos:</strong> {selectedClient.totalCredits}</div>
                  <div><strong>Créditos Activos:</strong> {selectedClient.activeCredits}</div>
                  <div><strong>Total Pagos Realizados:</strong> {selectedClient.totalPayments}</div>
                  <div><strong>Último Pago:</strong> {selectedClient.lastPaymentDate}</div>
                  <div>
                    <strong>Estado:</strong>
                    <Badge variant={selectedClient.status === 'active' ? 'success' : 'secondary'} className="ml-2">
                      {selectedClient.status === 'active' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4" />
                Historial de Pagos Recientes
              </h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Factura</TableHead>
                      <TableHead>Cuota</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Interés</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Método</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagosQuemados.map((payment) => {
                      const isOverdue = payment.status === 'overdue';
                      const interest = isOverdue ? (payment.amount * 0.05).toFixed(2) : '0.00';

                      return (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.id}</TableCell>
                          <TableCell>{payment.installmentNumber ?? '-'}</TableCell>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>${interest}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === 'paid'
                                  ? 'success'
                                  : payment.status === 'pending'
                                  ? 'warning'
                                  : 'destructive'
                              }
                            >
                              {renderPaymentStatus(payment.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{payment.method}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};