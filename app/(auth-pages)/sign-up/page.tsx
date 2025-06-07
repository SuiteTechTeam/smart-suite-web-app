import { signUpAction } from "@/app/actions";
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

// Agrega campos para nombre, apellido, teléfono y tipo de usuario (roleId) al formulario de registro
export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form className="flex-1 flex flex-col w-full max-w-xl mx-auto">
        <h1 className="text-2xl font-medium">Registro</h1>
        <p className="text-sm text text-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Inicia sesión
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8 w-full max-w-xs mx-auto">
          {/* <GoogleSignInButton /> */}
          {/* <GitHubSignInButton /> */}
          <Label htmlFor="name">Nombre</Label>
          <Input name="name" placeholder="Tu nombre" required className="w-full" />
          <Label htmlFor="surname">Apellido</Label>
          <Input name="surname" placeholder="Tu apellido" required className="w-full" />
          <Label htmlFor="phone">Teléfono</Label>
          <Input name="phone" placeholder="Tu teléfono" required className="w-full" />
          <Label htmlFor="email">Correo electrónico</Label>
          <Input name="email" placeholder="tu@ejemplo.com" required className="w-full" />
          <Label htmlFor="password">Contraseña</Label>
          <Input
            type="password"
            name="password"
            placeholder="Tu contraseña"
            minLength={6}
            required
            className="w-full"
          />
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
          <SubmitButton formAction={signUpAction} pendingText="Registrando...">
            Registrarse
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}