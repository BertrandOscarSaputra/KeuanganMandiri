"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../components/Navbar";
import SummaryCard from "../components/SummaryCard";
import ChatBox from "../components/ChatBox";
import TransactionCard from "../components/TransactionCard";
import TransactionForm from "@/components/TransactionForm";
import EditTransactionModal from "@/components/EditTransactionModal";

import api from "../services/api";

export default function Home() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income' | 'latest'>('latest');

  const fetchTransactions = async () => {
    try {
      const [txResponse, catResponse] = await Promise.all([
        api.get("/transactions"),
        api.get("/categories")
      ]);
      
      const categoriesMap = new Map();
      catResponse.data.forEach((cat: any) => {
        categoriesMap.set(cat.id, cat);
      });

      const transactionsWithCategory = txResponse.data.map((t: any) => ({
        ...t,
        category: t.categoryId ? categoriesMap.get(t.categoryId) : null
      }));

      setTransactions(transactionsWithCategory);
    } catch (error: any) {
      console.error("Gagal mengambil data transaksi:", error);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem("isLogin");
        localStorage.removeItem("token");
        router.push("/login");
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    const isLogin = localStorage.getItem("isLogin");
    if (!isLogin) {
      router.push("/login");
    } else {
      fetchTransactions();
    }
  }, [router]);

  const addTransaction = (data: any) => {
    // Karena kita sudah kirim ke API di TransactionForm, kita bisa tambah ke state atau panggil fetch lagi
    setTransactions((prev) => [...prev, data]);
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedTransaction: any) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    try {
      await api.delete(`/transactions/${transactionId}`);
      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    } catch (error: any) {
      console.error("Gagal menghapus transaksi", error);
      const errorMsg = error?.response?.data?.message || error?.response?.data || error.message;
      alert(`Gagal menghapus transaksi!\nAlasan: ${typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}`);
    }
  };

  //SUMMARY
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;

  // Filter transactions berdasarkan tab yang aktif
  const getFilteredTransactions = () => {
    switch (activeTab) {
      case 'expense':
        return transactions.filter((t) => t.type === 'expense');
      case 'income':
        return transactions.filter((t) => t.type === 'income');
      case 'latest':
        // Sort by newest first (descending by timestamp)
        return [...transactions].sort((a, b) => {
          const dateA = new Date(a.timestamp || a.createdAt).getTime();
          const dateB = new Date(b.timestamp || b.createdAt).getTime();
          return dateB - dateA;
        }).slice(0, 10); // Show only 10 latest
      default:
        return transactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <Navbar />

        <div className="mb-8 mt-4 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, track your finances effortlessly.</p>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <SummaryCard title="Total Balance" amount={balance} type="balance" />
          <SummaryCard title="Total Income" amount={income} type="income" />
          <SummaryCard title="Total Expense" amount={expense} type="expense" />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl h-[600px] flex flex-col transition-all duration-300 hover:bg-white/[0.12]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                {activeTab === 'latest' && 'Latest Transactions'}
                {activeTab === 'expense' && 'Pengeluaran'}
                {activeTab === 'income' && 'Pemasukan'}
                {activeTab === 'all' && 'All Transactions'}
              </h2>
            </div>

            {/* TAB BUTTONS */}
            <div className="flex gap-2 mb-6 pb-4 border-b border-white/10">
              <button
                onClick={() => setActiveTab('latest')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'latest'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/40'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                ⏱️ Terbaru
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'expense'
                    ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                📉 Pengeluaran
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'income'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                📈 Pemasukan
              </button>
            </div>

            <TransactionForm onAdd={addTransaction} />

            {/* SCROLL AREA */}
            <div className="flex-1 overflow-y-auto pr-3 space-y-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
              {filteredTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <p className="text-gray-400">
                    {activeTab === 'latest' && 'No recent transactions.'}
                    {activeTab === 'expense' && 'No expenses recorded.'}
                    {activeTab === 'income' && 'No income recorded.'}
                    {activeTab === 'all' && 'No transactions yet.'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Add one to get started!</p>
                </div>
              ) : (
                filteredTransactions.map((item) => (
                  <TransactionCard 
                    key={item.id} 
                    item={item}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                  />
                ))
              )}
            </div>
          </div>

          {/* Chatbox */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl h-[600px] flex flex-col transition-all duration-300 hover:bg-white/[0.12]">
             <h2 className="text-xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">Mandiri AI</h2>
            <ChatBox />
          </div>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal 
        transaction={editingTransaction}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
