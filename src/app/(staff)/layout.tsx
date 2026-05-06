export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="staff-layout flex min-h-screen">
      <aside className="w-64 bg-slate-800 text-white p-4">Staff Sidebar</aside>
      <div className="flex-1 flex flex-col">
        <header className="p-4 bg-slate-100 border-b text-slate-900">Staff Header</header>
        <main className="flex-1 p-6 text-slate-900">{children}</main>
      </div>
    </div>
  )
}
