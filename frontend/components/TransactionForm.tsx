"use client";
import { useState, useEffect } from "react";
import api from "../services/api";

export default function TransactionForm({ onAdd }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<any[]>([]);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionTime, setTransactionTime] = useState(new Date().toTimeString().slice(0, 5));

  // Fetch categories when form opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories(type);
    }
  }, [isOpen, type]);

  const fetchCategories = async (selectedType: string) => {
    try {
      const response = await api.get(`/categories?type=${selectedType}`);
      setCategories(response.data);
      if (response.data.length > 0) {
        setCategoryId(response.data[0].id);
      } else {
        setCategoryId("");
      }
    } catch (error) {
      console.error("Gagal mengambil kategori", error);
    }
  };

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setLoading(true);
    try {
      const response = await api.post("/categories", { name: newCategoryName, type });
      setCategories([...categories, response.data]);
      setCategoryId(response.data.id);
      setIsCreatingCategory(false);
      setNewCategoryName("");
    } catch (error) {
      console.error("Gagal membuat kategori", error);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: any) => {
    e.preventDefault();

    if (!amount || !description) return;
    setLoading(true);

    try {
      const response = await api.post("/transactions", {
        amount: Number(amount),
        description,
        type,
        categoryId: categoryId ? Number(categoryId) : null,
        date: transactionDate
      });

      onAdd(response.data);

      // reset + close
      setAmount("");
      setDescription("");
      setType("expense");
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setTransactionTime(new Date().toTimeString().slice(0, 5));
      setIsOpen(false);
    } catch (error: any) {
      console.error("Gagal menyimpan transaksi", error);
      const errorMsg = error?.response?.data?.message || error?.response?.data || error.message;
      alert(`Gagal menyimpan transaksi!\nAlasan: ${typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* +Add BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed cursor-pointer bottom-8 right-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 transform hover:scale-110 transition-all duration-300 z-40 group flex items-center justify-center w-16 h-16"
        aria-label="Add Transaction"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">

          {/* FORM BOX*/}
          <form
            onSubmit={submit}
            className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-6 transform animate-fade-in-up"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-2xl text-white">New Transaction</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-2">
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
                    onClick={() => setType('expense')}
                    className={`py-2 px-4 rounded-xl text-sm font-medium transition-all ${type === 'expense' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-slate-700/50 text-gray-400 border border-transparent hover:bg-slate-700'}`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 px-4 rounded-xl text-sm font-medium transition-all ${type === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-700/50 text-gray-400 border border-transparent hover:bg-slate-700'}`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/30 p-3 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-gray-400 ml-1">Category</label>
                </div>
                
                {isCreatingCategory ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New category name..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button 
                      type="button" 
                      onClick={handleCreateCategory} 
                      disabled={loading || !newCategoryName.trim()} 
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsCreatingCategory(false)} 
                      className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {categories.length > 0 ? (
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                        className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm appearance-none"
                      >
                        <option value="" disabled>Select category...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex-1 px-3 py-2 text-sm text-gray-500 italic flex items-center">
                        No categories yet
                      </div>
                    )}
                    <button 
                      type="button" 
                      onClick={() => setIsCreatingCategory(true)} 
                      className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors"
                    >
                      + New
                    </button>
                  </div>
                )}
              </div>

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
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Save Transaction
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}