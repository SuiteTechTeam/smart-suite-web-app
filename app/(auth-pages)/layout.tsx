
export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="flex flex-col gap-12 items-center p-4 bg-backgroud min-h-screen pt-32">
			<div className="max-w-7xl flex flex-col gap-12 items-center">
				{children}
			</div>
		</main>
	);
}
