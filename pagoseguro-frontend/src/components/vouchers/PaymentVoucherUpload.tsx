import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Upload,
  FileImage,
  Calendar,
  DollarSign,
  Hash,
  Building2,
  User,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  X
} from 'lucide-react';
import { voucherService, CreateVoucherData, ValidationResult } from '@/lib/vouchers.backend';
import { useToast } from '@/hooks/use-toast';

interface PaymentVoucherUploadProps {
  creditId: string;
  onSuccess?: () => void;
}

export const PaymentVoucherUpload = ({ creditId, onSuccess }: PaymentVoucherUploadProps) => {
  const [formData, setFormData] = useState<Partial<CreateVoucherData>>({
    creditId,
    voucherType: 'transfer'
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const token = localStorage.getItem('accessToken');

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Formato no válido',
        description: 'Use archivos JPEG, PNG, WebP o PDF',
        variant: 'destructive'
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'El tamaño máximo es 5MB',
        variant: 'destructive'
      });
      return;
    }

    // Convertir a Base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
      setValidation(null); // Resetear validación al cambiar imagen
    };
    reader.readAsDataURL(file);
  };

  // Limpiar imagen
  const clearImage = () => {
    setImagePreview(null);
    setImageBase64('');
    setValidation(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validar comprobante
  const handleValidate = async () => {
    if (!token) return;

    const data: CreateVoucherData = {
      creditId,
      voucherNumber: formData.voucherNumber || '',
      amount: formData.amount || 0,
      paymentDate: formData.paymentDate || '',
      voucherType: formData.voucherType as any || 'transfer',
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      payerName: formData.payerName,
      beneficiaryName: formData.beneficiaryName,
      imageBase64
    };

    setIsValidating(true);
    try {
      const result = await voucherService.validateVoucher(token, data);
      setValidation(result);

      if (result.valid) {
        toast({
          title: 'Validación exitosa',
          description: 'El comprobante es válido y puede ser registrado',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error de validación',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Enviar comprobante
  const handleSubmit = async () => {
    if (!token) return;

    const data: CreateVoucherData = {
      creditId,
      voucherNumber: formData.voucherNumber || '',
      amount: formData.amount || 0,
      paymentDate: formData.paymentDate || '',
      voucherType: formData.voucherType as any || 'transfer',
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      payerName: formData.payerName,
      beneficiaryName: formData.beneficiaryName,
      imageBase64
    };

    setIsSubmitting(true);
    try {
      const result = await voucherService.createVoucher(token, data);

      toast({
        title: 'Comprobante registrado',
        description: 'El comprobante ha sido enviado para validación',
      });

      if (result.warnings && result.warnings.length > 0) {
        toast({
          title: 'Advertencias',
          description: result.warnings.join('. '),
          variant: 'default'
        });
      }

      // Limpiar formulario
      setFormData({ creditId, voucherType: 'transfer' });
      clearImage();
      setValidation(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Error al registrar',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.voucherNumber && formData.amount && formData.paymentDate && imageBase64;

  return (
    <Card className="border-green-200">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
        <CardTitle className="text-green-800 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Registrar Comprobante de Pago
        </CardTitle>
        <CardDescription className="text-green-600">
          Suba su comprobante de transferencia o depósito para registrar su pago
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Área de carga de imagen */}
        <div className="space-y-2">
          <Label className="text-green-700">Imagen del Comprobante *</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              imagePreview
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="relative">
                {imagePreview.startsWith('data:application/pdf') ? (
                  <div className="flex flex-col items-center py-4">
                    <FileImage className="h-16 w-16 text-green-600 mb-2" />
                    <p className="text-sm text-green-700">Documento PDF cargado</p>
                  </div>
                ) : (
                  <img
                    src={imagePreview}
                    alt="Comprobante"
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearImage();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <FileImage className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Haga clic para seleccionar una imagen</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP o PDF (máx. 5MB)</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Campos del formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="voucherNumber" className="flex items-center gap-1 text-green-700">
              <Hash className="h-4 w-4" />
              Número de Comprobante *
            </Label>
            <Input
              id="voucherNumber"
              placeholder="Ej: 084659853"
              value={formData.voucherNumber || ''}
              onChange={(e) => {
                setFormData({ ...formData, voucherNumber: e.target.value });
                setValidation(null);
              }}
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-1 text-green-700">
              <DollarSign className="h-4 w-4" />
              Monto Pagado *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="Ej: 23.00"
              value={formData.amount || ''}
              onChange={(e) => {
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 });
                setValidation(null);
              }}
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate" className="flex items-center gap-1 text-green-700">
              <Calendar className="h-4 w-4" />
              Fecha de Pago *
            </Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.paymentDate || ''}
              onChange={(e) => {
                setFormData({ ...formData, paymentDate: e.target.value });
                setValidation(null);
              }}
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voucherType" className="flex items-center gap-1 text-green-700">
              <Building2 className="h-4 w-4" />
              Tipo de Comprobante
            </Label>
            <Select
              value={formData.voucherType}
              onValueChange={(value) => setFormData({ ...formData, voucherType: value as any })}
            >
              <SelectTrigger className="border-green-200">
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="deposit">Depósito</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="check">Cheque</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bankName" className="flex items-center gap-1 text-green-700">
              <Building2 className="h-4 w-4" />
              Banco
            </Label>
            <Input
              id="bankName"
              placeholder="Ej: Banco Pichincha"
              value={formData.bankName || ''}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="border-green-200 focus:border-green-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payerName" className="flex items-center gap-1 text-green-700">
              <User className="h-4 w-4" />
              Nombre del Pagador
            </Label>
            <Input
              id="payerName"
              placeholder="Ej: Juan Pérez"
              value={formData.payerName || ''}
              onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
              className="border-green-200 focus:border-green-400"
            />
          </div>
        </div>

        {/* Resultado de validación */}
        {validation && (
          <div className="space-y-2">
            {validation.valid ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Comprobante válido</AlertTitle>
                <AlertDescription className="text-green-600">
                  El comprobante puede ser registrado correctamente.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Errores de validación</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2">
                    {validation.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validation.warnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Advertencias</AlertTitle>
                <AlertDescription className="text-yellow-600">
                  <ul className="list-disc list-inside mt-2">
                    {validation.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validation.isDuplicate && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Comprobante duplicado</AlertTitle>
                <AlertDescription>
                  Este comprobante ya ha sido registrado anteriormente.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={!isFormValid || isValidating || isSubmitting}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Validar
              </>
            )}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting || (validation && !validation.valid)}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Registrar Comprobante
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
