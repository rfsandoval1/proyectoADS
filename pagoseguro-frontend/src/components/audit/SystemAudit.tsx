import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, FileDown, Calendar as CalendarIcon, Shield, Activity, Users, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { dashboardService } from '@/lib/dashboard.backend';

interface User {
  id: string;
  name: string;
  role: string;
}

interface SystemAuditProps {
  user: User;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  timestamp: string;
  ipAddress: string;
  details: string;
  status: 'success' | 'error' | 'warning';
}

export const SystemAudit = ({ user }: SystemAuditProps) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [auditLogs, searchTerm, userFilter, moduleFilter, statusFilter, startDate, endDate]);

  const loadAuditLogs = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await dashboardService.getAuditLogs(token);
      if (response.success && response.data) {
        setAuditLogs(response.data);
      } else {
        setAuditLogs([]);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setAuditLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = auditLogs;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por usuario
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.userId === userFilter);
    }

    // Filtro por módulo
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(log => log.module === moduleFilter);
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Filtro por rango de fechas
    if (startDate && endDate) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
      });
    }

    setFilteredLogs(filtered);
  };

  // Función para generar PDF usando window.print
  const generateAuditPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para generar el PDF');
      return;
    }

    const stats = getStats();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Auditoría del Sistema</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0 0 0; opacity: 0.9; }
          .stats { display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; }
          .stat-box { flex: 1; min-width: 150px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
          .stat-box.primary { border-color: #6366f1; }
          .stat-box.success { border-color: #10b981; }
          .stat-box.error { border-color: #ef4444; }
          .stat-box.warning { border-color: #f59e0b; }
          .stat-number { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
          .stat-number.primary { color: #6366f1; }
          .stat-number.success { color: #10b981; }
          .stat-number.error { color: #ef4444; }
          .stat-number.warning { color: #f59e0b; }
          .stat-label { font-size: 11px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          th { background-color: #6366f1; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .status-success { background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
          .status-error { background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
          .status-warning { background: #f59e0b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; }
          .summary { margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #6366f1; text-align: center; color: #64748b; }
          .details-cell { max-width: 200px; word-wrap: break-word; font-size: 10px; }
          @media print {
            .stats { flex-direction: column; }
            .stat-box { margin-bottom: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛡️ REPORTE DE AUDITORÍA DEL SISTEMA</h1>
          <p>Sistema de Gestión de Créditos</p>
          <p>Fecha: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="stats">
          <div class="stat-box primary">
            <div class="stat-number primary">${stats.totalLogs}</div>
            <div class="stat-label">TOTAL REGISTROS</div>
          </div>
          <div class="stat-box primary">
            <div class="stat-number primary">${stats.uniqueUsers}</div>
            <div class="stat-label">USUARIOS ACTIVOS</div>
          </div>
          <div class="stat-box success">
            <div class="stat-number success">${stats.successLogs}</div>
            <div class="stat-label">ACCIONES EXITOSAS</div>
          </div>
          <div class="stat-box error">
            <div class="stat-number error">${stats.errorLogs}</div>
            <div class="stat-label">ERRORES</div>
          </div>
          <div class="stat-box warning">
            <div class="stat-number warning">${stats.warningLogs}</div>
            <div class="stat-label">ADVERTENCIAS</div>
          </div>
        </div>

        <div class="summary">
          <h3>Resumen del Reporte de Auditoría</h3>
          <p><strong>Período analizado:</strong> ${startDate && endDate ? 
            `${format(startDate, 'dd/MM/yyyy', { locale: es })} - ${format(endDate, 'dd/MM/yyyy', { locale: es })}` : 
            'Todos los registros'}</p>
          <p><strong>Filtros aplicados:</strong> ${[
            userFilter !== 'all' ? `Usuario: ${getUniqueUsers().find(u => u.id === userFilter)?.name}` : '',
            moduleFilter !== 'all' ? `Módulo: ${moduleFilter}` : '',
            statusFilter !== 'all' ? `Estado: ${statusFilter}` : '',
            searchTerm ? `Búsqueda: ${searchTerm}` : ''
          ].filter(Boolean).join(', ') || 'Ninguno'}</p>
          <p><strong>Total de registros mostrados:</strong> ${filteredLogs.length}</p>
        </div>

        <h2>📋 Detalle de Registros de Auditoría</h2>
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Módulo</th>
              <th>Fecha y Hora</th>
              <th>IP</th>
              <th>Estado</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLogs.map(log => `
              <tr>
                <td>${log.userName}</td>
                <td>${log.action}</td>
                <td>${log.module}</td>
                <td>${log.timestamp}</td>
                <td style="font-family: monospace; font-size: 10px;">${log.ipAddress}</td>
                <td>
                  <span class="status-${log.status}">
                    ${log.status === 'success' ? 'Éxito' : log.status === 'error' ? 'Error' : 'Advertencia'}
                  </span>
                </td>
                <td class="details-cell">${log.details}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Documento generado automáticamente - ${new Date().toLocaleString('es-ES')}</p>
          <p>Sistema de Gestión de Créditos - Reporte de Auditoría</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 100);
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Función para exportar a Excel (CSV mejorado)
  const exportAuditToExcel = () => {
    const headers = [
      'Usuario',
      'Acción',
      'Módulo',
      'Fecha y Hora',
      'Dirección IP',
      'Estado',
      'Detalles'
    ];

    const csvRows = [
      headers.join(','),
      ...filteredLogs.map(log => [
        `"${log.userName}"`,
        `"${log.action}"`,
        `"${log.module}"`,
        `"${log.timestamp}"`,
        `"${log.ipAddress}"`,
        `"${log.status === 'success' ? 'Éxito' : log.status === 'error' ? 'Error' : 'Advertencia'}"`,
        `"${log.details.replace(/"/g, '""')}"`
      ].join(','))
    ];

    // Agregar resumen al final
    const stats = getStats();
    csvRows.push('');
    csvRows.push('RESUMEN DEL REPORTE DE AUDITORÍA');
    csvRows.push(`Total de Registros,${stats.totalLogs}`);
    csvRows.push(`Usuarios Activos,${stats.uniqueUsers}`);
    csvRows.push(`Acciones Exitosas,${stats.successLogs}`);
    csvRows.push(`Errores,${stats.errorLogs}`);
    csvRows.push(`Advertencias,${stats.warningLogs}`);
    csvRows.push(`Fecha de Generación,"${new Date().toLocaleDateString('es-ES')}"`);
    csvRows.push(`Período Analizado,"${startDate && endDate ? 
      `${format(startDate, 'dd/MM/yyyy', { locale: es })} - ${format(endDate, 'dd/MM/yyyy', { locale: es })}` : 
      'Todos los registros'}"`);

    const csvContent = csvRows.join('\n');
    
    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-auditoria-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUniqueUsers = () => {
    const users = Array.from(new Set(auditLogs.map(log => log.userId)))
      .map(userId => {
        const log = auditLogs.find(l => l.userId === userId);
        return { id: userId, name: log?.userName || 'Usuario desconocido' };
      });
    return users;
  };

  const getUniqueModules = () => {
    return Array.from(new Set(auditLogs.map(log => log.module)));
  };

  const getStats = () => {
    const totalLogs = filteredLogs.length;
    const successLogs = filteredLogs.filter(log => log.status === 'success').length;
    const errorLogs = filteredLogs.filter(log => log.status === 'error').length;
    const warningLogs = filteredLogs.filter(log => log.status === 'warning').length;
    const uniqueUsers = new Set(filteredLogs.map(log => log.userId)).size;
    
    return { totalLogs, successLogs, errorLogs, warningLogs, uniqueUsers };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-lg shadow-lg text-white">
        <h1 className="text-2xl font-bold mb-2">🛡️ Auditoría del Sistema</h1>
        <p className="opacity-90">Registro detallado de todas las acciones realizadas en el sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.uniqueUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acciones Exitosas</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successLogs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errores</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errorLogs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advertencias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warningLogs}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Auditoría</CardTitle>
          <CardDescription>
            Filtre los registros de auditoría por diferentes criterios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar en registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {getUniqueUsers().map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los módulos</SelectItem>
                {getUniqueModules().map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="success">Éxito</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Advertencia</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'dd/MM/yyyy', { locale: es }) : 'Fecha inicial'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'dd/MM/yyyy', { locale: es }) : 'Fecha final'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date > new Date() || (startDate && date < startDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={generateAuditPDF}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <FileDown className="h-4 w-4" />
              Exportar PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportAuditToExcel}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Auditoría</CardTitle>
          <CardDescription>
            {filteredLogs.length} registro(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando registros de auditoría...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay registros de auditoría disponibles</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.userName}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.module}</TableCell>
                      <TableCell className="text-sm">{log.timestamp}</TableCell>
                      <TableCell className="text-sm font-mono">{log.ipAddress}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === 'success' ? 'default' :
                            log.status === 'error' ? 'destructive' : 'outline'
                          }
                          className={
                            log.status === 'success' ? 'bg-green-500 hover:bg-green-600' :
                            log.status === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''
                          }
                        >
                          {log.status === 'success' ? 'Éxito' :
                           log.status === 'error' ? 'Error' : 'Advertencia'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={log.details}>
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};