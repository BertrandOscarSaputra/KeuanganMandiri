"use client";
import { useState } from "react";

export default function TransactionForm({ onAdd }: any) {
  const [isOpen, setIsOpen] = useState(false);

  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");

  const submit = (e: any) => {
    e.preventDefault();

    if (!amount || !description) return;

    onAdd({
      id: Date.now(),
      amount: Number(amount),
      description,
      type,
    });

    // reset + close
    setAmount("");
    setDescription("");
    setType("expense");
    setIsOpen(false);
  };

  return (
    <>
      {/* +Add BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white px-4 py-3 rounded-xl shadow-lg"
      >
        + Add
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          
          {/* FORM BOX*/}
          <form
            onSubmit={submit}
            className="bg-white p-6 rounded shadow w-[300px] space-y-3"
          >
            <h2 className="font-bold text-lg">Add Transaction</h2>

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="border border-gray-400 p-2 w-full rounded text-sm"
            />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-400 p-2 w-full rounded text-sm"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-gray-400 p-2 w-full rounded text-sm"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            {/* ACTIONS */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded w-full"
              >
                Add
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded w-full"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}