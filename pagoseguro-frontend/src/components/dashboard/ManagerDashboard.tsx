import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CreditCard,
  FileText,
  UserPlus,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar
} from 'lucide-react';
import { dashboardService } from '@/lib/dashboard.backend';
type User = {
  id: string;
  name: string;
};

interface ManagerDashboardProps {
  user: User;
  onNavigate: (section: string) => void;
}

export const ManagerDashboard = ({ user, onNavigate }: ManagerDashboardProps) => {
  const [statistics, setStatistics] = useState({
    totalClients: 0,
    newClientsThisMonth: 0,
    totalPortfolio: 0,
    monthlyCollection: 0,
    collectionsThisMonth: 0,
    delinquencyRate: 0,
    averageTicket: 0,
    profitThisMonth: 0,
    activeCredits: 0,
    topPerformingAssistant: '',
  });

  const [monthlyData, setMonthlyData] = useState<
    { month: string; collections: number; disbursements: number }[]
  >([]);

  const [creditDistribution, setCreditDistribution] = useState<
    { range: string; count: number; amount: number }[]
  >([]);

  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const loadManagerStats = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const [metricsRes, alertsRes] = await Promise.all([
        dashboardService.getManagerMetrics(token),
        dashboardService.getAlerts(token)
      ]);
      if (metricsRes.success && metricsRes.statistics) {
        setStatistics(metricsRes.statistics);
        setMonthlyData(metricsRes.monthlyData || []);
        setCreditDistribution(metricsRes.creditDistribution || []);
      }
      if (alertsRes.success && alertsRes.data) {
        setAlerts(alertsRes.data);
      }
    };
    loadManagerStats();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Fondo animado */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-600/5 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400/5 rounded-full animate-glow-pulse"></div>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Encabezado */}
        <div className="bg-gradient-hero p-6 rounded-lg shadow-glow text-white animate-slide-in-left">
          <h1 className="text-2xl font-bold mb-2">Panel de Gerencia</h1>
          <p className="opacity-90">Bienvenido, {user.name}. Aquí tienes el resumen ejecutivo del sistema.</p>
        </div>

        {/* Pestañas principales */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-green-50 border border-green-200">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Activity className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              Analíticas
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <PieChart className="h-4 w-4" />
              Portafolio
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Target className="h-4 w-4" />
              Rendimiento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in">
              <Card className="hover:shadow-lg transition-all duration-300 animate-scale-in border-green-100" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{statistics.totalClients}</div>
                  <p className="text-xs text-green-600">+{statistics.newClientsThisMonth} este mes</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 animate-scale-in border-green-100" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Créditos Activos</CardTitle>
                  <CreditCard className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{statistics.activeCredits}</div>
                  <p className="text-xs text-green-600">En curso</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 animate-scale-in border-green-100" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Portafolio Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">${statistics.totalPortfolio.toLocaleString()}</div>
                  <p className="text-xs text-green-600">Capital prestado</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 animate-scale-in border-green-100" style={{ animationDelay: '0.4s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Morosidad</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{statistics.delinquencyRate}%</div>
                  <p className="text-xs text-red-600">Requiere atención</p>
                </CardContent>
              </Card>
            </div>

            {/* Acciones rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in-right" style={{ animationDelay: '0.5s' }}>
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-green-100 animate-bounce-in" style={{ animationDelay: '0.6s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <span>Gestión de Créditos</span>
                  </CardTitle>
                  <CardDescription>Otorgar, modificar y supervisar créditos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => onNavigate('creditos')} className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:shadow-lg">
                    Administrar Créditos
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-green-100 animate-bounce-in" style={{ animationDelay: '0.7s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5 text-green-600" />
                    <span>Gestión de Usuarios</span>
                  </CardTitle>
                  <CardDescription>Registrar asistentes y gestionar accesos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => onNavigate('usuarios')} className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:shadow-lg">
                    Gestionar Usuarios
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-green-100 animate-bounce-in" style={{ animationDelay: '0.8s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span>Reportes</span>
                  </CardTitle>
                  <CardDescription>Generar reportes financieros y de gestión</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => onNavigate('reportes')} className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-300 hover:shadow-lg">
                    Ver Reportes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Gráfico de ingresos mensuales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 border-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Evolución Mensual
                  </CardTitle>
                  <CardDescription>Ingresos y desembolsos de los últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((data, index) => (
                      <div key={data.month} className="animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">{data.month}</span>
                          <span className="text-green-600">${data.collections.toLocaleString()}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-20">Ingresos:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${(data.collections / 60000) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-20">Préstamos:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${(data.disbursements / 60000) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Indicadores Clave
                  </CardTitle>
                  <CardDescription>Métricas de rendimiento empresarial</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Cobranza Mensual</span>
                      <span className="text-sm text-green-600">{statistics.collectionsThisMonth}%</span>
                    </div>
                    <Progress value={statistics.collectionsThisMonth} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Eficiencia Operativa</span>
                      <span className="text-sm text-blue-600">{100 - statistics.delinquencyRate}%</span>
                    </div>
                    <Progress value={100 - statistics.delinquencyRate} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Crecimiento Cliente</span>
                      <span className="text-sm text-purple-600">{statistics.totalClients > 0 ? Math.round((statistics.newClientsThisMonth / statistics.totalClients) * 100) : 0}%</span>
                    </div>
                    <Progress value={statistics.totalClients > 0 ? (statistics.newClientsThisMonth / statistics.totalClients) * 100 : 0} className="h-2" />
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ganancia del Mes:</span>
                      <span className="font-semibold text-green-700">${statistics.profitThisMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ticket Promedio:</span>
                      <span className="font-semibold">${statistics.averageTicket.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Mejor Asistente:</span>
                      <span className="font-semibold text-blue-600">{statistics.topPerformingAssistant}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Distribución de créditos */}
            <Card className="hover:shadow-lg transition-all duration-300 border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  Distribución del Portafolio
                </CardTitle>
                <CardDescription>Créditos por rango de monto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {creditDistribution.map((range, index) => (
                    <div key={range.range} className="animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{range.range}</span>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{range.count} créditos</div>
                          <div className="text-xs text-gray-600">${range.amount.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${(range.count / 45) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Rendimiento y objetivos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 border-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Objetivos del Mes
                  </CardTitle>
                  <CardDescription>Progreso hacia las metas establecidas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Cobranza Mensual</span>
                      <span className="text-sm text-green-600">${statistics.monthlyCollection.toLocaleString()}</span>
                    </div>
                    <Progress value={statistics.collectionsThisMonth} className="h-3" />
                    <p className="text-xs text-gray-600 mt-1">{statistics.collectionsThisMonth}% del objetivo mensual</p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Nuevos Clientes</span>
                      <span className="text-sm text-blue-600">{statistics.newClientsThisMonth} este mes</span>
                    </div>
                    <Progress value={statistics.totalClients > 0 ? (statistics.newClientsThisMonth / statistics.totalClients) * 100 : 0} className="h-3" />
                    <p className="text-xs text-gray-600 mt-1">{statistics.newClientsThisMonth} de {statistics.totalClients} clientes totales</p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Tasa de Morosidad</span>
                      <span className="text-sm text-red-600">{statistics.delinquencyRate}%</span>
                    </div>
                    <Progress value={100 - statistics.delinquencyRate} className="h-3" />
                    <p className="text-xs text-gray-600 mt-1">{statistics.delinquencyRate < 5 ? 'Dentro del objetivo' : 'Requiere mejora'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-green-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Alertas y Recordatorios
                  </CardTitle>
                  <CardDescription>Tareas pendientes importantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No hay alertas activas</p>
                    ) : alerts.map((alert, index) => (
                      <div
                        key={alert.id || index}
                        className={`flex items-center justify-between p-3 ${alert.severity === 'Crítico' ? 'bg-red-50 border border-red-200' : alert.severity === 'Alto' ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'} rounded-lg`}
                      >
                        <div>
                          <p className={`text-sm font-medium ${alert.severity === 'Crítico' ? 'text-red-800' : alert.severity === 'Alto' ? 'text-yellow-800' : 'text-blue-800'}`}>{alert.name}</p>
                          <p className={`text-xs ${alert.severity === 'Crítico' ? 'text-red-600' : alert.severity === 'Alto' ? 'text-yellow-600' : 'text-blue-600'}`}>{alert.details}</p>
                        </div>
                        <Badge className={alert.severity === 'Crítico' ? 'bg-red-100 text-red-800 border-red-200' : alert.severity === 'Alto' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-blue-100 text-blue-800 border-blue-200'}>{alert.severity}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};