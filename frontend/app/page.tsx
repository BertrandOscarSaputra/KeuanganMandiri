"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../components/Navbar";
import SummaryCard from "../components/SummaryCard";
import ChatBox from "../components/ChatBox";
import TransactionCard from "../components/TransactionCard";
import TransactionForm from "@/components/TransactionForm";
import DashboardChart from "@/components/DashboardChart";
import { analyticsService } from "@/services/analyticsService";
import { getTransactions, addTransaction } from "@/services/transactionServices";

export default function Home() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlyData: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [dashboardData, txData] = await Promise.all([
        analyticsService.getDashboard(),
        getTransactions()
      ]);
      setDashboard(dashboardData);
      setTransactions(txData);
    } catch (error) {
      // Silently catch errors so Next.js doesn't show an overlay.
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      fetchData();
    }
  }, [router]);

  const handleAddTransaction = async (data: any) => {
    try {
      await addTransaction(data);
      fetchData(); // Refresh data after adding
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen font-sans text-gray-900">
      <Navbar />

      <h1 className="text-xl sm:text-2xl font-bold mb-4">Dashboard</h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard title="Saldo" amount={dashboard.balance} />
        <SummaryCard title="Income" amount={dashboard.totalIncome} />
        <SummaryCard title="Expense" amount={dashboard.totalExpense} />
      </div>

      {/*  MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Chart + Transactions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CHART */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[320px]">
            <h2 className="font-bold text-lg mb-4">Cash Flow Overview</h2>
            <div className="flex-1 min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin h-6 w-6 border-2 border-[#2E76EF] border-t-transparent rounded-full" />
                </div>
              ) : (
                <DashboardChart data={dashboard.monthlyData || []} />
              )}
            </div>
          </div>

          {/* TRANSACTIONS */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Transactions</h2>
              <TransactionForm onAdd={handleAddTransaction} />
            </div>

            {/* SCROLL AREA */}
            <div className="flex-1 overflow-y-auto pr-2">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-[#2E76EF] border-t-transparent rounded-full" />
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No Transaction Found</p>
              ) : (
                transactions.map((item) => (
                  <TransactionCard key={item.id} item={item} />
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Chatbox */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-[844px] flex flex-col">
          <ChatBox />
        </div>
      </div>
    </div>
  );
}
