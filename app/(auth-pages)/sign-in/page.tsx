import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { GitHubSignInButton } from "@/components/auth/github-sign-in-button";
import { Separator } from "@/components/ui/separator";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex-1 flex flex-col">
      <h1 className="text-2xl font-medium">Iniciar sesión</h1>
      <p className="text-sm text-foreground">
        ¿No tienes una cuenta?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Regístrate
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <GoogleSignInButton />
        <GitHubSignInButton />
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              O continúa con
            </span>
          </div>
        </div>
        <Label htmlFor="email">Correo electrónico</Label>
        <Input name="email" placeholder="tu@ejemplo.com" required />
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
        />
        <SubmitButton pendingText="Iniciando sesión..." formAction={signInAction}>
          Iniciar sesión
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}