export default function TransactionCard({ item }: any) {
  if (!item) {
    return <div className="text-red-500">Data tidak ditemukan</div>;
  }

  return (
    <div className="flex justify-between bg-white p-3 mb-2 rounded shadow">
      <div>
        <p className="font-medium">{item.description}</p>
      </div>

      <div
        className={
          item.type === "income" ? "text-green-500" : "text-red-500"
        }
      >
        Rp {item.amount}
      </div>
    </div>
  );
}