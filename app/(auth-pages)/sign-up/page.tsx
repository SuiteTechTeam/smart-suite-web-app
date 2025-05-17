import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { GitHubSignInButton } from "@/components/auth/github-sign-in-button";
import { Separator } from "@/components/ui/separator";

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
      <form className="flex flex-col">
        <h1 className="text-2xl font-medium">Registro</h1>
        <p className="text-sm text text-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Inicia sesión
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
          <Label htmlFor="password">Contraseña</Label>
          <Input
            type="password"
            name="password"
            placeholder="Tu contraseña"
            minLength={6}
            required
          />
          <SubmitButton formAction={signUpAction} pendingText="Registrando...">
            Registrarse
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}