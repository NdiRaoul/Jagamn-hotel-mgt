export default function KitchenReportingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in duration-500 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[#E6E8EA] flex items-center justify-center">
        <span className="text-3xl">📊</span>
      </div>
      <h1 className="manrope-bold text-3xl text-[#00152A]">Reporting</h1>
      <p className="text-gray-400 max-w-xs">
        Kitchen analytics and shift performance reports will appear here.
      </p>
    </div>
  );
}
