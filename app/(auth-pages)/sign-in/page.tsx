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

// Agrega un campo para el tipo de usuario (roleId) al formulario de login
export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex-1 flex flex-col w-full max-w-xl mx-auto">
      <h1 className="text-2xl font-medium">Iniciar sesión</h1>
      <p className="text-sm text-foreground">
        ¿No tienes una cuenta?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Regístrate
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8 w-full max-w-xs mx-auto">
        {/* <GoogleSignInButton /> */}
        {/* <GitHubSignInButton /> */}
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
      </div>
    </form>
  );
}