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
  const [userName, setUserName] = useState<string>("");

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
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.name) setUserName(parsedUser.name);
        } catch (e) {
          console.error("Error parsing user data", e);
        }
      }
      fetchTransactions();
    }
  }, [router]);

  const addTransaction = (data: any) => {
    fetchTransactions();
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedTransaction: any) => {
    fetchTransactions();
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

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Filter transactions berdasarkan tab yang aktif
  const getFilteredTransactions = () => {
    let filtered = transactions;

    if (searchQuery) {
      filtered = filtered.filter(t => t.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (filterCategory) {
      filtered = filtered.filter(t => t.category?.name === filterCategory);
    }

    switch (activeTab) {
      case 'expense':
        filtered = filtered.filter((t) => t.type === 'expense');
        break;
      case 'income':
        filtered = filtered.filter((t) => t.type === 'income');
        break;
      case 'latest':
        // Sort by newest first (descending by timestamp)
        return [...filtered].sort((a, b) => {
          const dateA = new Date(a.timestamp || a.createdAt).getTime();
          const dateB = new Date(b.timestamp || b.createdAt).getTime();
          return dateB - dateA;
        }).slice(0, 10); // Show only 10 latest
    }

    // Apply sorting for other tabs
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.timestamp || a.createdAt).getTime();
      const dateB = new Date(b.timestamp || b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  const uniqueCategories = Array.from(
    new Set(
      transactions
        .filter(t => (activeTab === 'expense' ? t.type === 'expense' : activeTab === 'income' ? t.type === 'income' : true))
        .map(t => t.category?.name)
        .filter(Boolean)
    )
  );

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
          <p className="text-gray-400 mt-1">Welcome back{userName ? `, ${userName}` : ''}, track your finances effortlessly.</p>
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

            {/* CONTROLS AREA */}
            <div className="flex flex-col gap-4 mb-6 pb-5 border-b border-white/10">
              {/* ROW 1: TABS */}
              <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full">
                <button
                  onClick={() => setActiveTab('latest')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'latest'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/40'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  ⏱️ Terbaru
                </button>
                <button
                  onClick={() => setActiveTab('expense')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'expense'
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  📉 Pengeluaran
                </button>
                <button
                  onClick={() => setActiveTab('income')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    activeTab === 'income'
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  📈 Pemasukan
                </button>
              </div>
              
              {/* ROW 2: FILTERS */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
                <div className="sm:col-span-6 md:col-span-5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search by description..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-inner"
                  />
                </div>
                <div className="sm:col-span-3 md:col-span-4 relative">
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer appearance-none shadow-inner"
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map((catName: any, idx: number) => (
                      <option key={idx} value={catName}>{catName}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                <div className="sm:col-span-3 md:col-span-3 relative">
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer appearance-none shadow-inner"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
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
