import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, FileDown, Search, Users, Download, FileSpreadsheet, Mail, MessageCircle, MapPin, Send } from 'lucide-react';
import { dashboardService } from '@/lib/dashboard.backend';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const logoBase64 = '';

interface DelinquencyClient {
  id: string;
  name: string;
  cedula: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  overdueAmount: number;
  overdueInvoices: number;
  daysOverdue: number;
  lastPaymentDate: string;
  interesCalculado?: number;
}

// Función para detectar clientes irregulares
const esIrregular = (client: DelinquencyClient) => {
  return client.daysOverdue >= 60 && client.overdueAmount > 0;
};

// Función para crear y descargar archivo Excel
const exportToExcel = (data: DelinquencyClient[], filename: string = 'reporte-morosidad') => {
  // Crear el contenido CSV manualmente
  const headers = [
    'Cliente',
    'Correo Electrónico',
    'Teléfono',
    'Dirección',
    'Ciudad',
    'Cédula/RUC',
    'Monto Adeudado (USD)',
    'Facturas Vencidas',
    'Días en Mora',
    'Último Pago',
    'Interés por Mora (USD)',
    'Nivel de Riesgo',
    'Estado'
  ];

  const getRiskLevel = (daysOverdue: number) => {
    if (daysOverdue >= 30) return 'Crítico';
    if (daysOverdue >= 15) return 'Alto';
    return 'Medio';
  };

  const csvRows = [
    headers.join(','),
    ...data.map(client => [
      `"${client.name}"`,
      `"${client.email}"`,
      `"${client.phone}"`,
      `"${client.address}"`,
      `"${client.city}"`,
      client.cedula,
      client.overdueAmount.toFixed(2),
      client.overdueInvoices,
      client.daysOverdue,
      client.lastPaymentDate,
      (client.interesCalculado ?? 0).toFixed(2),
      `"${getRiskLevel(client.daysOverdue)}"`,
      esIrregular(client) ? '"Irregular"' : '"Regular"'
    ].join(','))
  ];

  const csvContent = csvRows.join('\n');
  
  // Crear y descargar el archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const DelinquencyReports = () => {
  const [delinquencyData, setDelinquencyData] = useState<DelinquencyClient[]>([]);
  const [filteredData, setFilteredData] = useState<DelinquencyClient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [amountFilter, setAmountFilter] = useState('');

  useEffect(() => {
    const fetchDelinquencyData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No authentication token found. Please log in.');
          return;
        }

        const response = await dashboardService.getDelinquentClients(token);

        if (response.success && response.data) {
          // Calcular interés para cada cliente (5% del monto por cada 30 días de mora)
          const dataWithInterest = response.data.map((client: any) => ({
            ...client,
            interesCalculado: client.overdueAmount * 0.05 * Math.ceil(client.daysOverdue / 30)
          }));
          setDelinquencyData(dataWithInterest);
        } else {
          setDelinquencyData([]);
        }
      } catch (error) {
        console.error('Error fetching delinquent clients:', error);
        setDelinquencyData([]);
      }
    };

    fetchDelinquencyData();
  }, []);

  useEffect(() => {
    let filtered = delinquencyData;

    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.cedula.includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.phone.includes(searchTerm) ||
          client.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (amountFilter.trim() !== '') {
      const amount = parseFloat(amountFilter);
      if (!isNaN(amount)) {
        filtered = filtered.filter((client) => client.overdueAmount >= amount);
      }
    }

    setFilteredData(filtered);
  }, [delinquencyData, searchTerm, amountFilter]);

  const getRiskLevel = (daysOverdue: number) => {
    if (daysOverdue >= 30) return { level: 'Crítico', variant: 'destructive' as const };
    if (daysOverdue >= 15) return { level: 'Alto', variant: 'warning' as const };
    return { level: 'Medio', variant: 'outline' as const };
  };

  // Función para enviar notificación al cliente
  const sendNotification = (client: DelinquencyClient) => {
    const mensaje = `Estimado/a ${client.name},\n\nLe recordamos que tiene una deuda pendiente de $${client.overdueAmount.toFixed(2)} con ${client.daysOverdue} días de vencimiento.\n\nFacturas vencidas: ${client.overdueInvoices}\nInterés acumulado: $${(client.interesCalculado ?? 0).toFixed(2)}\n\nPor favor, contacte con nosotros para regularizar su situación.\n\nSaludos cordiales,\nDepartamento de Cobranzas`;

    // Limpiar el número de teléfono para WhatsApp (quitar espacios y caracteres especiales)
    const phoneClean = client.phone.replace(/\D/g, '');
    
    // URLs para diferentes canales de comunicación
    const emailUrl = `mailto:${client.email}?subject=Recordatorio de Pago Pendiente&body=${encodeURIComponent(mensaje)}`;
    const whatsappUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(mensaje)}`;
    const smsUrl = `sms:${client.phone}?body=${encodeURIComponent(mensaje)}`;

    // Mostrar modal con opciones
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md mx-4 space-y-4">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900">Enviar Notificación a</h3>
          <p class="text-sm text-gray-600 mt-1">${client.name}</p>
          <div class="mt-2 p-3 bg-red-50 rounded-lg">
            <p class="text-sm text-red-800">
              <strong>Deuda:</strong> $${client.overdueAmount.toFixed(2)} 
              <span class="ml-2">(${client.daysOverdue} días)</span>
            </p>
          </div>
        </div>
        
        <div class="space-y-2">
          <button onclick="window.open('${emailUrl}'); document.body.removeChild(this.parentElement.parentElement.parentElement)" 
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            Enviar Email
          </button>
          
          <button onclick="window.open('${whatsappUrl}', '_blank'); document.body.removeChild(this.parentElement.parentElement.parentElement)" 
                  class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.485 3.287"/>
            </svg>
            Enviar WhatsApp
          </button>
          
          <button onclick="window.open('${smsUrl}'); document.body.removeChild(this.parentElement.parentElement.parentElement)" 
                  class="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
            </svg>
            Enviar SMS
          </button>
        </div>
        
        <button onclick="document.body.removeChild(this.parentElement.parentElement)" 
                class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors">
          Cancelar
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  };

  const generarPDFProfesional = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 20;

    // Función para agregar una nueva página si es necesario
    const checkPageBreak = (neededSpace: number) => {
      if (y + neededSpace > pageHeight - 30) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    // Header con logo y título
    doc.setFillColor(59, 130, 246); // bg-blue-600
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE MOROSIDAD', pageWidth / 2, 25, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestión Financiera', pageWidth / 2, 35, { align: 'center' });
    
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
    const totalClientes = filteredData.length;
    const montoTotal = filteredData.reduce((sum, c) => sum + c.overdueAmount, 0);
    const facturasVencidas = filteredData.reduce((sum, c) => sum + c.overdueInvoices, 0);
    const interesTotal = filteredData.reduce((sum, c) => sum + (c.interesCalculado ?? 0), 0);
    const clientesIrregulares = filteredData.filter(esIrregular).length;

    // Crear cajas de estadísticas
    const boxWidth = (pageWidth - 2 * margin - 20) / 3;
    const boxHeight = 25;
    
    // Caja 1: Total Clientes
    doc.setFillColor(239, 68, 68); // bg-red-500
    doc.rect(margin, y, boxWidth, boxHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTES EN MORA', margin + boxWidth/2, y + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.text(totalClientes.toString(), margin + boxWidth/2, y + 18, { align: 'center' });

    // Caja 2: Monto Total
    doc.setFillColor(245, 158, 11); // bg-amber-500
    doc.rect(margin + boxWidth + 10, y, boxWidth, boxHeight, 'F');
    doc.setFontSize(10);
    doc.text('MONTO TOTAL (USD)', margin + boxWidth + 10 + boxWidth/2, y + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.text(`$${montoTotal.toFixed(2)}`, margin + boxWidth + 10 + boxWidth/2, y + 18, { align: 'center' });

    // Caja 3: Facturas Vencidas
    doc.setFillColor(34, 197, 94); // bg-green-500
    doc.rect(margin + 2 * boxWidth + 20, y, boxWidth, boxHeight, 'F');
    doc.setFontSize(10);
    doc.text('FACTURAS VENCIDAS', margin + 2 * boxWidth + 20 + boxWidth/2, y + 8, { align: 'center' });
    doc.setFontSize(16);
    doc.text(facturasVencidas.toString(), margin + 2 * boxWidth + 20 + boxWidth/2, y + 18, { align: 'center' });

    y += 40;

    // Información adicional
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Interés total acumulado: $${interesTotal.toFixed(2)}`, margin, y);
    y += 8;
    doc.text(`• Clientes irregulares (>60 días): ${clientesIrregulares}`, margin, y);
    y += 8;
    doc.text(`• Promedio días en mora: ${Math.round(filteredData.reduce((sum, c) => sum + c.daysOverdue, 0) / totalClientes)} días`, margin, y);
    y += 20;

    checkPageBreak(40);

    // Título de la tabla
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE CLIENTES EN MOROSIDAD', margin, y);
    y += 15;

    // Tabla mejorada con autoTable
    const tableColumnHeaders = [
      'Cliente',
      'Teléfono',
      'Ciudad',
      'Cédula/RUC',
      'Monto\n(USD)',
      'Facturas',
      'Días\nMora',
      'Último\nPago',
      'Interés\n(USD)',
      'Riesgo'
    ];

    const tableRows = filteredData.map((client) => {
      const risk = getRiskLevel(client.daysOverdue);
      return [
        client.name,
        client.phone,
        client.city,
        client.cedula,
        `$${client.overdueAmount.toFixed(2)}`,
        client.overdueInvoices.toString(),
        `${client.daysOverdue}`,
        client.lastPaymentDate,
        `$${(client.interesCalculado ?? 0).toFixed(2)}`,
        risk.level
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [tableColumnHeaders],
      body: tableRows,
      theme: 'striped',
      headStyles: { 
        fillColor: [59, 130, 246], // blue-600
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 3
      },
      bodyStyles: { 
        fontSize: 7,
        cellPadding: 2,
        halign: 'center'
      },
      alternateRowStyles: { fillColor: [248, 250, 252] }, // gray-50
      columnStyles: {
        0: { halign: 'left', cellWidth: 30 }, // Cliente
        1: { halign: 'center', cellWidth: 22 }, // Teléfono
        2: { halign: 'center', cellWidth: 18 }, // Ciudad
        3: { halign: 'center', cellWidth: 20 }, // Cédula
        4: { halign: 'right', cellWidth: 18 }, // Monto
        5: { halign: 'center', cellWidth: 12 }, // Facturas
        6: { halign: 'center', cellWidth: 12 }, // Días
        7: { halign: 'center', cellWidth: 18 }, // Último pago
        8: { halign: 'right', cellWidth: 15 }, // Interés
        9: { halign: 'center', cellWidth: 15 } // Riesgo
      },
      margin: { left: margin, right: margin },
      didParseCell: function(data) {
        // Colorear filas de clientes irregulares
        if (data.section === 'body') {
          const client = filteredData[data.row.index];
          if (esIrregular(client)) {
            data.cell.styles.fillColor = [254, 226, 226]; // red-100
            data.cell.styles.textColor = [127, 29, 29]; // red-900
          }
        }
        
        // Colorear la columna de riesgo
        if (data.section === 'body' && data.column.index === 9) {
          const riskText = data.cell.text[0];
          switch (riskText) {
            case 'Crítico':
              data.cell.styles.fillColor = [239, 68, 68]; // red-500
              data.cell.styles.textColor = [255, 255, 255];
              break;
            case 'Alto':
              data.cell.styles.fillColor = [245, 158, 11]; // amber-500
              data.cell.styles.textColor = [255, 255, 255];
              break;
            case 'Medio':
              data.cell.styles.fillColor = [34, 197, 94]; // green-500
              data.cell.styles.textColor = [255, 255, 255];
              break;
          }
        }
      }
    });

    y = (doc as any).lastAutoTable.finalY + 30;

    // Footer con firmas
    checkPageBreak(60);
    
    doc.setDrawColor(0, 0, 0);
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
    doc.text('Gerente Financiero', margin, y + 8);
    doc.text('Aprobado por', margin, y + 16);

    // Firma 2
    doc.text('_'.repeat(30), margin + firmaWidth + 20, y);
    doc.text('Contador General', margin + firmaWidth + 20, y + 8);
    doc.text('Revisado por', margin + firmaWidth + 20, y + 16);

    // Pie de página
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      doc.text('Documento generado automáticamente', margin, pageHeight - 10);
    }

    // Descargar PDF
    doc.save(`reporte-morosidad-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const totalMontoVencido = delinquencyData.reduce((sum, c) => sum + c.overdueAmount, 0);
  const totalFacturasVencidas = delinquencyData.reduce((sum, c) => sum + c.overdueInvoices, 0);
  const clientesIrregulares = delinquencyData.filter(esIrregular).length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-2">📊 Reportes de Morosidad</h1>
        <p className="opacity-90">Análisis completo de clientes que requieren atención inmediata por pagos vencidos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes in Mora</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{delinquencyData.length}</div>
            <p className="text-xs text-muted-foreground">
              {clientesIrregulares} irregulares (60 días)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total Vencido</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${totalMontoVencido.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +${delinquencyData.reduce((sum, c) => sum + (c.interesCalculado ?? 0), 0).toFixed(2)} intereses
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
            <FileDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {totalFacturasVencidas}
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio: {Math.round(totalFacturasVencidas / Math.max(delinquencyData.length, 1))} por cliente
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Días Promedio Mora</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(delinquencyData.reduce((sum, c) => sum + c.daysOverdue, 0) / Math.max(delinquencyData.length, 1))}
            </div>
            <p className="text-xs text-muted-foreground">días de atraso</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cédula, teléfono, ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Input
              type="number"
              placeholder="Monto mínimo adeudado"
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Clientes en Morosidad
              </CardTitle>
              <CardDescription>
                {filteredData.length === 0
                  ? 'No existen clientes que coincidan con los filtros aplicados'
                  : `${filteredData.length} cliente(s) con pagos vencidos encontrados`}
              </CardDescription>
            </div>
            {filteredData.length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportToExcel(filteredData)}
                  className="flex items-center gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Exportar Excel
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={generarPDFProfesional}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Download className="h-4 w-4" />
                  Generar Reporte PDF
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Cliente</TableHead>
                    <TableHead className="font-semibold">Contacto</TableHead>
                    <TableHead className="font-semibold">Ubicación</TableHead>
                    <TableHead className="font-semibold">Cédula/RUC</TableHead>
                    <TableHead className="font-semibold text-right">Monto Adeudado</TableHead>
                    <TableHead className="font-semibold text-center">Facturas</TableHead>
                    <TableHead className="font-semibold text-center">Días en Mora</TableHead>
                    <TableHead className="font-semibold">Último Pago</TableHead>
                    <TableHead className="font-semibold text-right">Interés por Mora</TableHead>
                    <TableHead className="font-semibold text-center">Riesgo</TableHead>
                    <TableHead className="font-semibold text-center">Notificar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((client) => {
                    const risk = getRiskLevel(client.daysOverdue);
                    const isIrregular = esIrregular(client);
                    
                    return (
                      <TableRow 
                        key={client.id} 
                        className={`${isIrregular ? 'bg-red-50 border-l-4 border-l-red-500' : ''} hover:bg-gray-50`}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium text-gray-900">{client.name}</div>
                            {isIrregular && (
                              <Badge variant="destructive" className="w-fit text-xs mt-1">
                                IRREGULAR
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <MessageCircle className="h-3 w-3 text-gray-500" />
                              <span className="font-mono text-blue-600">{client.phone}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Mail className="h-3 w-3 text-gray-500" />
                              <span>{client.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-gray-500" />
                              <span className="font-medium text-gray-700">{client.city}</span>
                            </div>
                            <div className="text-xs text-gray-600 truncate max-w-32">
                              {client.address}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="font-mono text-sm">{client.cedula}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          ${client.overdueAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-orange-700 border-orange-300">
                            {client.overdueInvoices}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${client.daysOverdue >= 30 ? 'text-red-600' : client.daysOverdue >= 15 ? 'text-orange-600' : 'text-gray-600'}`}>
                            {client.daysOverdue} días
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{client.lastPaymentDate}</TableCell>
                        <TableCell className="text-right font-medium text-orange-600">
                          ${(client.interesCalculado ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={risk.variant} className="font-medium">
                            {risk.level}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendNotification(client)}
                            className="text-xs bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700"
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Enviar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
              <p className="text-gray-500">
                No existen clientes que coincidan con los filtros aplicados.
                <br />
                Intenta modificar los criterios de búsqueda.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección de análisis adicional */}
      {filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📈 Análisis de Riesgo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Crítico', 'Alto', 'Medio'].map((nivel) => {
                  const count = filteredData.filter(c => getRiskLevel(c.daysOverdue).level === nivel).length;
                  const percentage = Math.round((count / filteredData.length) * 100);
                  return (
                    <div key={nivel} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={nivel === 'Crítico' ? 'destructive' : nivel === 'Alto' ? 'warning' : 'outline'}>
                          {nivel}
                        </Badge>
                        <span className="text-sm text-gray-600">{count} clientes</span>
                      </div>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💰 Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monto principal:</span>
                  <span className="font-semibold">${totalMontoVencido.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Intereses acumulados:</span>
                  <span className="font-semibold text-orange-600">
                    ${delinquencyData.reduce((sum, c) => sum + (c.interesCalculado ?? 0), 0).toFixed(2)}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total a recuperar:</span>
                  <span className="font-bold text-lg text-red-600">
                    ${(totalMontoVencido + delinquencyData.reduce((sum, c) => sum + (c.interesCalculado ?? 0), 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};