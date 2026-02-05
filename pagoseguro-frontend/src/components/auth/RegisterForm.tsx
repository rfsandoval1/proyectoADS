import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Phone, MapPin, IdCard, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/lib/auth.backend';
import logo from '@/assets/el-granito-logo.png';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onRegisterSuccess, onSwitchToLogin }: RegisterFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cedula: '',
    telefono: '',
    direccion: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (formData.name.length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.name)) {
      return 'El nombre solo puede contener letras y espacios';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }

    if (!/^\d{10}$/.test(formData.cedula)) {
      return 'La cédula debe tener exactamente 10 dígitos numéricos';
    }

    if (formData.telefono.length < 10) {
      return 'El teléfono debe tener al menos 10 dígitos';
    }

    if (formData.direccion.length < 10) {
      return 'La dirección debe tener al menos 10 caracteres';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.registerClient({
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        cedula: formData.cedula,
        telefono: formData.telefono,
        direccion: formData.direccion
      });

      if (result.success) {
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors.map((e: any) => e.message).join('. ');
          setError(errorMessages || result.message || 'Error de validación');
        } else {
          setError(result.message || 'Error al registrar. Verifique los datos ingresados.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Error inesperado. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-granito p-4 relative overflow-hidden">
      {/* Elementos decorativos animados - igual que login */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-fade-in relative z-10">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={logo}
                alt="El Granito"
                className="h-16 w-16 animate-granito-pulse hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-granito-gradient bg-clip-text animate-slide-in">
            Crear Cuenta
          </CardTitle>
          <CardDescription className="text-green-700 animate-fade-in animation-delay-500">
            Complete el formulario para registrarse
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <Alert variant="destructive" className="animate-fade-in border-red-200 bg-red-50 py-2">
                <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="animate-fade-in border-green-200 bg-green-50 py-2">
                <AlertDescription className="text-green-700 text-sm">{success}</AlertDescription>
              </Alert>
            )}

            {/* Grid de 2 columnas para campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Nombre */}
              <div className="space-y-1">
                <Label htmlFor="name" className="text-green-700 font-medium text-sm">Nombre Completo *</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-green-500 group-focus-within:text-green-600 transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 h-10 border-green-200 focus:border-green-500 focus:ring-green-500 hover:border-green-300"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-green-700 font-medium text-sm">Correo Electrónico *</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-green-500 group-focus-within:text-green-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 h-10 border-green-200 focus:border-green-500 focus:ring-green-500 hover:border-green-300"
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-green-700 font-medium text-sm">Contraseña *</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-green-500 group-focus-within:text-green-600 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 h-10 border-green-200 focus:border-green-500 focus:ring-green-500 hover:border-green-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-2.5 text-green-500 hover:text-green-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-green-700 font-medium text-sm">Confirmar Contraseña *</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-green-500 group-focus-within:text-green-600 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10 h-10 border-green-200 focus:border-green-500 focus:ring-green-500 hover:border-green-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-2.5 text-green-500 hover:text-green-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Cédula */}
              <div className="space-y-1">
                <Label htmlFor="cedula" className="text-green-700 font-medium text-sm">Cédula * <span className="text-xs text-green-600 font-normal">(10 dígitos)</span></Label>
                <div className="relative group">
                  <IdCard className="absolute left-3 top-2.5 h-4 w-4 text-green-500 group-focus-within:text-green-600 transition-colors" />
                  <Input
                    id="cedula"
                    type="text"
                    placeholder="1234567890"
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="pl-10 h-10 border-green-200 focus:border-green-500 focus:ring-green-500 hover:border-green-300"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div className="space-y-1">
                <Label htmlFor="telefono" className="text-green-700 font-medium text-sm">Teléfono * <span className="text-xs text-green-600 font-normal">(mín. 10)</span></Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-green-500 group-focus-within:text-green-600 transition-colors" />
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="0987654321"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '').slice(0, 15) })}
                    className="pl-10 h-10 border-green-200 focus:border-green-500 focus:ring-green-500 hover:border-green-300"
                    maxLength={15}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dirección - ancho completo */}
            <div className="space-y-1">
              <Label htmlFor="direccion" className="text-green-700 font-medium text-sm">Dirección * <span className="text-xs text-green-600 font-normal">(mín. 10 caracteres)</span></Label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-green-500 group-focus-within:text-green-600 transition-colors" />
                <Input
                  id="direccion"
                  type="text"
                  placeholder="Av. Principal 123, Ciudad"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="pl-10 h-10 border-green-200 focus:border-green-500 focus:ring-green-500 hover:border-green-300"
                  maxLength={250}
                  required
                />
              </div>
            </div>

            {/* Requisitos de contraseña - compacto */}
            <div className="text-xs text-green-700 bg-green-50 p-2 rounded-md border border-green-200">
              <span className="font-medium">Contraseña:</span> 8+ caracteres, mayúscula, minúscula, número y símbolo (@$!%*?&)
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={onSwitchToLogin}
              className="text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
