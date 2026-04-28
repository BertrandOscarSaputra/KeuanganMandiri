"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../components/Navbar";
import SummaryCard from "../components/SummaryCard";
import ChatBox from "../components/ChatBox";
import TransactionCard from "../components/TransactionCard";
import TransactionForm from "@/components/TransactionForm";

export default function Home() {
  const router = useRouter();

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const addTransaction = (data: any) => {
    setTransactions((prev) => [...prev, data]);
  };

  //SUMMARY
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <Navbar />

      <h1 className="text-xl sm:text-2xl font-bold mb-4">Dashboard</h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard title="Saldo" amount={balance} />
        <SummaryCard title="Income" amount={income} />
        <SummaryCard title="Expense" amount={expense} />
      </div>

      {/*  MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div
          className="lg:col-span-2 bg-white p-4 rounded-xl shadow 
                max-h-[calc(100vh-220px)] flex flex-col"
        >
          <h2 className="font-bold mb-3">Transactions</h2>

          <TransactionForm onAdd={addTransaction} />

          {/* SCROLL AREA */}
          <div className="flex-1 overflow-y-auto pr-2">
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-500">No Transaction</p>
            ) : (
              transactions.map((item) => (
                <TransactionCard key={item.id} item={item} />
              ))
            )}
          </div>
        </div>

        {/* Chatbox */}
        <div className="bg-white p-4 rounded-xl shadow h-[300px] flex flex-col">
          <ChatBox />
        </div>
      </div>
    </div>
  );
}
