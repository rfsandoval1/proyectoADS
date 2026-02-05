import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Calendar, 
  DollarSign,
  Percent,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { creditService } from '@/lib/credits.backend';
import { paymentService } from '@/lib/payments.backend';

interface Payment {
  id: string;
  creditId: string;
  amount: number;
  status: string;
  paidDate?: string;
}

interface Credit {
  id: string;
  amount: number;
  totalPaid: number;
  remainingBalance: number;
  interestRate: number;
  startDate: string;
  term: number;
  monthlyPayment: number;
  status: string;
  description?: string;
}

interface User {
  id: string;
}

interface ClientCreditsViewProps {
  user: User;
  onNavigate: (section: string) => void;
}

export const ClientCreditsView = ({ user, onNavigate }: ClientCreditsViewProps) => {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClientData = async () => {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (token) {
        const [clientCredits, myPayments] = await Promise.all([
          creditService.getClientCredits(token),
          paymentService.getMyPayments(token)
        ]);
        const normalizedPayments: Payment[] = Array.isArray(myPayments) ? myPayments.map((p: any) => ({
          ...p,
          status: p.status?.toLowerCase()
        })) : [];

        const enrichedCredits: Credit[] = Array.isArray(clientCredits) ? clientCredits.map((credit: any) => {
          const creditPaid = normalizedPayments.filter(p => p.creditId === credit.id && p.status === 'paid');
          const totalPaid = creditPaid.reduce((sum, p) => sum + (p.amount || 0), 0);
          const monthlyPayment = credit.term ? credit.amount / credit.term : credit.amount;
          return {
            ...credit,
            totalPaid,
            remainingBalance: Math.max(0, credit.amount - totalPaid),
            monthlyPayment,
            startDate: credit.createdAt,
            status: credit.status?.toLowerCase()
          };
        }) : [];

        setCredits(enrichedCredits);
        setPayments(normalizedPayments);
      }
      setLoading(false);
    };
    loadClientData();
  }, [user.id]);

  const getPaymentsForCredit = (creditId: string) => {
    return payments.filter(p => p.creditId === creditId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (credits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No tiene créditos registrados</h2>
        <p className="text-muted-foreground text-center mb-6">
          Actualmente no tiene créditos activos o completados en el sistema.
        </p>
        <Button onClick={() => onNavigate('dashboard')} variant="gradient">
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Créditos</h1>
          <p className="text-muted-foreground">
            Consulte el estado y condiciones de sus créditos
          </p>
        </div>
        <Button onClick={() => onNavigate('pagos')} variant="gradient">
          Realizar Pago
        </Button>
      </div>

      {credits.map((credit) => {
        const creditPayments = getPaymentsForCredit(credit.id);
        const paidPayments = creditPayments.filter(p => p.status === 'paid');
        const pendingPayments = creditPayments.filter(p => p.status === 'pending');
        const overduePayments = creditPayments.filter(p => p.status === 'overdue');
        const progress = (credit.totalPaid / credit.amount) * 100;

        return (
          <Card key={credit.id} className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle>Crédito #{credit.id.slice(-6).toUpperCase()}</CardTitle>
                    <CardDescription>
                      Iniciado el {new Date(credit.startDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={credit.status === 'active' ? 'default' : 
                          credit.status === 'completed' ? 'success' : 'destructive'}
                >
                  {credit.status === 'active' ? 'Activo' : 
                   credit.status === 'completed' ? 'Completado' : 'En Mora'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información principal del crédito */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Monto Original</p>
                  <p className="text-xl font-bold">${credit.amount.toLocaleString()}</p>
                </div>
                
                <div className="text-center p-4 bg-success/5 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Pagado</p>
                  <p className="text-xl font-bold text-success">${credit.totalPaid.toLocaleString()}</p>
                </div>
                
                <div className="text-center p-4 bg-warning/5 rounded-lg">
                  <Clock className="h-6 w-6 text-warning mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                  <p className="text-xl font-bold text-warning">${credit.remainingBalance.toLocaleString()}</p>
                </div>
                
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <Percent className="h-6 w-6 text-accent mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Tasa de Interés</p>
                  <p className="text-xl font-bold">{credit.interestRate}%</p>
                </div>
              </div>

              {/* Progreso del crédito */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progreso del pago</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Inicio: {new Date(credit.startDate).toLocaleDateString()}</span>
                  <span>Plazo: {credit.term} meses</span>
                  <span>Cuota: ${credit.monthlyPayment.toLocaleString()}</span>
                </div>
              </div>

              {/* Resumen de pagos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border border-success/20 bg-success/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Pagos Realizados</p>
                  <p className="text-2xl font-bold text-success">{paidPayments.length}</p>
                </div>
                
                <div className="text-center p-3 border border-warning/20 bg-warning/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Pagos Pendientes</p>
                  <p className="text-2xl font-bold text-warning">{pendingPayments.length}</p>
                </div>
                
                <div className="text-center p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Pagos Vencidos</p>
                  <p className="text-2xl font-bold text-destructive">{overduePayments.length}</p>
                </div>
              </div>

              {/* Próximos pagos */}
              {pendingPayments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Próximos Pagos</span>
                  </h4>
                  <div className="space-y-2">
                    {pendingPayments.slice(0, 3).map((payment) => (
                      <div 
                        key={payment.id} 
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">${payment.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            Vence: {new Date(payment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={payment.status === 'overdue' ? 'destructive' : 'outline'}>
                          {payment.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex space-x-3">
                <Button 
                  onClick={() => onNavigate('pagos')} 
                  className="flex-1"
                  variant="gradient"
                  disabled={credit.status !== 'active'}
                >
                  Realizar Pago
                </Button>
                <Button 
                  onClick={() => onNavigate('certificados')} 
                  variant="secondary"
                  className="flex-1"
                >
                  Generar Certificado
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};