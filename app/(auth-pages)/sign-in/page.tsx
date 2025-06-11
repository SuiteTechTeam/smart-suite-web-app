"use client";
import { useState } from "react";
import { signIn } from "@/lib/services/auth-service";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    roleId: "2"
  });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

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
      const result = await signIn(form.email, form.password, Number(form.roleId));      if (result.success && result.data) {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-xl p-10 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-semibold mb-2">Iniciar sesión</h1>
        <p className="text-base text-foreground mb-6">
          ¿No tienes una cuenta?{" "}
          <Link className="text-foreground font-medium underline" href="/sign-up">
            Regístrate
          </Link>
        </p>
        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <Label htmlFor="roleId">Tipo de usuario</Label>
          <Select value={form.roleId} onValueChange={handleRoleChange} required>
            <SelectTrigger className="mb-3 w-full">
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Owner</SelectItem>
              <SelectItem value="2">Admin</SelectItem>
              <SelectItem value="3">Guest</SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input name="email" value={form.email} onChange={handleChange} placeholder="tu@ejemplo.com" required className="w-full" />
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Contraseña</Label>
            <Link className="text-xs text-foreground underline" href="/forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Tu contraseña"
            required
            className="w-full"
          />
          <button
            type="submit"
            className="w-full h-12 bg-blue-600 text-white rounded-xl font-semibold mt-2 disabled:opacity-60"
            disabled={pending}
          >
            {pending ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
          {message && (
            <div className={`p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-100'
                : 'bg-green-50 text-green-700 border border-green-100'
            }`}>
              {message.text}
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}