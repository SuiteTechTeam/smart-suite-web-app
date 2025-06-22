import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routesConfig } from "@/lib/config/routes";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function AuthButton() {
	return (
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
