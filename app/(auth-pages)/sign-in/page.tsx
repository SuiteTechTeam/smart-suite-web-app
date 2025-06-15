"use client";
import { useState, useEffect } from "react";
import { signIn } from "@/lib/services/auth-service";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Users, Shield, Crown, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    roleId: "2"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (userData.id && userData.email && token.trim() !== '') {
          router.replace('/dashboard/analytics');
          return;
        }
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleRoleChange = (value: string) => {
    setForm({ ...form, roleId: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const result = await signIn(form.email, form.password, Number(form.roleId));
      if (result.success && result.data) {
        localStorage.setItem('auth_token', result.data.token);
        localStorage.setItem('auth_user', JSON.stringify({
          id: result.data.id,
          email: result.data.email,
          roleId: form.roleId
        }));
        document.cookie = `auth_token=${result.data.token}; path=/; max-age=86400; secure; samesite=strict`;
        document.cookie = `auth_user=${JSON.stringify({
          id: result.data.id,
          email: result.data.email,
          roleId: form.roleId
        })}; path=/; max-age=86400; secure; samesite=strict`;
        setMessage({ type: "success", text: "Login exitoso. Redirigiendo..." });
        setTimeout(() => {
          window.location.href = "/dashboard/analytics";
        }, 1000);
      } else {
        setMessage({ type: "error", text: result.message || "Credenciales incorrectas" });
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Error al iniciar sesión" });
    } finally {
      setPending(false);
    }
  };

  const roleIcons = {
    "3": <Users className="w-5 h-5" />,
    "2": <Shield className="w-5 h-5" />,
    "1": <Crown className="w-5 h-5" />
  };

  const FormMessage = ({ message }: { message: { type: "error" | "success"; text: string } | null }) => {
    if (!message) return null;
    return (
      <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
        message.type === 'error'
          ? 'bg-destructive/10 text-destructive border border-destructive/20'
          : 'bg-green-50 text-green-700 border border-green-100'
      }`}>
        {message.type === 'success' && <CheckCircle2 size={16} />}
        {message.text}
      </div>
    );
  };

  return (
    <div className="flex flex-1 min-h-[80vh] items-center justify-center py-8">
      <div className="w-full max-w-md">
        <Card className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl">
          <CardHeader className="text-center mb-2">
            <div className="flex flex-col items-center mb-2 gap-2">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg mb-3">
                <LogIn className="w-7 h-7 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold mb-1">Bienvenido</CardTitle>
              <CardDescription className="text-muted-foreground text-base">Inicia sesión en tu cuenta</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label className="text-sm font-semibold text-foreground mb-2 block">Tipo de cuenta</Label>
                <Select value={form.roleId} onValueChange={handleRoleChange} required>
                  <SelectTrigger className="h-12 border border-border bg-background text-foreground rounded-lg focus:border-primary text-base">
                    <div className="flex items-center gap-3">
                      {roleIcons[form.roleId as keyof typeof roleIcons]}
                      <SelectValue placeholder="Selecciona tu rol" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-card text-foreground">
                    <SelectItem value="1" className="h-10">Owner</SelectItem>
                    <SelectItem value="2" className="h-10">Admin</SelectItem>
                    <SelectItem value="3" className="h-10">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-foreground mb-1 block">Correo electrónico</Label>
                <Input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Ingresa tu email"
                  required
                  className="h-12 border border-border bg-background text-foreground rounded-lg focus:border-primary focus:ring-0 text-base"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-sm font-semibold text-foreground">Contraseña</Label>
                  <Link
                    className="text-sm text-primary hover:underline font-medium"
                    href="/forgot-password"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña"
                    required
                    className="h-12 pr-12 border border-border bg-background text-foreground rounded-lg focus:border-primary focus:ring-0 text-base"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
              {message && <FormMessage message={message} />}
              <div className="text-center mt-6">
                <p className="text-muted-foreground">
                  ¿No tienes una cuenta?{' '}
                  <Link
                    href="/sign-up"
                    className="text-primary font-semibold hover:underline"
                  >
                    Regístrate
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}