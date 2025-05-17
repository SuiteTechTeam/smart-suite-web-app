import Link from "next/link";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <nav className="flex justify-between items-center p-4 bg-transparent text-black border-b-blacko">
            <Image src="/logos/logo-smart-suite-bg-translucent.png" alt="Logo" width={50} height={50} />
            <Link href="/dashboard/iot" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              Dashboard
            </Link>
            <Link href="/dashboard/inventory" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              Inventario
            </Link>
            <Link href="/dashboard/analytics" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              Analytics
            </Link>
            <Link href="/dashboard/rooms" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              Rooms 
            </Link>
        </nav>
      </header>
      <main className="dashboard-content">{children}</main>
      <footer className="dashboard-footer">Dashboard Footer</footer>
    </div>
  );
}