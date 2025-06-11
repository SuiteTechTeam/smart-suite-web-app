"use client";
import { useState, useEffect } from "react";
import { signIn } from "@/lib/services/auth-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Users, Shield, Crown, Sparkles, CheckCircle2 } from "lucide-react";
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
        // Guardar en localStorage y cookies
        localStorage.setItem('auth_token', result.data.token);
        localStorage.setItem('auth_user', JSON.stringify({
          id: result.data.id,
          email: result.data.email,
          roleId: form.roleId
        }));
        
        // Guardar en cookies para el middleware
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

  const roleLabels = {
    "3": "Guest",
    "2": "Admin", 
    "1": "Owner"
  };

  const FormMessage = ({ message }: { message: { type: "error" | "success"; text: string } | null }) => {
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
          <div className="p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h1>
              <p className="text-gray-600 text-lg">Sign in to your account</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Account Type</Label>
                <Select value={form.roleId} onValueChange={handleRoleChange} required>
                  <SelectTrigger className="h-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 text-base transition-colors">
                    <div className="flex items-center gap-3">
                      {roleIcons[form.roleId as keyof typeof roleIcons]}
                      <SelectValue placeholder="Select your role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1" className="h-12">
                      <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 text-purple-600" />
                        <span>Owner</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="2" className="h-12">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-emerald-600" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="3" className="h-12">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span>Guest</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</Label>
                <Input 
                  name="email" 
                  type="email"
                  value={form.email} 
                  onChange={handleChange} 
                  placeholder="Enter your email" 
                  required 
                  className="h-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-base transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-semibold text-gray-700">Password</Label>
                  <Link 
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium" 
                    href="/forgot-password"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="h-14 pr-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-base transition-colors"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {message && <FormMessage message={message} />}

              {/* Social Login */}
              <div className="text-center mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or continue with</span>
                  </div>
                </div>
                <div className="flex justify-center space-x-4 mt-6">
                  <button 
                    type="button" 
                    className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md flex items-center justify-center font-bold text-gray-700 text-lg transition-all"
                  >
                    G
                  </button>
                  <button 
                    type="button" 
                    className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md flex items-center justify-center font-bold text-gray-700 text-lg transition-all"
                  >
                    f
                  </button>
                  <button 
                    type="button" 
                    className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md flex items-center justify-center font-bold text-gray-700 text-lg transition-all"
                  >
                    in
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center mt-8">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link 
                    href="/sign-up" 
                    className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}