import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, FileDown, CalendarIcon, Filter, TrendingUp, Download, FileSpreadsheet, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { dashboardService } from '@/lib/dashboard.backend';

interface User {
  id: string;
  name: string;
  role: string;
}

interface PaymentReportsProps {
  user: User;
}

interface Client {
  id: string;
  name: string;
  cedula: string;
  plazoMeses: number;
  interesMora: number;
}

interface Payment {
  id: string;
  clientId: string;
  date: string;
  amount: number;
  method: string;
  status: string;
}

interface PaymentReport {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientId: string;
  date: string;
  amount: number;
  method: string;
  status: string;
  plazoMeses?: number;
  interesMora?: number;
}

export const PaymentReports = ({ user }: PaymentReportsProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentReport[]>([]);
  const [reportType, setReportType] = useState<'client' | 'dateRange' | 'allClients'>('client');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reportData, setReportData] = useState<PaymentReport[]>([]);
  const [filteredData, setFilteredData] = useState<PaymentReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos reales del backend al montar el componente
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const [paymentsRes, clientsRes] = await Promise.all([
          dashboardService.getPaymentsReport(token),
          dashboardService.getClients(token),
        ]);

        if (paymentsRes.success && paymentsRes.data) {
          setAllPayments(paymentsRes.data);
        }

        if (clientsRes.success && clientsRes.data) {
          const formattedClients = clientsRes.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            cedula: c.cedula || '',
            plazoMeses: 12,
            interesMora: 2.5,
          }));
          setClients(formattedClients);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    filterData();
  }, [reportData, methodFilter, statusFilter]);

  const generateClientReport = () => {
    if (!searchTerm.trim()) {
      alert('Por favor ingrese el nombre o cédula del cliente');
      return;
    }

    setIsGenerating(true);
    
    const client = clients.find(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cedula.includes(searchTerm)
    );

    if (!client) {
      setTimeout(() => {
        setIsGenerating(false);
        setReportData([]);
        alert('Los datos ingresados no corresponden a ningún cliente existente');
      }, 500);
      return;
    }

    const clientPayments = allPayments
      .filter(p => p.clientId === client.id)
      .map(payment => ({
        id: payment.id,
        invoiceNumber: payment.invoiceNumber || `INV-${String(payment.id).slice(-3).toUpperCase()}`,
        clientName: client.name,
        clientId: client.id,
        date: payment.date,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        plazoMeses: payment.plazoMeses || client.plazoMeses,
        interesMora: payment.interesMora || client.interesMora
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTimeout(() => {
      setReportData(clientPayments);
      setIsGenerating(false);
    }, 800);
  };

  const generateDateRangeReport = () => {
    if (!startDate || !endDate) {
      alert('Por favor seleccione el rango de fechas');
      return;
    }

    if (startDate > endDate) {
      alert('El rango de fechas es incorrecto');
      return;
    }

    if (startDate > new Date()) {
      alert('El rango de fechas es incorrecto');
      return;
    }

    setIsGenerating(true);

    // Ajustar fechas para incluir todo el día
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dateRangePayments = allPayments
      .filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= startOfDay && paymentDate <= endOfDay;
      })
      .map(payment => {
        const client = clients.find(c => c.id === payment.clientId);
        return {
          id: payment.id,
          invoiceNumber: payment.invoiceNumber || `INV-${String(payment.id).slice(-3).toUpperCase()}`,
          clientName: payment.clientName || client?.name || 'Cliente no encontrado',
          clientId: payment.clientId,
          date: payment.date,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          plazoMeses: payment.plazoMeses || client?.plazoMeses,
          interesMora: payment.interesMora || client?.interesMora
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTimeout(() => {
      if (dateRangePayments.length === 0) {
        alert('No hay pagos de la fecha inicial a la fecha final');
      }
      setReportData(dateRangePayments);
      setIsGenerating(false);
    }, 800);
  };

  const generateAllClientsReport = () => {
    setIsGenerating(true);

    const allPaymentsData = allPayments
      .map(payment => {
        const client = clients.find(c => c.id === payment.clientId);
        return {
          id: payment.id,
          invoiceNumber: payment.invoiceNumber || `INV-${String(payment.id).slice(-3).toUpperCase()}`,
          clientName: payment.clientName || client?.name || 'Cliente no encontrado',
          clientId: payment.clientId,
          date: payment.date,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          plazoMeses: payment.plazoMeses || client?.plazoMeses,
          interesMora: payment.interesMora || client?.interesMora
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTimeout(() => {
      setReportData(allPaymentsData);
      setIsGenerating(false);
    }, 800);
  };

  const filterData = () => {
    let filtered = reportData;

    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => {
        const method = payment.method?.toLowerCase() || '';
        if (methodFilter === 'transferencia') {
          return method.includes('transferencia') || method.includes('pse');
        }
        if (methodFilter === 'efectivo') {
          return method.includes('efectivo') || method.includes('cash');
        }
        if (methodFilter === 'tarjeta') {
          return method.includes('tarjeta') || method.includes('card') || method.includes('credito') || method.includes('debito');
        }
        return method.includes(methodFilter);
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => {
        const status = payment.status?.toLowerCase() || '';
        if (statusFilter === 'overdue') {
          // Considerar como vencido: pagos pendientes con fecha > 30 días
          if (status === 'pending') {
            const paymentDate = new Date(payment.date);
            const today = new Date();
            const diffDays = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays > 30;
          }
          return status === 'overdue';
        }
        if (statusFilter === 'pending') {
          // Solo pendientes recientes (menos de 30 días)
          if (status === 'pending') {
            const paymentDate = new Date(payment.date);
            const today = new Date();
            const diffDays = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
          }
          return false;
        }
        return status === statusFilter;
      });
    }

    setFilteredData(filtered);
  };

  // Función para generar PDF profesional
  const generateProfessionalPDF = async () => {
    try {
      // Verificar si jsPDF ya está cargado
      if (!(window as any).jspdf) {
        // Cargar jsPDF desde CDN
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Verificar si autoTable ya está cargado
      if (!(window as any).jspdf?.jsPDF?.prototype?.autoTable) {
        await new Promise((resolve, reject) => {
          const autoTableScript = document.createElement('script');
          autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
          autoTableScript.onload = resolve;
          autoTableScript.onerror = reject;
          document.head.appendChild(autoTableScript);
        });
      }

      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let y = 20;

      // Función para verificar salto de página
      const checkPageBreak = (neededSpace: number) => {
        if (y + neededSpace > pageHeight - 30) {
          doc.addPage();
          y = 20;
          return true;
        }
        return false;
      };

      // Header con fondo azul elegante
      doc.setFillColor(59, 130, 246); // blue-600
      doc.rect(0, 0, pageWidth, 60, 'F');
      
      // Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE PAGOS', pageWidth / 2, 25, { align: 'center' });
      
      // Subtítulo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Gestión de Créditos', pageWidth / 2, 35, { align: 'center' });
      
      // Fecha del reporte
      const fechaActual = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Fecha del Reporte: ${fechaActual}`, pageWidth / 2, 45, { align: 'center' });

      y = 80;

      // Resumen ejecutivo
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN EJECUTIVO', margin, y);
      y += 15;

      // Estadísticas en cajas
      const totalPagos = filteredData.length;
      const montoTotal = getTotalAmount();
      const stats = getStatusStats();
      
      // Crear cajas de estadísticas
      const boxWidth = (pageWidth - 2 * margin - 20) / 3;
      const boxHeight = 25;
      
      // Caja 1: Total Pagos
      doc.setFillColor(34, 197, 94); // green-500
      doc.rect(margin, y, boxWidth, boxHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL PAGOS', margin + boxWidth/2, y + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.text(totalPagos.toString(), margin + boxWidth/2, y + 18, { align: 'center' });

      // Caja 2: Monto Total
      doc.setFillColor(59, 130, 246); // blue-600
      doc.rect(margin + boxWidth + 10, y, boxWidth, boxHeight, 'F');
      doc.setFontSize(10);
      doc.text('MONTO TOTAL (USD)', margin + boxWidth + 10 + boxWidth/2, y + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.text(`$${montoTotal.toFixed(2)}`, margin + boxWidth + 10 + boxWidth/2, y + 18, { align: 'center' });

      // Caja 3: Pagos Exitosos
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.rect(margin + 2 * boxWidth + 20, y, boxWidth, boxHeight, 'F');
      doc.setFontSize(10);
      doc.text('PAGOS EXITOSOS', margin + 2 * boxWidth + 20 + boxWidth/2, y + 8, { align: 'center' });
      doc.setFontSize(16);
      doc.text(stats.paid.toString(), margin + 2 * boxWidth + 20 + boxWidth/2, y + 18, { align: 'center' });

      y += 40;

      // Información adicional
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Pagos pendientes: ${stats.pending}`, margin, y);
      y += 8;
      doc.text(`• Pagos vencidos: ${stats.overdue}`, margin, y);
      y += 8;
      const reportTypeText = reportType === 'client' ? 'Por Cliente' : reportType === 'dateRange' ? 'Por Rango de Fechas' : 'Todos los Clientes';
      doc.text(`• Tipo de reporte: ${reportTypeText}`, margin, y);
      y += 20;

      checkPageBreak(40);

      // Título de la tabla
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLE DE PAGOS', margin, y);
      y += 15;

      // Preparar datos de la tabla
      const tableColumnHeaders = [
        'N° Factura',
        'Cliente',
        'Fecha',
        'Monto\n(USD)',
        'Método',
        'Estado',
        'Plazo\n(Meses)',
        'Interés\n(%)'
      ];

      const tableRows = filteredData.map((payment) => [
        payment.invoiceNumber,
        payment.clientName,
        payment.date,
        `$${payment.amount.toFixed(2)}`,
        payment.method.charAt(0).toUpperCase() + payment.method.slice(1),
        payment.status === 'paid' ? 'Pagado' : 
        payment.status === 'pending' ? 'Pendiente' : 'Vencido',
        payment.plazoMeses?.toString() ?? '-',
        payment.interesMora ? `${payment.interesMora.toFixed(1)}%` : '-'
      ]);

      // Generar tabla con autoTable
      doc.autoTable({
        startY: y,
        head: [tableColumnHeaders],
        body: tableRows,
        theme: 'striped',
        headStyles: { 
          fillColor: [59, 130, 246], // blue-600
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 4
        },
        bodyStyles: { 
          fontSize: 8,
          cellPadding: 3,
          halign: 'center'
        },
        alternateRowStyles: { fillColor: [248, 250, 252] }, // gray-50
        columnStyles: {
          0: { halign: 'center', cellWidth: 22 }, // N° Factura
          1: { halign: 'left', cellWidth: 35 }, // Cliente
          2: { halign: 'center', cellWidth: 22 }, // Fecha
          3: { halign: 'right', cellWidth: 20 }, // Monto
          4: { halign: 'center', cellWidth: 22 }, // Método
          5: { halign: 'center', cellWidth: 20 }, // Estado
          6: { halign: 'center', cellWidth: 15 }, // Plazo
          7: { halign: 'center', cellWidth: 15 } // Interés
        },
        margin: { left: margin, right: margin },
        didParseCell: function(data: any) {
          // Colorear según el estado
          if (data.section === 'body' && data.column.index === 5) {
            const estado = data.cell.text[0];
            switch (estado) {
              case 'Pagado':
                data.cell.styles.fillColor = [34, 197, 94]; // green-500
                data.cell.styles.textColor = [255, 255, 255];
                break;
              case 'Pendiente':
                data.cell.styles.fillColor = [245, 158, 11]; // amber-500
                data.cell.styles.textColor = [255, 255, 255];
                break;
              case 'Vencido':
                data.cell.styles.fillColor = [239, 68, 68]; // red-500
                data.cell.styles.textColor = [255, 255, 255];
                break;
            }
          }
        }
      });

      y = doc.lastAutoTable.finalY + 30;

      // Footer con firmas
      checkPageBreak(60);
      
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('VALIDACIONES', margin, y);
      y += 15;

      const firmaWidth = (pageWidth - 2 * margin - 20) / 2;
      
      // Firma 1
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('_'.repeat(30), margin, y);
      doc.text('Gerente de Créditos', margin, y + 8);
      doc.text('Aprobado por', margin, y + 16);

      // Firma 2
      doc.text('_'.repeat(30), margin + firmaWidth + 20, y);
      doc.text('Contador General', margin + firmaWidth + 20, y + 8);
      doc.text('Revisado por', margin + firmaWidth + 20, y + 16);

      // Pie de página en todas las páginas
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        doc.text('Documento generado automáticamente', margin, pageHeight - 10);
      }

      // Descargar PDF
      const fileName = `reporte-pagos-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    }
  };

  // Función alternativa para generar PDF usando window.print
  const generateSimplePDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para generar el PDF');
      return;
    }

    const reportTypeText = reportType === 'client' ? 'Por Cliente' : reportType === 'dateRange' ? 'Por Rango de Fechas' : 'Todos los Clientes';
    const stats = getStatusStats();
    const totalAmount = getTotalAmount();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Pagos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 5px 0 0 0; opacity: 0.9; }
          .stats { display: flex; gap: 20px; margin-bottom: 30px; }
          .stat-box { flex: 1; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; }
          .stat-box.green { border-color: #10b981; }
          .stat-box.blue { border-color: #3b82f6; }
          .stat-box.red { border-color: #ef4444; }
          .stat-number { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .stat-number.green { color: #10b981; }
          .stat-number.blue { color: #3b82f6; }
          .stat-number.red { color: #ef4444; }
          .stat-label { font-size: 12px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
          th { background-color: #3b82f6; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .status-paid { background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .status-pending { background: #f59e0b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .status-overdue { background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .summary { margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #3b82f6; text-align: center; color: #64748b; }
          @media print {
            .stats { flex-direction: column; }
            .stat-box { margin-bottom: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 REPORTE DE PAGOS</h1>
          <p>Sistema de Gestión de Créditos</p>
          <p>Fecha: ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="stats">
          <div class="stat-box green">
            <div class="stat-number green">${filteredData.length}</div>
            <div class="stat-label">TOTAL PAGOS</div>
          </div>
          <div class="stat-box blue">
            <div class="stat-number blue">${totalAmount.toFixed(2)}</div>
            <div class="stat-label">MONTO TOTAL (USD)</div>
          </div>
          <div class="stat-box green">
            <div class="stat-number green">${stats.paid}</div>
            <div class="stat-label">PAGOS EXITOSOS</div>
          </div>
          <div class="stat-box red">
            <div class="stat-number red">${stats.overdue}</div>
            <div class="stat-label">PAGOS VENCIDOS</div>
          </div>
        </div>

        <div class="summary">
          <h3>Resumen del Reporte</h3>
          <p><strong>Tipo de reporte:</strong> ${reportTypeText}</p>
          <p><strong>Pagos pendientes:</strong> ${stats.pending}</p>
          <p><strong>Total de registros:</strong> ${filteredData.length}</p>
        </div>

        <h2>📋 Detalle de Pagos</h2>
        <table>
          <thead>
            <tr>
              <th>N° Factura</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Monto (USD)</th>
              <th>Método</th>
              <th>Estado</th>
              <th>Plazo (Meses)</th>
              <th>Interés (%)</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map(payment => `
              <tr>
                <td>${payment.invoiceNumber}</td>
                <td>${payment.clientName}</td>
                <td>${payment.date}</td>
                <td>${payment.amount.toFixed(2)}</td>
                <td>${payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}</td>
                <td>
                  <span class="status-${payment.status}">
                    ${payment.status === 'paid' ? 'Pagado' : payment.status === 'pending' ? 'Pendiente' : 'Vencido'}
                  </span>
                </td>
                <td>${payment.plazoMeses ?? '-'}</td>
                <td>${payment.interesMora ? payment.interesMora.toFixed(1) + '%' : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Documento generado automáticamente - ${new Date().toLocaleString('es-ES')}</p>
          <p>Sistema de Gestión de Créditos</p>
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
  const exportToExcel = () => {
    const headers = [
      'Número de Factura',
      'Cliente',
      'Fecha',
      'Monto (USD)',
      'Método de Pago',
      'Estado',
      'Plazo (Meses)',
      'Interés (%)',
      'Tipo de Reporte'
    ];

    const csvRows = [
      headers.join(','),
      ...filteredData.map(payment => [
        `"${payment.invoiceNumber}"`,
        `"${payment.clientName}"`,
        payment.date,
        payment.amount.toFixed(2),
        `"${payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}"`,
        `"${payment.status === 'paid' ? 'Pagado' : payment.status === 'pending' ? 'Pendiente' : 'Vencido'}"`,
        payment.plazoMeses ?? '-',
        payment.interesMora ? payment.interesMora.toFixed(1) : '-',
        `"${reportType === 'client' ? 'Por Cliente' : reportType === 'dateRange' ? 'Por Rango de Fechas' : 'Todos los Clientes'}"`
      ].join(','))
    ];

    // Agregar resumen al final
    csvRows.push('');
    csvRows.push('RESUMEN DEL REPORTE');
    csvRows.push(`Total de Pagos,${filteredData.length}`);
    csvRows.push(`Monto Total,${getTotalAmount().toFixed(2)}`);
    csvRows.push(`Pagos Exitosos,${getStatusStats().paid}`);
    csvRows.push(`Pagos Pendientes,${getStatusStats().pending}`);
    csvRows.push(`Pagos Vencidos,${getStatusStats().overdue}`);
    csvRows.push(`Fecha de Generación,"${new Date().toLocaleDateString('es-ES')}"`);

    const csvContent = csvRows.join('\n');
    
    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte-pagos-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTotalAmount = () => {
    return filteredData.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getStatusStats = () => {
    const paid = filteredData.filter(p => p.status?.toLowerCase() === 'paid').length;
    let pending = 0;
    let overdue = 0;

    filteredData.forEach(p => {
      const status = p.status?.toLowerCase() || '';
      if (status === 'pending') {
        const paymentDate = new Date(p.date);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 30) {
          overdue++;
        } else {
          pending++;
        }
      } else if (status === 'overdue') {
        overdue++;
      }
    });

    return { paid, pending, overdue };
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg shadow-lg text-white">
        <h1 className="text-2xl font-bold mb-2">📊 Reportes de Pagos</h1>
        <p className="opacity-90">Genere reportes detallados de pagos por cliente o rango de fechas</p>
      </div>

      {/* Información de clientes disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes Disponibles</CardTitle>
          <CardDescription>
            Clientes registrados en el sistema para generar reportes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Cargando clientes...</div>
          ) : clients.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No hay clientes disponibles</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <div key={client.id} className="p-3 border rounded-lg">
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-muted-foreground">Cédula: {client.cedula}</div>
                  <div className="text-sm text-muted-foreground">Plazo: {client.plazoMeses} meses</div>
                  <div className="text-sm text-muted-foreground">Interés: {client.interesMora}%</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipo de Reporte</CardTitle>
          <CardDescription>
            Seleccione el tipo de reporte que desea generar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              variant={reportType === 'client' ? 'default' : 'outline'}
              onClick={() => setReportType('client')}
            >
              Reporte por Cliente
            </Button>
            <Button 
              variant={reportType === 'dateRange' ? 'default' : 'outline'}
              onClick={() => setReportType('dateRange')}
            >
              Reporte por Fechas
            </Button>
            <Button 
              variant={reportType === 'allClients' ? 'default' : 'outline'}
              onClick={() => setReportType('allClients')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Reporte de Todos los Clientes
            </Button>
          </div>

          {reportType === 'client' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o cédula del cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={generateClientReport} disabled={isGenerating || !searchTerm.trim()}>
                  {isGenerating ? 'Generando...' : 'Generar Reporte'}
                </Button>
              </div>
            </div>
          )}

          {reportType === 'dateRange' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Fecha Inicial</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
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
                </div>

                <div>
                  <label className="text-sm font-medium">Fecha Final</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
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

                <div className="flex items-end">
                  <Button onClick={generateDateRangeReport} disabled={isGenerating || !startDate || !endDate} className="w-full">
                    {isGenerating ? 'Generando...' : 'Generar Reporte'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {reportType === 'allClients' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Reporte Completo de Todos los Clientes</h3>
                <p className="text-sm text-blue-700">
                  Este reporte incluirá todos los pagos de todos los clientes registrados en el sistema.
                  Total de clientes: {clients.length}
                </p>
              </div>
              <div className="flex justify-start">
                <Button 
                  onClick={generateAllClientsReport} 
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <Users className="h-4 w-4" />
                  {isGenerating ? 'Generando Reporte...' : 'Generar Reporte Completo'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {reportData.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
                <FileDown className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${getTotalAmount().toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagos Exitosos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{getStatusStats().paid}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagos Vencidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{getStatusStats().overdue}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalle de Pagos</CardTitle>
              <CardDescription>
                Resultados del reporte generado ({filteredData.length} registros)
                {reportType === 'allClients' && (
                  <span className="ml-2 text-blue-600 font-medium">
                    - Reporte Completo de Todos los Clientes
                  </span>
                )}
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los métodos</SelectItem>
                      <SelectItem value="transferencia">Transferencia/PSE</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="paid">Pagado</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="overdue">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 ml-auto">
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={generateSimplePDF}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportToExcel}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Exportar Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Factura</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Plazo</TableHead>
                      <TableHead>Interés</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.invoiceNumber}</TableCell>
                        <TableCell>{payment.clientName}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                        <TableCell className="capitalize">{payment.method}</TableCell>
                        <TableCell>
                          {(() => {
                            const status = payment.status?.toLowerCase() || '';
                            let isOverdue = false;
                            if (status === 'pending') {
                              const paymentDate = new Date(payment.date);
                              const today = new Date();
                              const diffDays = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
                              isOverdue = diffDays > 30;
                            }
                            const displayStatus = status === 'paid' ? 'paid' :
                                                  status === 'overdue' || isOverdue ? 'overdue' : 'pending';
                            return (
                              <Badge
                                variant={
                                  displayStatus === 'paid' ? 'default' :
                                  displayStatus === 'pending' ? 'outline' : 'destructive'
                                }
                                className={
                                  displayStatus === 'paid' ? 'bg-green-500 hover:bg-green-600' :
                                  displayStatus === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''
                                }
                              >
                                {displayStatus === 'paid' ? 'Pagado' :
                                 displayStatus === 'pending' ? 'Pendiente' : 'Vencido'}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell>{payment.plazoMeses ?? '-'}</TableCell>
                        <TableCell>{payment.interesMora ? `${payment.interesMora.toFixed(2)}%` : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}