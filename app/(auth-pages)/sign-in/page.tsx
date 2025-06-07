import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

// Agrega un campo para el tipo de usuario (roleId) al formulario de login
export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
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
        <form className="flex flex-col gap-4 w-full">
          <Label htmlFor="roleId">Tipo de usuario</Label>
          <Select name="roleId" defaultValue="2" required>
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
          <Input name="email" placeholder="tu@ejemplo.com" required className="w-full" />
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              className="text-xs text-foreground underline"
              href="/forgot-password"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            type="password"
            name="password"
            placeholder="Tu contraseña"
            required
            className="w-full"
          />
          <SubmitButton pendingText="Iniciando sesión..." formAction={signInAction}>
            Iniciar sesión
          </SubmitButton>
          <FormMessage message={searchParams} />
        </form>
      </Card>
    </div>
  );
}