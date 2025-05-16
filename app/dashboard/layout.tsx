export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">Dashboard Header</header>
      <main className="dashboard-content">{children}</main>
      <footer className="dashboard-footer">Dashboard Footer</footer>
    </div>
  );
}