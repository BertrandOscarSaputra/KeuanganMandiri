export default function SummaryCard({ title, amount }: any) {
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount || 0);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{formattedAmount}</h2>
    </div>
  );
}