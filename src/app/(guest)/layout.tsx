export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="guest-layout flex flex-col min-h-screen">
      <header className="p-4 bg-slate-900 text-white">Guest Navbar</header>
      <main className="flex-1">{children}</main>
      <footer className="p-4 bg-slate-900 text-white mt-auto">Guest Footer</footer>
    </div>
  )
}
