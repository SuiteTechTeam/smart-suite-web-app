export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="min-h-screen flex justify-center bg-background">
			<div className="w-full max-w-xl flex justify-center">
				{children}
			</div>
		</main>
	);
}
