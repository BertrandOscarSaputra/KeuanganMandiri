export default function SummaryCard({ title, amount, type }: any) {
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  let bgClass = "from-blue-600/40 to-indigo-600/40 border-blue-500/30";
  let icon = "💰";
  
  if (type === "income") {
    bgClass = "from-emerald-600/40 to-teal-600/40 border-emerald-500/30";
    icon = "📈";
  } else if (type === "expense") {
    bgClass = "from-rose-600/40 to-pink-600/40 border-rose-500/30";
    icon = "📉";
  }

  return (
    <div className={`bg-gradient-to-br ${bgClass} backdrop-blur-xl border p-6 rounded-3xl shadow-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between overflow-hidden relative group`}>
      <div className="absolute -right-4 -top-4 text-6xl opacity-20 transform group-hover:scale-110 transition-transform duration-500 ease-out">{icon}</div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">{formatRupiah(amount)}</h2>
      </div>
    </div>
  );
}