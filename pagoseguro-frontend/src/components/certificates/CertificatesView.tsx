import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { paymentService } from '@/lib/payments.backend';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PaidPayment {
  id: string;
  creditId: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  paidDate?: string;
  createdAt?: string;
}

interface CertificatesViewProps {
  user: { id: string };
}

export const CertificatesView = ({ user }: CertificatesViewProps) => {
  const [paidPayments, setPaidPayments] = useState<PaidPayment[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPaidPayments();
  }, [user.id]);

  const loadPaidPayments = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const allPayments = await paymentService.getMyPayments(token);
    const paid = Array.isArray(allPayments)
      ? allPayments.filter((p: any) => p.status?.toLowerCase() === 'paid').map((p: any) => ({
          ...p,
          status: p.status?.toLowerCase()
        }))
      : [];
    setPaidPayments(paid);
  };

  const handlePaymentSelect = (paymentId: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments([...selectedPayments, paymentId]);
    } else {
      setSelectedPayments(selectedPayments.filter(id => id !== paymentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(paidPayments.map(p => p.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      case 'cash': return 'Efectivo';
      case 'check': return 'Cheque';
      default: return method || 'N/A';
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateCertificate = async () => {
    if (selectedPayments.length === 0) {
      toast({
        title: "Selección requerida",
        description: "Debe seleccionar al menos un pago para generar el certificado.",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);

    try {
      const selected = paidPayments.filter(p => selectedPayments.includes(p.id));
      const total = selected.reduce((sum, p) => sum + p.amount, 0);

      const doc = new jsPDF();

      // Header con fondo verde
      doc.setFillColor(34, 139, 34);
      doc.rect(0, 0, 210, 40, 'F');

      // Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('CERTIFICADO DE PAGO', 105, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.text('PagoSeguro AGROTAC', 105, 32, { align: 'center' });

      // Información de emisión
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 105, 50, { align: 'center' });

      // Número de certificado
      const certNumber = `CERT-${Date.now().toString().slice(-8)}`;
      doc.setFontSize(12);
      doc.text(`Certificado N°: ${certNumber}`, 105, 58, { align: 'center' });

      // Línea divisoria
      doc.setDrawColor(34, 139, 34);
      doc.setLineWidth(1);
      doc.line(20, 65, 190, 65);

      // Texto de certificación
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      const certText = 'Por medio del presente documento, se certifica que se han registrado los siguientes pagos en el sistema PagoSeguro AGROTAC:';
      const splitText = doc.splitTextToSize(certText, 170);
      doc.text(splitText, 20, 75);

      // Tabla de pagos
      const tableData = selected.map(p => [
        p.id.substring(0, 8) + '...',
        formatDate(p.paidDate || p.createdAt),
        `$${p.amount.toFixed(2)}`,
        getPaymentMethodText(p.paymentMethod),
        p.creditId.substring(0, 8) + '...'
      ]);

      autoTable(doc, {
        startY: 90,
        head: [['ID Transacción', 'Fecha de Pago', 'Monto', 'Método', 'ID Crédito']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [34, 139, 34],
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [240, 255, 240]
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 }
        }
      });

      // Total
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFillColor(34, 139, 34);
      doc.rect(120, finalY - 5, 70, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL: $${total.toFixed(2)}`, 155, finalY + 5, { align: 'center' });

      // Disclaimer
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const disclaimer = 'Este certificado es generado automáticamente por el sistema PagoSeguro AGROTAC y tiene validez como comprobante de pago. Para cualquier consulta, comuníquese con nuestro equipo de soporte.';
      const splitDisclaimer = doc.splitTextToSize(disclaimer, 170);
      doc.text(splitDisclaimer, 20, finalY + 25);

      // Firma digital simulada
      doc.setDrawColor(34, 139, 34);
      doc.setLineWidth(0.5);
      doc.line(130, finalY + 50, 190, finalY + 50);
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      doc.text('Firma Digital Autorizada', 160, finalY + 57, { align: 'center' });
      doc.setFontSize(8);
      doc.text('PagoSeguro AGROTAC', 160, finalY + 63, { align: 'center' });

      // Footer
      doc.setFillColor(34, 139, 34);
      doc.rect(0, 280, 210, 17, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('PagoSeguro AGROTAC - Sistema de Gestión de Pagos y Créditos', 105, 288, { align: 'center' });
      doc.text('www.pagoseguro-agrotac.com | soporte@pagoseguro-agrotac.com', 105, 293, { align: 'center' });

      // Guardar PDF
      doc.save(`certificado-pagos-${certNumber}.pdf`);

      toast({
        title: "Certificado generado",
        description: `Se ha descargado el certificado con ${selectedPayments.length} pago(s).`,
      });

      setSelectedPayments([]);
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Error al generar certificado",
        description: "No se pudo generar el certificado. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const selectedTotal = paidPayments
    .filter(p => selectedPayments.includes(p.id))
    .reduce((sum, p) => sum + p.amount, 0);

  if (paidPayments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No hay pagos registrados</h2>
        <p className="text-gray-500 text-center">
          No tiene pagos realizados para generar certificados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certificados de Pago</h1>
          <p className="text-gray-500">
            Genere y descargue certificados de sus pagos realizados
          </p>
        </div>
        <Button
          onClick={generateCertificate}
          disabled={selectedPayments.length === 0 || generating}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Generar Certificado
            </>
          )}
        </Button>
      </div>

      {selectedPayments.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    {selectedPayments.length} pago(s) seleccionado(s)
                  </p>
                  <p className="text-sm text-green-600">
                    Total: ${selectedTotal.toFixed(2)}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setSelectedPayments([])}
                variant="outline"
                size="sm"
              >
                Limpiar selección
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>
                Seleccione los pagos para incluir en el certificado
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedPayments.length === paidPayments.length && paidPayments.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label className="text-sm font-medium">Seleccionar todos</label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paidPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  checked={selectedPayments.includes(payment.id)}
                  onCheckedChange={(checked) => handlePaymentSelect(payment.id, checked as boolean)}
                />

                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Monto pagado</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium">
                        {payment.paidDate
                          ? new Date(payment.paidDate).toLocaleDateString('es-EC')
                          : payment.createdAt
                            ? new Date(payment.createdAt).toLocaleDateString('es-EC')
                            : '-'}
                      </p>
                      <p className="text-sm text-gray-500">Fecha de pago</p>
                    </div>
                  </div>

                  <div>
                    <Badge className="bg-green-100 text-green-800">
                      {payment.paymentMethod === 'card' ? 'Tarjeta' :
                       payment.paymentMethod === 'transfer' ? 'Transferencia' :
                       payment.paymentMethod === 'cash' ? 'Efectivo' : 'Otro'}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">Método</p>
                  </div>

                  <div>
                    <p className="font-medium text-xs font-mono truncate">
                      {payment.id}
                    </p>
                    <p className="text-sm text-gray-500">ID Transacción</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Información del Certificado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-500">
            <p>Los certificados incluyen información detallada de cada pago: fecha, monto, método de pago y número de transacción.</p>
            <p>El certificado será generado en formato PDF y se descargará automáticamente.</p>
            <p>Puede seleccionar múltiples pagos para generar un certificado consolidado.</p>
            <p>Los certificados tienen validez legal y pueden ser utilizados como comprobante de pago.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
