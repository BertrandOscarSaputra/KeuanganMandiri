export default function TransactionCard({ item, onEdit, onDelete }: any) {
  if (!item) {
    return <div className="text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">Data tidak ditemukan</div>;
  }

  const isIncome = item.type === "income";

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatDateTime = (timestamp: string) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      return timestamp;
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus transaksi "${item.description}"?`)) {
      onDelete(item.id);
    }
  };

  return (
    <div className="flex justify-between items-center bg-white/5 hover:bg-white/10 border border-white/5 p-4 rounded-2xl shadow-sm transition-all duration-200 group">
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner flex-shrink-0 ${isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {isIncome ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-200 group-hover:text-white transition-colors text-base truncate">{item.description}</p>
          <div className="flex items-center gap-2 mt-1">
            {item.category && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${isIncome ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border-rose-500/20'}`}>
                {item.category.name}
              </span>
            )}
            <p className="text-xs text-gray-500">{formatDateTime(item.timestamp || item.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2">
        <div
          className={`font-bold text-lg tracking-wide flex-shrink-0 ${
            isIncome ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {isIncome ? "+" : "-"} {formatRupiah(item.amount)}
        </div>

        {/* Action Buttons */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 ml-3">
          <button
            onClick={() => onEdit(item)}
            className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 hover:text-blue-300 p-2 rounded-lg transition-colors"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 p-2 rounded-lg transition-colors"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}