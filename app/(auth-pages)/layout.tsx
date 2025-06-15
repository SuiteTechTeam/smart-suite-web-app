export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="h-screen overflow-hidden flex items-center justify-center bg-background">
			<div className="w-full h-full max-w-xl flex items-center justify-center">
				{children}
			</div>
		</main>
	);
}
