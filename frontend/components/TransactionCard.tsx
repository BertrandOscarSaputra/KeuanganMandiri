export default function TransactionCard({ item }: any) {
  if (!item) {
    return <div className="text-red-500 text-sm">Data tidak ditemukan</div>;
  }

  const isIncome = item.type === "income";

  // Format currency
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(item.amount);

  // Format date
  const formattedDate = item.date 
    ? new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-3.5 mb-3 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex gap-3 items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isIncome ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{item.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-gray-500">{formattedDate}</p>
            {item.categoryName && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <p className="text-xs text-gray-500">{item.categoryName}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`font-bold ${isIncome ? "text-green-600" : "text-gray-900"}`}>
        {isIncome ? '+' : '-'}{formattedAmount}
      </div>
    </div>
  );
}