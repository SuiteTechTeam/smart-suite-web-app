"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowLeft, CheckCircle2, Users, Shield, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { signIn, signUp } from "@/lib/services/auth-service";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Message = { type: "error" | "success"; text: string } | null;

export default function SmartSuiteSignup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    roleId: "3",
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('auth_user');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          if (userData.id && userData.email && token.trim() !== '') {
            // Usuario ya autenticado, redirigir al dashboard
            router.replace('/dashboard/analytics');
            return;
          }
        } catch (error) {
          // Si hay error al parsear, limpiar datos corruptos
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRadioChange = (value: string) => {
    setForm({ ...form, roleId: value });
  };

  const handleNext = (e: React.FormEvent<HTMLDivElement> | React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.surname || !form.email || !form.password || !form.confirmPassword) {
      setMessage({ type: "error", text: "Por favor complete todos los campos requeridos" });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    if (!form.acceptTerms) {
      setMessage({ type: "error", text: "Debe aceptar los términos y condiciones" });
      return;
    }

    setMessage(null);
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e: React.FormEvent<HTMLDivElement> | React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setMessage(null);

    try {
      const result = await signUp({
        name: form.name,
        surname: form.surname,
        phone: form.phone,
        email: form.email,
        password: form.password,
        roleId: Number(form.roleId),
      });
      if (!result.success) {
        setMessage({ type: "error", text: result.message || "No se pudo registrar el usuario." });
        setPending(false);
        return;
      }
      // Login automático tras registro
      const loginResult = await signIn(form.email, form.password, Number(form.roleId));
      if (loginResult.success && loginResult.data) {
        // Guardar token y usuario en localStorage y cookies
        localStorage.setItem('auth_token', loginResult.data.token);
        localStorage.setItem('auth_user', JSON.stringify({
          id: loginResult.data.id,
          email: loginResult.data.email,
          roleId: form.roleId
        }));
        
        // Guardar en cookies para el middleware
        document.cookie = `auth_token=${loginResult.data.token}; path=/; max-age=86400; secure; samesite=strict`;
        document.cookie = `auth_user=${JSON.stringify({
          id: loginResult.data.id,
          email: loginResult.data.email,
          roleId: form.roleId
        })}; path=/; max-age=86400; secure; samesite=strict`;
        
        setMessage({ type: "success", text: "Registro exitoso. Redirigiendo al dashboard..." });
        toast.success("Registro exitoso. Redirigiendo al dashboard...");
        setTimeout(() => {
          window.location.href = "/dashboard/analytics";
        }, 1500);
      } else {
        setMessage({ type: "error", text: loginResult.message || "No se pudo iniciar sesión automáticamente." });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Error al registrarse. Intenta nuevamente." });
    } finally {
      setPending(false);
    }
  };

  const FormMessage = ({ message }: { message: Message }) => {
    if (!message) return null;
    return (
      <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
        message.type === 'error'
          ? 'bg-red-50 text-red-700 border border-red-100'
          : 'bg-green-50 text-green-700 border border-green-100'
      }`}>
        {message.type === 'success' && <CheckCircle2 size={16} />}
        {message.text}
      </div>
    );
  };

  const roleIcons = {
    "3": <Users className="w-6 h-6" />,
    "2": <Shield className="w-6 h-6" />,
    "1": <Crown className="w-6 h-6" />
  };

  const roleColors = {
    "3": "from-blue-500 to-cyan-500",
    "2": "from-emerald-500 to-teal-500", 
    "1": "from-purple-500 to-pink-500"
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background text-foreground px-2 py-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
              ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'}`}
            >
              1
            </div>
            <div className={`h-1 w-16 rounded-full transition-all duration-300
              ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
              ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'}`}
            >
              2
            </div>
          </div>
        </div>

        <Card className="bg-card shadow-lg border border-border rounded-3xl overflow-hidden">
          {step === 1 ? (
            <div className="p-8 sm:p-10">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-muted rounded-2xl mx-auto flex items-center justify-center border border-border">
                    <Sparkles className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">Crear cuenta</h1>
                <p className="text-muted-foreground text-base">Únete al cambio innovador</p>
              </div>

              <form onSubmit={handleNext} className="space-y-6">
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-card-foreground mb-2 block">Nombre</Label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="name"
                      className="h-12 border border-border rounded-lg focus:border-primary focus:ring-0 text-base bg-background text-foreground"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-card-foreground mb-2 block">Apellido</Label>
                    <Input
                      name="surname"
                      value={form.surname}
                      onChange={handleChange}
                      placeholder="apellido"
                      className="h-12 border border-border rounded-lg focus:border-primary focus:ring-0 text-base bg-background text-foreground"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label className="text-sm font-semibold text-card-foreground mb-2 block">Correo electrónico</Label>
                  <Input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@test.com"
                    className="h-12 border border-border rounded-lg focus:border-primary focus:ring-0 text-base bg-background text-foreground"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label className="text-sm font-semibold text-card-foreground mb-2 block">Teléfono</Label>
                  <Input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="999 888 547"
                    className="h-12 border border-border rounded-lg focus:border-primary focus:ring-0 text-base bg-background text-foreground pl-4"
                    required
                  />
                </div>

                {/* Password & Confirm Password Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-card-foreground mb-2 block">Contraseña</Label>
                    <div className="relative">
                      <Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••••••••"
                        className="h-12 pr-12 border border-border rounded-lg focus:border-primary focus:ring-0 text-base bg-background text-foreground"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={0}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-card-foreground mb-2 block">Confirmar contraseña</Label>
                    <div className="relative">
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••••••••"
                        className="h-12 pr-12 border border-border rounded-lg focus:border-primary focus:ring-0 text-base bg-background text-foreground"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={0}
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg border border-border">
                  <Checkbox 
                    id="acceptTerms" 
                    name="acceptTerms"
                    onCheckedChange={(checked: boolean | "indeterminate") => setForm({...form, acceptTerms: checked === true})}
                    className="mt-0.5 border-border"
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    Acepto los <span className="text-primary font-semibold hover:underline">Términos de servicio</span> y <span className="text-primary font-semibold hover:underline">Política de privacidad</span>
                  </label>
                </div>

                {/* Register Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-lg text-base shadow-none hover:bg-primary/90 transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    if (step === 1) {
                      handleNext(e as any);
                    } else {
                      handleSubmit(e as any);
                    }
                  }}
                >
                  Continuar a paso 2
                </Button>

                {message && <FormMessage message={message} />}

                {/* Login Link */}
                <div className="text-center mt-6">
                  <p className="text-muted-foreground">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/sign-in" className="text-primary font-semibold cursor-pointer hover:underline transition-colors">
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-8 sm:p-10">
              {/* Header Step 2 */}
              <div className="text-center mb-10">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-muted rounded-2xl mx-auto flex items-center justify-center border border-border">
                    <CheckCircle2 className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2">¡Casi listo!</h1>
                <p className="text-muted-foreground text-base mb-4">
                  En SmartSuite nos importa brindarte la mejor experiencia posible.
                </p>
                <p className="text-lg font-semibold text-card-foreground">¿Para quién será esta cuenta?</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <RadioGroup 
                  value={form.roleId} 
                  onValueChange={handleRadioChange}
                  className="space-y-4"
                >
                  {/* Guest */}
                  <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer
                    ${form.roleId === "3" ? 'border-primary bg-muted' : 'border-border bg-background'}`}
                  >
                    <div className="flex items-start space-x-4 p-5">
                      <RadioGroupItem id="guest" value="3" className="mt-2 border-border" />
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-primary bg-muted">
                        {roleIcons["3"]}
                      </div>
                      <div className="flex-1">
                        <label htmlFor="guest" className="font-bold text-base text-card-foreground block cursor-pointer">Guest</label>
                        <p className="text-muted-foreground mt-1 leading-relaxed text-sm">
                          Usaré mi cuenta para buscar y reservar una estadía en hotel.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Admin */}
                  <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer
                    ${form.roleId === "2" ? 'border-primary bg-muted' : 'border-border bg-background'}`}
                  >
                    <div className="flex items-start space-x-4 p-5">
                      <RadioGroupItem id="admin" value="2" className="mt-2 border-border" />
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-primary bg-muted">
                        {roleIcons["2"]}
                      </div>
                      <div className="flex-1">
                        <label htmlFor="admin" className="font-bold text-base text-card-foreground block cursor-pointer">Admin</label>
                        <p className="text-muted-foreground mt-1 leading-relaxed text-sm">
                          Seré responsable de gestionar y atender cada estadía dentro de un hotel.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer
                    ${form.roleId === "1" ? 'border-primary bg-muted' : 'border-border bg-background'}`}
                  >
                    <div className="flex items-start space-x-4 p-5">
                      <RadioGroupItem id="owner" value="1" className="mt-2 border-border" />
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-primary bg-muted">
                        {roleIcons["1"]}
                      </div>
                      <div className="flex-1">
                        <label htmlFor="owner" className="font-bold text-base text-card-foreground block cursor-pointer">Owner</label>
                        <p className="text-muted-foreground mt-1 leading-relaxed text-sm">
                          Estaré al tanto de todas las amenidades y gestión de mi hotel.
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-12 border border-border text-foreground bg-background hover:bg-muted rounded-lg font-semibold text-base transition-all"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Atrás
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 bg-primary text-primary-foreground font-semibold rounded-lg text-base shadow-none hover:bg-primary/90 transition-all"
                    disabled={pending}
                    onClick={e => {
                      e.preventDefault();
                      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                    }}
                  >
                    {pending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      'Completar registro'
                    )}
                  </Button>
                </div>

                {message && <FormMessage message={message} />}
                {/* Login Link */}
                <div className="text-center mt-6">
                  <p className="text-muted-foreground">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/sign-in" className="text-primary font-semibold cursor-pointer hover:underline transition-colors">
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}