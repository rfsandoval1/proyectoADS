import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  History,
  Upload
} from 'lucide-react';
import { creditService } from '@/lib/credits.backend';
import { paymentService } from '@/lib/payments.backend';
import { PaymentHistory } from '@/components/payments/PaymentHistory';
import { PaymentVoucherUpload } from '@/components/vouchers/PaymentVoucherUpload';
import { VoucherHistory } from '@/components/vouchers/VoucherHistory';

type User = {
  id: string | number;
  name: string;
};

interface ClientDashboardProps {
  user: User;
  onNavigate: (section: string) => void;
}

export const ClientDashboard = ({ user, onNavigate }: ClientDashboardProps) => {
  const [credits, setCredits] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const loadClientData = async () => {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (token) {
        const [clientCredits, myPayments] = await Promise.all([
          creditService.getClientCredits(token),
          paymentService.getMyPayments(token)
        ]);
        const enrichedCredits = Array.isArray(clientCredits) ? clientCredits.map((credit: any) => {
          const creditPayments = Array.isArray(myPayments)
            ? myPayments.filter((p: any) => p.creditId === credit.id && p.status?.toLowerCase() === 'paid')
            : [];
          const monthlyPayment = credit.term ? credit.amount / credit.term : credit.amount;
          const paidTotal = creditPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
          return {
            ...credit,
            monthlyPayment,
            remainingBalance: Math.max(0, credit.amount - paidTotal),
            termMonths: credit.term || 12,
            startDate: credit.createdAt,
            status: credit.status?.toLowerCase()
          };
        }) : [];
        setCredits(enrichedCredits);
        setPendingPayments(Array.isArray(myPayments) ? myPayments.filter((p: any) => p.status?.toLowerCase() === 'pending') : []);
      }
      setLoading(false);
    };
    loadClientData();
  }, [user.id]);


  const activeCredit = credits.find(credit => credit.status === 'active');
  const totalDebt = activeCredit ? activeCredit.remainingBalance : 0;
  const nextPayment = pendingPayments
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const clientCreditsFromPayments = credits;

  return (
    <div className="min-h-screen bg-white">
      {/* Fondo animado */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-600/5 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400/5 rounded-full animate-glow-pulse"></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Encabezado de bienvenida */}
        <div className="bg-granito-hero p-6 rounded-lg shadow-elegant text-black animate-slide-in-left">
          <h1 className="text-2xl font-bold mb-2">¡Bienvenido, {user.name}!</h1>
          <p className="opacity-90">
            Gestiona tus créditos y pagos de manera fácil y segura
          </p>
        </div>

        {/* Pestañas principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-green-50 border border-green-200">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <CreditCard className="h-4 w-4" />
              Créditos
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Upload className="h-4 w-4" />
              Comprobantes
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in">
              <Card className="card-granito-gradient hover-granito-glow hover:shadow-lg transition-all duration-300 animate-scale-in border-green-100" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-granito-green-700">Crédito Activo</CardTitle>
                  <CreditCard className="h-4 w-4 text-granito-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-granito-green-800">
                    {clientCreditsFromPayments.length > 0 ? '$' + clientCreditsFromPayments[0].amount.toLocaleString() : 'Sin crédito'}
                  </div>
                  <p className="text-xs text-granito-green-600">
                    {clientCreditsFromPayments.length > 0 ? `${clientCreditsFromPayments[0].termMonths} meses` : 'No hay crédito activo'}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-granito-gradient hover-granito-glow hover:shadow-lg transition-all duration-300 animate-scale-in border-green-100" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-granito-green-700">Saldo Pendiente</CardTitle>
                  <DollarSign className="h-4 w-4 text-granito-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ${clientCreditsFromPayments.length > 0 ? clientCreditsFromPayments[0].remainingBalance.toLocaleString() : '0'}
                  </div>
                  <p className="text-xs text-granito-green-600">
                    {clientCreditsFromPayments.length > 0 ? `Pagado: $${(clientCreditsFromPayments[0].amount - clientCreditsFromPayments[0].remainingBalance).toLocaleString()}` : 'Sin deuda'}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-granito-gradient hover-granito-glow hover:shadow-lg transition-all duration-300 animate-scale-in border-green-100" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-granito-green-700">Próximo Pago</CardTitle>
                  <Calendar className="h-4 w-4 text-granito-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {clientCreditsFromPayments.length > 0 ? '$' + clientCreditsFromPayments[0].monthlyPayment.toLocaleString() : '-'}
                  </div>
                  <p className="text-xs text-green-600">
                    {clientCreditsFromPayments.length > 0 ? 'Mensual' : 'Sin pagos pendientes'}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 animate-scale-in border-green-100" style={{ animationDelay: '0.4s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Progreso</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {clientCreditsFromPayments.length > 0 
                      ? Math.round(((clientCreditsFromPayments[0].amount - clientCreditsFromPayments[0].remainingBalance) / clientCreditsFromPayments[0].amount) * 100)
                      : 0
                    }%
                  </div>
                  <p className="text-xs text-green-600">Completado</p>
                </CardContent>
              </Card>
            </div>

            {/* Progreso del crédito */}
            {clientCreditsFromPayments.length > 0 && (
              <Card className="hover:shadow-lg transition-all duration-300 border-green-100 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <CardHeader>
                  <CardTitle>Progreso del Crédito</CardTitle>
                  <CardDescription>
                    Estado actual de su crédito y pagos realizados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Pagado: ${(clientCreditsFromPayments[0].amount - clientCreditsFromPayments[0].remainingBalance).toLocaleString()}</span>
                      <span>Total: ${clientCreditsFromPayments[0].amount.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={((clientCreditsFromPayments[0].amount - clientCreditsFromPayments[0].remainingBalance) / clientCreditsFromPayments[0].amount) * 100} 
                      className="h-2 animate-scale-in" 
                      style={{ animationDelay: '0.6s' }}
                    />
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Inicio: {new Date(clientCreditsFromPayments[0].startDate).toLocaleDateString()}</span>
                      <span>Cuota mensual: ${clientCreditsFromPayments[0].monthlyPayment.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Acciones rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in-right" style={{ animationDelay: '0.7s' }}>
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-green-100 animate-bounce-in" style={{ animationDelay: '0.8s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5 text-green-600" />
                    <span>Subir Comprobante</span>
                  </CardTitle>
                  <CardDescription>
                    Registre su comprobante de pago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setActiveTab('vouchers')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:shadow-lg"
                  >
                    Subir Comprobante
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-green-100 animate-bounce-in" style={{ animationDelay: '0.9s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-green-600" />
                    <span>Historial de Pagos</span>
                  </CardTitle>
                  <CardDescription>
                    Consulte todos sus pagos realizados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setActiveTab('payments')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:shadow-lg"
                  >
                    Ver Historial
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-green-100 animate-bounce-in" style={{ animationDelay: '1s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-green-600" />
                    <span>Certificados</span>
                  </CardTitle>
                  <CardDescription>
                    Genere certificados de pago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => onNavigate('certificados')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:shadow-lg"
                  >
                    Generar Certificados
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-green-100 animate-bounce-in" style={{ animationDelay: '1.1s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <span>Mis Créditos</span>
                  </CardTitle>
                  <CardDescription>
                    Vea el detalle de sus créditos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setActiveTab('credits')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:shadow-lg"
                  >
                    Ver Créditos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="credits" className="space-y-6">
            {/* Información detallada de créditos */}
            {clientCreditsFromPayments.length > 0 ? (
              <div className="grid gap-6">
                {clientCreditsFromPayments.map((credit, index) => (
                  <Card key={credit.id} className="hover:shadow-lg transition-all duration-300 border-green-100 animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-green-600" />
                        Crédito {credit.id}
                      </CardTitle>
                      <CardDescription>{credit.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Monto Original</p>
                          <p className="text-xl font-semibold text-green-700">${credit.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Saldo Pendiente</p>
                          <p className="text-xl font-semibold text-red-600">${credit.remainingBalance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Cuota Mensual</p>
                          <p className="text-xl font-semibold">${credit.monthlyPayment.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tasa de Interés</p>
                          <p className="text-xl font-semibold">{credit.interestRate}%</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <Badge className="bg-green-100 text-green-800">
                            {credit.status === 'active' ? 'Activo' : 'Completado'}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            Plazo: {credit.termMonths} meses
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="hover:shadow-lg transition-all duration-300 border-green-100">
                <CardContent className="text-center py-8">
                  <CreditCard className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tiene créditos activos</h3>
                  <p className="text-gray-600">Póngase en contacto con nuestro equipo para solicitar un crédito</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="vouchers" className="space-y-6">
            {clientCreditsFromPayments.length > 0 ? (
              <>
                <PaymentVoucherUpload
                  creditId={clientCreditsFromPayments[0].id}
                  onSuccess={() => {
                    // Recargar datos si es necesario
                  }}
                />
                <VoucherHistory creditId={clientCreditsFromPayments[0].id} />
              </>
            ) : (
              <Card className="border-green-200">
                <CardContent className="text-center py-8">
                  <Upload className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tiene créditos activos</h3>
                  <p className="text-gray-600">Necesita un crédito activo para registrar comprobantes de pago</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payments">
            <PaymentHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};