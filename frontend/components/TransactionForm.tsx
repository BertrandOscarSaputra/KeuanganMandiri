"use client";
import { useState } from "react";

export default function TransactionForm({ onAdd }: any) {
  const [isOpen, setIsOpen] = useState(false);

  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();

    if (!amount || !description) return;

    setIsLoading(true);
    await onAdd({
      amount: Number(amount),
      description,
      type,
      date,
    });

    // reset + close
    setAmount("");
    setDescription("");
    setType("expense");
    setDate(new Date().toISOString().split('T')[0]);
    setIsLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      {/* +Add BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#2E76EF] hover:bg-[#2563EB] text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Transaction
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          
          {/* FORM BOX*/}
          <form
            onSubmit={submit}
            className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-4 font-sans text-gray-900"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-xl">Add Transaction</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-[#2E76EF] focus:border-[#2E76EF] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-[#2E76EF] focus:border-[#2E76EF] outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-[#2E76EF] focus:border-[#2E76EF] outline-none bg-white"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border border-gray-300 p-2.5 w-full rounded-lg text-sm focus:ring-2 focus:ring-[#2E76EF] focus:border-[#2E76EF] outline-none bg-white"
                  required
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#2E76EF] hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-lg w-full font-medium transition-colors disabled:opacity-70"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}