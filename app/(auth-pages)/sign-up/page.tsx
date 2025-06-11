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
import { signUpActionWithData } from "@/app/actions";
import { signIn } from "@/lib/services/auth-service";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SmartSuiteSignup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    roleId: "3",
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pending, setPending] = useState(false);  type Message = { type: "error" | "success"; text: string } | null;
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
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
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
      await signUpActionWithData({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        roleId: form.roleId,
      });
      // Login automático tras registro
      const loginResult = await signIn(form.email, form.password, Number(form.roleId));      if (loginResult.success && loginResult.data) {
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
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <div className={`h-1 w-16 rounded-full transition-all duration-300 ${
            step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
        </div>
      </div>

      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
        {step === 1 ? (
          <div className="p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Create Your Account</h1>
              <p className="text-gray-600 text-lg">Join the innovative change</p>
            </div>

            <div onSubmit={handleNext} className="space-y-6">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Full Name</Label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Arian Rodriguez"
                    className="h-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-base transition-colors"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</Label>
                  <Input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="mono@mauwiwi.com"
                    className="h-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-base transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number</Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                    <div className="w-6 h-4 bg-gradient-to-r from-red-500 via-white to-red-500 rounded-sm mr-3 border border-gray-300 flex">
                      <div className="flex-1 bg-red-500"></div>
                      <div className="w-1 bg-white"></div>
                      <div className="flex-1 bg-red-500"></div>
                    </div>
                  </div>
                  <Input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="999 888 547"
                    className="h-14 pl-16 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-base transition-colors"
                  />
                </div>
              </div>

              {/* Password & Confirm Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Password</Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••••••••"
                      className="h-14 pr-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-base transition-colors"
                      required
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
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••••••••"
                      className="h-14 pr-14 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-base transition-colors"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <Checkbox 
                  id="acceptTerms" 
                  name="acceptTerms"
                  onCheckedChange={(checked: boolean | "indeterminate") => setForm({...form, acceptTerms: checked === true})}
                  className="mt-0.5"
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                >
                  I accept the <span className="text-blue-600 font-semibold hover:underline">Terms of Service</span> and <span className="text-blue-600 font-semibold hover:underline">Privacy Policy</span>
                </label>
              </div>

              {/* Register Button */}
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                onClick={(e) => {
                  e.preventDefault();
                  if (step === 1) {
                    handleNext(e as any);
                  } else {
                    handleSubmit(e as any);
                  }
                }}
              >
                Continue to Step 2
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
                  <button type="button" className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md flex items-center justify-center font-bold text-gray-700 text-lg transition-all">
                    G
                  </button>
                  <button type="button" className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md flex items-center justify-center font-bold text-gray-700 text-lg transition-all">
                    f
                  </button>
                  <button type="button" className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md flex items-center justify-center font-bold text-gray-700 text-lg transition-all">
                    in
                  </button>
                </div>              </div>

              {/* Login Link */}
              <div className="text-center mt-8">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700 hover:underline transition-colors">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10">
            {/* Header Step 2 */}
            <div className="text-center mb-10">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Almost There!</h1>
              <p className="text-gray-600 text-lg mb-6">
                At SmartSuite we care about providing the best possible experience.
              </p>
              <p className="text-xl font-semibold text-gray-900">Who will this account be for?</p>
            </div>

            <div onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <RadioGroup 
                value={form.roleId} 
                onValueChange={handleRadioChange}
                className="space-y-4"
              >
                {/* Guest */}
                <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  form.roleId === "3" ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start space-x-4 p-6">
                    <RadioGroupItem id="guest" value="3" className="mt-2" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${roleColors["3"]}`}>
                      {roleIcons["3"]}
                    </div>
                    <div className="flex-1">
                      <label htmlFor="guest" className="font-bold text-lg text-gray-900 block cursor-pointer">Guest</label>
                      <p className="text-gray-600 mt-2 leading-relaxed">
                        I will use my account to search and book a hotel stay for the perfect experience.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin */}
                <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  form.roleId === "2" ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start space-x-4 p-6">
                    <RadioGroupItem id="admin" value="2" className="mt-2" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${roleColors["2"]}`}>
                      {roleIcons["2"]}
                    </div>
                    <div className="flex-1">
                      <label htmlFor="admin" className="font-bold text-lg text-gray-900 block cursor-pointer">Admin</label>
                      <p className="text-gray-600 mt-2 leading-relaxed">
                        I will be responsible for managing and handling each stay within a hotel to provide the greatest possible comfort.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Owner */}
                <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  form.roleId === "1" ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start space-x-4 p-6">
                    <RadioGroupItem id="owner" value="1" className="mt-2" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${roleColors["1"]}`}>
                      {roleIcons["1"]}
                    </div>
                    <div className="flex-1">
                      <label htmlFor="owner" className="font-bold text-lg text-gray-900 block cursor-pointer">Owner</label>
                      <p className="text-gray-600 mt-2 leading-relaxed">
                        I will be on top of all the amenities within my hotel and will manage what is necessary for my guests.
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-14 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-base transition-all"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={pending}
                  onClick={e => {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                  }}
                >
                  {pending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </div>

              {message && <FormMessage message={message} />}              {/* Login Link */}
              <div className="text-center mt-8">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700 hover:underline transition-colors">
                    Log In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}