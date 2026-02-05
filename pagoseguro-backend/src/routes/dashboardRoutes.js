import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Loader2,
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';
import { creditService } from '@/lib/credits.backend';

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
  address: string;
}

// Define Payment type here if not exported from credits.backend
interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid';
}
interface User {
  id: string;
  // add other properties as needed
}
import { useToast } from '@/hooks/use-toast';

interface PaymentFormProps {
  user: User;
}

export const PaymentForm = ({ user }: PaymentFormProps) => {
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    address: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadPendingPayments = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payments = await creditService.getClientPendingPayments(token);
        // Marcar como vencidos los pagos con fecha pasada
        const now = new Date();
        const updatedPayments = payments.map(payment => ({
          ...payment,
          status: new Date(payment.dueDate) < now && payment.status === 'pending' 
            ? 'overdue' as const 
            : payment.status
        }));
        setPendingPayments(updatedPayments);
      }
    };
    loadPendingPayments();
  }, [user.id]);

  const handleSelectPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowForm(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setIsProcessing(true);

    try {
      const result = await creditService.processPayment(selectedPayment.id, paymentData);
      
      if (result.success) {
        toast({
          title: "Pago Exitoso",
          description: "Su pago ha sido procesado correctamente.",
        });
        
        // Limpiar formulario y recargar datos
        setPaymentData({
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          cardHolderName: '',
          address: ''
        });
        setSelectedPayment(null);
        setShowForm(false);
        loadPendingPayments();
      } else {
        toast({
          title: "Error en el Pago",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error inesperado al procesar el pago.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  if (pendingPayments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span>Pagos al Día</span>
          </CardTitle>
          <CardDescription>
            No tiene pagos pendientes en este momento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">¡Felicitaciones!</p>
            <p className="text-muted-foreground">
              Todos sus pagos están al día. No tiene cuotas pendientes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!showForm ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pagos Pendientes</CardTitle>
              <CardDescription>
                Seleccione la cuota que desea pagar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-card transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-lg">
                            ${payment.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Vence: {new Date(payment.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={payment.status === 'overdue' ? 'destructive' : 'outline'}
                      >
                        {payment.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                      </Badge>
                      <Button
                        onClick={() => handleSelectPayment(payment)}
                        variant="gradient"
                        size="sm"
                      >
                        Pagar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {pendingPayments.some(p => p.status === 'overdue') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Tiene pagos vencidos. Le recomendamos ponerse al día lo antes posible 
                para evitar cargos adicionales.
              </AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>Procesar Pago</span>
            </CardTitle>
            <CardDescription>
              Complete la información de su tarjeta para procesar el pago
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPayment && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Detalle del Pago</h3>
                <div className="flex justify-between items-center">
                  <span>Monto a pagar:</span>
                  <span className="font-semibold text-lg">
                    ${selectedPayment.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Fecha de vencimiento:</span>
                  <span>{new Date(selectedPayment.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardHolderName">Nombre del Titular *</Label>
                <Input
                  id="cardHolderName"
                  type="text"
                  placeholder="Juan Pérez"
                  value={paymentData.cardHolderName}
                  onChange={(e) => setPaymentData({ 
                    ...paymentData, 
                    cardHolderName: e.target.value 
                  })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número de Tarjeta *</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({ 
                    ...paymentData, 
                    cardNumber: formatCardNumber(e.target.value)
                  })}
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Fecha de Vencimiento *</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/AA"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData({ 
                      ...paymentData, 
                      expiryDate: formatExpiryDate(e.target.value)
                    })}
                    maxLength={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({ 
                      ...paymentData, 
                      cvv: e.target.value.replace(/\D/g, '')
                    })}
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección de Facturación *</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Av. Principal 123, Ciudad"
                  value={paymentData.address}
                  onChange={(e) => setPaymentData({ 
                    ...paymentData, 
                    address: e.target.value 
                  })}
                  required
                />
              </div>

              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedPayment(null);
                    setPaymentData({
                      cardNumber: '',
                      expiryDate: '',
                      cvv: '',
                      cardHolderName: '',
                      address: ''
                    });
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    `Pagar $${selectedPayment?.amount.toLocaleString()}`
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-xs text-muted-foreground">
              <p>🔒 Sus datos están protegidos con encriptación SSL</p>
              <p>* Campos obligatorios</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};