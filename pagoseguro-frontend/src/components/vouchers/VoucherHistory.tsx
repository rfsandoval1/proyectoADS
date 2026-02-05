import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileText,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { voucherService, Voucher } from '@/lib/vouchers.backend';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VoucherHistoryProps {
  creditId?: string;
}

export const VoucherHistory = ({ creditId }: VoucherHistoryProps) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const token = localStorage.getItem('accessToken');

  const loadVouchers = async () => {
    if (!token) return;

    setLoading(true);
    try {
      let data: Voucher[];
      if (creditId) {
        data = await voucherService.getVouchersByCreditId(token, creditId);
      } else {
        data = await voucherService.getMyVouchers(token);
      }
      setVouchers(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar comprobantes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, [token, creditId]);

  const viewVoucher = async (id: string) => {
    if (!token) return;

    try {
      const voucher = await voucherService.getVoucherById(token, id);
      setSelectedVoucher(voucher);
      setIsViewDialogOpen(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al obtener comprobante',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      validated: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      duplicate: 'bg-orange-100 text-orange-800 border-orange-200'
    };

    const icons = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      validated: <CheckCircle2 className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
      duplicate: <AlertTriangle className="h-3 w-3 mr-1" />
    };

    const labels = {
      pending: 'Pendiente',
      validated: 'Validado',
      rejected: 'Rechazado',
      duplicate: 'Duplicado'
    };

    return (
      <Badge className={`flex items-center ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getVoucherTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      transfer: 'Transferencia',
      deposit: 'Depósito',
      cash: 'Efectivo',
      check: 'Cheque',
      other: 'Otro'
    };
    return labels[type] || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="border-green-200">
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 text-green-600 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Historial de Comprobantes
              </CardTitle>
              <CardDescription className="text-green-600">
                Comprobantes de pago registrados
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadVouchers}
              className="border-green-200 text-green-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {vouchers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay comprobantes registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-50">
                    <TableHead className="text-green-800">N° Comprobante</TableHead>
                    <TableHead className="text-green-800">Fecha Pago</TableHead>
                    <TableHead className="text-green-800">Monto</TableHead>
                    <TableHead className="text-green-800">Tipo</TableHead>
                    <TableHead className="text-green-800">Banco</TableHead>
                    <TableHead className="text-green-800">Estado</TableHead>
                    <TableHead className="text-green-800">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((voucher) => (
                    <TableRow key={voucher.id} className="hover:bg-green-50">
                      <TableCell className="font-medium">
                        {voucher.voucherNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-green-600" />
                          {formatDate(voucher.paymentDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-700">
                            {formatCurrency(voucher.amount)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getVoucherTypeLabel(voucher.voucherType)}
                      </TableCell>
                      <TableCell>
                        {voucher.bankName || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(voucher.status)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewVoucher(voucher.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para ver detalle del comprobante */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-800">
              <FileText className="h-5 w-5" />
              Detalle del Comprobante
            </DialogTitle>
            <DialogDescription>
              Información completa del comprobante de pago
            </DialogDescription>
          </DialogHeader>

          {selectedVoucher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">N° Comprobante</p>
                  <p className="font-semibold">{selectedVoucher.voucherNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  {getStatusBadge(selectedVoucher.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monto</p>
                  <p className="font-semibold text-green-700">
                    {formatCurrency(selectedVoucher.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de Pago</p>
                  <p>{formatDate(selectedVoucher.paymentDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p>{getVoucherTypeLabel(selectedVoucher.voucherType)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Banco</p>
                  <p>{selectedVoucher.bankName || '-'}</p>
                </div>
                {selectedVoucher.payerName && (
                  <div>
                    <p className="text-sm text-gray-500">Pagador</p>
                    <p>{selectedVoucher.payerName}</p>
                  </div>
                )}
                {selectedVoucher.validationNotes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Notas de Validación</p>
                    <p className={selectedVoucher.status === 'rejected' ? 'text-red-600' : ''}>
                      {selectedVoucher.validationNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Imagen del comprobante */}
              {selectedVoucher.imageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Imagen del Comprobante</p>
                  {selectedVoucher.imageUrl.startsWith('data:application/pdf') ? (
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Documento PDF</p>
                    </div>
                  ) : (
                    <img
                      src={selectedVoucher.imageUrl}
                      alt="Comprobante"
                      className="max-h-96 mx-auto rounded-lg shadow-md"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
