export default function SummaryCard({ title, amount }: any) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p>{title}</p>
      <h2 className="font-bold">Rp {amount}</h2>
    </div>
  );
}