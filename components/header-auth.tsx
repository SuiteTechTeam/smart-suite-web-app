import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import { routesConfig } from "@/lib/config/routes";
import { ThemeProvider } from "next-themes";
import { ThemeSwitcher } from "./theme-switcher";

export default async function AuthButton() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	return user ? (
		<div className="flex items-center gap-4">
			Hola Logueado
		</div>
	) : (
		<div className="flex gap-6 items-center">
			{" "}
			<div className="flex gap-3 ml-auto">
				<Button asChild size="sm" variant="outline">
					<Link href={routesConfig.public.signIn.path}>Iniciar sesión</Link>
				</Button>
				<Button asChild size="sm" variant="default">
					<Link href={routesConfig.public.signUp.path}>Registrate</Link>
				</Button>
				<ThemeSwitcher />

			</div>

		</div>
	);
}
