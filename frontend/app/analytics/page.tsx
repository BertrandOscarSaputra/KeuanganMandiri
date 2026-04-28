"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import api from "@/services/api";

export default function AnalyticsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/transactions");
      setTransactions(response.data);
    } catch (error) {
      console.error("Gagal mengambil data transaksi:", error);
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem("isLogin");
        localStorage.removeItem("token");
        router.push("/login");
      }
    } finally {
      setLoading(false);
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

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Analyze your financial data and trends
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-2xl shadow-lg text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center mx-auto">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-bold mb-2">No Transactions Yet</h3>
            <p className="text-gray-400">
              Create your first transaction to see analytics
            </p>
          </div>
        ) : (
          <AnalyticsDashboard transactions={transactions} />
        )}
      </div>
    </div>
  );
}
