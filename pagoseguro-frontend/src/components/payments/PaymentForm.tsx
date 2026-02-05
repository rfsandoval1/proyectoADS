import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  DollarSign,
  Loader2,
  CheckCircle2,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { creditService } from '@/lib/credits.backend';
import { paymentService } from '@/lib/payments.backend';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
}

interface PaymentFormProps {
  user: User;
}

interface EnrichedCredit {
  id: string;
  amount: number;
  remainingBalance: number;
  monthlyPayment: number;
  status: string;
  term?: number;
  description?: string;
}

type Step = 'select' | 'card' | 'success';

export const PaymentForm = ({ user }: PaymentFormProps) => {
  const [credits, setCredits] = useState<EnrichedCredit[]>([]);
  const [selectedCredit, setSelectedCredit] = useState<EnrichedCredit | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [step, setStep] = useState<Step>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastPayment, setLastPayment] = useState<any>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();

  useEffect(() => {
    const loadCredits = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const [clientCredits, myPayments] = await Promise.all([
        creditService.getClientCredits(token),
        paymentService.getMyPayments(token)
      ]);
      const enriched: EnrichedCredit[] = Array.isArray(clientCredits) ? clientCredits.map((credit: any) => {
        const paidTotal = Array.isArray(myPayments)
          ? myPayments.filter((p: any) => p.creditId === credit.id && p.status?.toLowerCase() === 'paid')
              .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
          : 0;
        const monthlyPayment = credit.term ? credit.amount / credit.term : credit.amount;
        return {
          ...credit,
          remainingBalance: Math.max(0, credit.amount - paidTotal),
          monthlyPayment,
          status: credit.status?.toLowerCase()
        };
      }) : [];
      setCredits(enriched);
    };
    loadCredits();
  }, [user.id]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    return v.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return v;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    } else if (selectedCredit && Number(paymentAmount) > selectedCredit.remainingBalance) {
      newErrors.amount = `No puede exceder el saldo pendiente ($${selectedCredit.remainingBalance.toFixed(2)})`;
    }

    if (!cardHolderName.trim() || cardHolderName.trim().length < 2) {
      newErrors.cardHolderName = 'Nombre debe tener al menos 2 caracteres';
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(cardHolderName.trim())) {
      newErrors.cardHolderName = 'Solo letras y espacios permitidos';
    }

    const rawCard = cardNumber.replace(/\s/g, '');
    if (!rawCard || rawCard.length !== 16) {
      newErrors.cardNumber = 'Debe tener exactamente 16 dígitos';
    }

    const expParts = expiryDate.split('/');
    if (expParts.length !== 2 || expParts[0].length !== 2 || expParts[1].length !== 2) {
      newErrors.expiryDate = 'Formato inválido (MM/AA)';
    } else {
      const month = parseInt(expParts[0], 10);
      const year = parseInt(expParts[1], 10) + 2000;
      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Mes inválido (01-12)';
      } else {
        const now = new Date();
        if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
          newErrors.expiryDate = 'La tarjeta está expirada';
        }
      }
    }

    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = 'CVV debe tener 3 o 4 dígitos';
    }

    if (!address.trim() || address.trim().length < 5) {
      newErrors.address = 'Dirección debe tener al menos 5 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectCredit = (credit: EnrichedCredit) => {
    setSelectedCredit(credit);
    setPaymentAmount(credit.monthlyPayment.toFixed(2));
    setErrors({});
    setStep('card');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedCredit) return;

    setIsProcessing(true);
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const result = await paymentService.createPayment(
        { creditId: selectedCredit.id, amount: Number(paymentAmount), paymentMethod: 'card' },
        token
      );

      if (result.success) {
        setLastPayment(result.payment);
        setStep('success');
        toast({ title: 'Pago Exitoso', description: 'Su pago ha sido procesado correctamente.' });
      } else {
        toast({ title: 'Error en el Pago', description: result.message || 'Error al procesar', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Error inesperado al procesar el pago.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setSelectedCredit(null);
    setPaymentAmount('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardHolderName('');
    setAddress('');
    setErrors({});
    setLastPayment(null);
    setStep('select');
  };

  // --- STEP: SUCCESS ---
  if (step === 'success') {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="pt-8 text-center space-y-6">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
          <h2 className="text-2xl font-bold text-green-800">Pago Exitoso</h2>
          <div className="space-y-2 text-left bg-green-50 rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monto pagado:</span>
              <span className="font-semibold">${Number(paymentAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Crédito:</span>
              <span className="font-semibold text-sm">{selectedCredit?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Método:</span>
              <Badge className="bg-green-100 text-green-800">Tarjeta</Badge>
            </div>
            {lastPayment?.id && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ID Transacción:</span>
                <span className="font-mono text-xs">{lastPayment.id}</span>
              </div>
            )}
          </div>
          <Button onClick={resetForm} className="w-full bg-green-600 hover:bg-green-700">
            Realizar otro pago
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- STEP: CARD FORM ---
  if (step === 'card' && selectedCredit) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Procesar Pago
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => { setStep('select'); setErrors({}); }}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Atrás
            </Button>
          </div>
          <CardDescription>Complete los datos de su tarjeta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Crédito</span>
              <span className="text-sm font-semibold">{selectedCredit.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Saldo pendiente</span>
              <span className="text-sm font-semibold text-red-600">${selectedCredit.remainingBalance.toFixed(2)}</span>
            </div>
            <div>
              <Label htmlFor="amount" className="text-sm text-gray-600">Monto a pagar</Label>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className={errors.amount ? 'border-red-500' : ''}
                />
              </div>
              {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cardHolderName">Nombre del Titular</Label>
              <Input
                id="cardHolderName"
                type="text"
                placeholder="Juan Pérez"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                className={errors.cardHolderName ? 'border-red-500' : ''}
              />
              {errors.cardHolderName && <p className="text-xs text-red-600 mt-1">{errors.cardHolderName}</p>}
            </div>

            <div>
              <Label htmlFor="cardNumber">Número de Tarjeta</Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className={errors.cardNumber ? 'border-red-500' : ''}
              />
              {errors.cardNumber && <p className="text-xs text-red-600 mt-1">{errors.cardNumber}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
                <Input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/AA"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  maxLength={5}
                  className={errors.expiryDate ? 'border-red-500' : ''}
                />
                {errors.expiryDate && <p className="text-xs text-red-600 mt-1">{errors.expiryDate}</p>}
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  className={errors.cvv ? 'border-red-500' : ''}
                />
                {errors.cvv && <p className="text-xs text-red-600 mt-1">{errors.cvv}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Dirección de Facturación</Label>
              <Input
                id="address"
                type="text"
                placeholder="Av. Principal 123, Ciudad"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
            </div>

            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 mt-2"
            >
              {isProcessing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
              ) : (
                `Pagar $${Number(paymentAmount || 0).toFixed(2)}`
              )}
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Lock className="h-3 w-3" />
            <span>Sus datos están protegidos con encriptación SSL</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- STEP: SELECT CREDIT ---
  const activeCredits = credits.filter(c => c.status === 'active');

  if (activeCredits.length === 0) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Pagos al Día
          </CardTitle>
          <CardDescription>No tiene créditos activos con saldo pendiente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Sin pagos pendientes</p>
            <p className="text-gray-500">No tiene créditos activos en este momento.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Realizar Pago
          </CardTitle>
          <CardDescription>Seleccione el crédito al que desea realizar el pago</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeCredits.map((credit) => (
              <div
                key={credit.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Crédito {credit.id.slice(-6).toUpperCase()}</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Activo</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Cuota mensual: <strong>${credit.monthlyPayment.toFixed(2)}</strong></span>
                    <span>Saldo: <strong className="text-red-600">${credit.remainingBalance.toFixed(2)}</strong></span>
                  </div>
                </div>
                <Button
                  onClick={() => handleSelectCredit(credit)}
                  className="bg-green-600 hover:bg-green-700 text-sm"
                >
                  Pagar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
