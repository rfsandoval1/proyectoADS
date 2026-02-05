import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, CreditCard, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { creditService } from '@/lib/credits.backend';
import { userService } from '@/lib/users.backend';
import { paymentService } from '@/lib/payments.backend';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  name: string;
  cedula: string;
  token: string;
};

interface CreditManagementProps {
  user: User;
}

interface CreditData {
  id: string;
  clientId: string;
  clientName: string;
  clientCedula: string;
  amount: number;
  term: number;
  interestRate: number;
  status: 'active' | 'completed' | 'defaulted';
  createdDate: string;
  monthlyPayment: number;
  paidInstallments: number;
  remainingBalance: number;
}

export const CreditManagement = ({ user }: CreditManagementProps) => {
  const [credits, setCredits] = useState<CreditData[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isGrantingCredit, setIsGrantingCredit] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditTerm, setCreditTerm] = useState('');
  const [interestRate, setInterestRate] = useState('12');
  const [observations, setObservations] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setCredits([]);
      setClients([]);
      return;
    }

    try {
      const allClients = await userService.listUsers(token);
      const allCredits = await creditService.getAllCredits(token);
      const allPayments = await creditService.getAllPayments(token);

      // Asegúrate de que sean arrays
      if (!Array.isArray(allClients) || !Array.isArray(allCredits) || !Array.isArray(allPayments)) {
        setCredits([]);
        setClients([]);
        return;
      }

      const creditData: CreditData[] = allCredits.map(credit => {
        const client = allClients.find(c => c.id === credit.userId);
        const clientPayments = allPayments.filter(p => p.userId === credit.userId && p.status?.toLowerCase() === 'paid');
        const monthlyPayment = credit.term ? credit.amount / credit.term : credit.amount;
        const paidInstallments = clientPayments.length;
        const remainingBalance = credit.amount - (paidInstallments * monthlyPayment);

        return {
          id: credit.id,
          clientId: credit.userId,
          clientName: client?.fullName || 'Cliente no encontrado',
          clientCedula: client?.cedula || '',
          amount: credit.amount,
          term: credit.term || 12,
          interestRate: credit.interestRate || 12,
          status: credit.status?.toLowerCase(),
          createdDate: credit.createdAt ? new Date(credit.createdAt).toISOString().split('T')[0] : '',
          monthlyPayment,
          paidInstallments,
          remainingBalance: Math.max(0, remainingBalance)
        };
      });

      setCredits(creditData);
      setClients(allClients);
    } catch (error) {
      setCredits([]);
      setClients([]);
    }
  };

  const filteredCredits = credits.filter(credit => {
    const matchesSearch = credit.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credit.clientCedula.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || credit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const grantCredit = async () => {
    if (!selectedClient || !creditAmount || !creditTerm) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const client = clients.find(c => c.id === selectedClient);
    if (!client) {
      toast({
        title: "Error",
        description: "Cliente no encontrado",
        variant: "destructive"
      });
      return;
    }

    const hasActiveCredit = credits.some(c => c.clientId === selectedClient && c.status === 'active');
    if (hasActiveCredit) {
      toast({
        title: "Error",
        description: "El cliente ya tiene un crédito activo",
        variant: "destructive"
      });
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const result = await creditService.grantCredit({
      clientId: selectedClient,
      amount: parseFloat(creditAmount),
      term: parseInt(creditTerm),
      interestRate: parseFloat(interestRate),
      observations
    }, token);

    if (!result.success) {
      toast({
        title: "Error",
        description: result.message || "Error al otorgar crédito",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Crédito Otorgado",
      description: `Crédito de $${creditAmount} otorgado exitosamente a ${client.fullName}`,
      variant: "default"
    });

    setSelectedClient('');
    setCreditAmount('');
    setCreditTerm('');
    setObservations('');
    setIsGrantingCredit(false);
    
    loadData();
  };

  const getStats = () => {
    const totalCredits = credits.length;
    const activeCredits = credits.filter(c => c.status === 'active').length;
    const totalAmount = credits.reduce((sum, c) => sum + c.amount, 0);
    const pendingAmount = credits
      .filter(c => c.status === 'active')
      .reduce((sum, c) => sum + c.remainingBalance, 0);
    
    return { totalCredits, activeCredits, totalAmount, pendingAmount };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-hero p-6 rounded-lg shadow-glow text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">Gestión de Créditos</h1>
        <p className="opacity-90">Administre el otorgamiento y seguimiento de créditos a clientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Créditos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCredits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Activos</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.activeCredits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total Otorgado</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${stats.totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">${stats.pendingAmount.toFixed(2)}</div>
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
                placeholder="Buscar por cliente o cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="overdue">En mora</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isGrantingCredit} onOpenChange={setIsGrantingCredit}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Otorgar Crédito
                </Button>
              </DialogTrigger>
<DialogContent className="max-w-md">
  <DialogHeader>
    <DialogTitle>Otorgar Nuevo Crédito</DialogTitle>
    <DialogDescription>
      Complete la información para otorgar un crédito a un cliente
    </DialogDescription>
  </DialogHeader>
  <div className="space-y-4">
    <div>
      <Label htmlFor="client">Cliente</Label>
      <Select value={selectedClient} onValueChange={setSelectedClient}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar cliente" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.fullName} - {client.cedula}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label htmlFor="amount">Monto del Crédito</Label>
      <Input
        id="amount"
        type="number"
        placeholder="0.00"
        value={creditAmount}
        onChange={(e) => setCreditAmount(e.target.value)}
      />
    </div>

    <div>
      <Label htmlFor="term">Plazo (meses)</Label>
      <Input
        id="term"
        type="number"
        placeholder="Ej. 12"
        value={creditTerm}
        onChange={(e) => setCreditTerm(e.target.value)}
      />
    </div>

    <div>
      <Label htmlFor="interest">Tasa de Interés (%)</Label>
      <Input
        id="interest"
        type="number"
        step="0.1"
        value={interestRate}
        onChange={(e) => setInterestRate(e.target.value)}
      />
    </div>

    <div>
      <Label htmlFor="observations">Observaciones</Label>
      <Textarea
        id="observations"
        placeholder="Observaciones adicionales..."
        value={observations}
        onChange={(e) => setObservations(e.target.value)}
      />
    </div>

    <div className="flex gap-2">
      <Button onClick={grantCredit} className="flex-1">
        Otorgar Crédito
      </Button>
      <Button variant="outline" onClick={() => setIsGrantingCredit(false)}>
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
          <CardTitle>Lista de Créditos</CardTitle>
          <CardDescription>
            {filteredCredits.length} crédito(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Plazo</TableHead>
                  <TableHead>Cuota Mensual</TableHead>
                  <TableHead>Cuotas Pagadas</TableHead>
                  <TableHead>Saldo Restante</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCredits.map((credit) => (
                  <TableRow key={credit.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{credit.clientName}</div>
                        <div className="text-sm text-muted-foreground">{credit.clientCedula}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${credit.amount.toFixed(2)}</TableCell>
                    <TableCell>{credit.term} meses</TableCell>
                    <TableCell>${credit.monthlyPayment.toFixed(2)}</TableCell>
                    <TableCell>{credit.paidInstallments}/{credit.term}</TableCell>
                    <TableCell className="font-semibold">${credit.remainingBalance.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          credit.status === 'active' ? 'success' :
                          credit.status === 'paid' ? 'secondary' :
                          credit.status === 'overdue' ? 'destructive' :
                          'outline'
                        }
                      >
                        {credit.status === 'active' ? 'Activo' :
                         credit.status === 'paid' ? 'Pagado' :
                         credit.status === 'overdue' ? 'En mora' :
                         credit.status === 'cancelled' ? 'Cancelado' : credit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{credit.createdDate}</TableCell>
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