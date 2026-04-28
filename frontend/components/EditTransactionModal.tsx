"use client";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function EditTransactionModal({ transaction, isOpen, onClose, onSave }: any) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<any[]>([]);
  const [transactionDate, setTransactionDate] = useState("");
  const [transactionTime, setTransactionTime] = useState("");

  // Load transaction data when modal opens
  useEffect(() => {
    if (isOpen && transaction) {
      setAmount(transaction.amount);
      setDescription(transaction.description);
      setType(transaction.type);
      setCategoryId(transaction.categoryId || "");
      
      // Parse timestamp
      if (transaction.timestamp) {
        const date = new Date(transaction.timestamp);
        setTransactionDate(date.toISOString().split('T')[0]);
        setTransactionTime(date.toTimeString().slice(0, 5));
      } else {
        setTransactionDate(new Date().toISOString().split('T')[0]);
        setTransactionTime(new Date().toTimeString().slice(0, 5));
      }
      
      fetchCategories(transaction.type);
    }
  }, [isOpen, transaction]);

  const fetchCategories = async (selectedType: string) => {
    try {
      const response = await api.get(`/categories?type=${selectedType}`);
      setCategories(response.data);
    } catch (error) {
      console.error("Gagal mengambil kategori", error);
    }
  };

  const submit = async (e: any) => {
    e.preventDefault();

    if (!amount || !description) return;
    setLoading(true);

    try {
      const dateTimeString = `${transactionDate}T${transactionTime}:00`;
      const response = await api.put(`/transactions/${transaction.id}`, {
        amount: Number(amount),
        description,
        type,
        categoryId: categoryId ? Number(categoryId) : null,
        timestamp: dateTimeString
      });

      onSave(response.data);
      onClose();
    } catch (error: any) {
      console.error("Gagal mengupdate transaksi", error);
      const errorMsg = error?.response?.data?.message || error?.response?.data || error.message;
      alert(`Gagal mengupdate transaksi!\nAlasan: ${typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <form
        onSubmit={submit}
        className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-6 transform animate-fade-in-up"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-2xl text-white">Edit Transaction</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  fetchCategories('expense');
                }}
                className={`py-2 px-4 rounded-xl text-sm font-medium transition-all ${type === 'expense' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-slate-700/50 text-gray-400 border border-transparent hover:bg-slate-700'}`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  fetchCategories('income');
                }}
                className={`py-2 px-4 rounded-xl text-sm font-medium transition-all ${type === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-700/50 text-gray-400 border border-transparent hover:bg-slate-700'}`}
              >
                Income
              </button>
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Amount (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Groceries, Salary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Date</label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Time</label>
              <input
                type="time"
                value={transactionTime}
                onChange={(e) => setTransactionTime(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="pt-2 space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? "Updating..." : "Update Transaction"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-700/50 hover:bg-slate-700 text-gray-300 font-medium py-3 rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
