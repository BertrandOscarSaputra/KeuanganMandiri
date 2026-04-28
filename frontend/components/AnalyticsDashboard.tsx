"use client";
import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

export default function AnalyticsDashboard({ transactions }: any) {
  // Format currency
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Calculate summary metrics
  const summary = useMemo(() => {
    const income = transactions
      .filter((t: any) => t.type === "income")
      .reduce((acc: number, t: any) => acc + t.amount, 0);

    const expense = transactions
      .filter((t: any) => t.type === "expense")
      .reduce((acc: number, t: any) => acc + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      totalTransactions: transactions.length,
    };
  }, [transactions]);

  // Data for Income vs Expense Pie Chart
  const incomeExpenseData = useMemo(() => {
    return [
      {
        name: "Income",
        value: summary.income,
      },
      {
        name: "Expense",
        value: summary.expense,
      },
    ];
  }, [summary]);

  // Data for Category Breakdown (All)
  const categoryData = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};

    transactions.forEach((t: any) => {
      const categoryName = t.category?.name || "Uncategorized";
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + t.amount;
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: value as number,
    }));
  }, [transactions]);

  // Data for Category Breakdown - EXPENSE ONLY
  const expenseCategoryData = useMemo(() => {
    const categoryMap: { [key: string]: { amount: number; count: number } } = {};

    transactions
      .filter((t: any) => t.type === "expense")
      .forEach((t: any) => {
        const categoryName = t.category?.name || "Uncategorized";
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = { amount: 0, count: 0 };
        }
        categoryMap[categoryName].amount += t.amount;
        categoryMap[categoryName].count += 1;
      });

    return Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        value: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Data for Category Breakdown - INCOME ONLY
  const incomeCategoryData = useMemo(() => {
    const categoryMap: { [key: string]: { amount: number; count: number } } = {};

    transactions
      .filter((t: any) => t.type === "income")
      .forEach((t: any) => {
        const categoryName = t.category?.name || "Uncategorized";
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = { amount: 0, count: 0 };
        }
        categoryMap[categoryName].amount += t.amount;
        categoryMap[categoryName].count += 1;
      });

    return Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        value: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const [timeRange, setTimeRange] = useState<"monthly" | "weekly">("monthly");

  // Data for Monthly/Weekly Trend
  const timeSeriesData = useMemo(() => {
    const timeMap: {
      [key: string]: { income: number; expense: number };
    } = {};

    transactions.forEach((t: any) => {
      const date = new Date(t.timestamp || t.createdAt);
      
      let key = "";
      if (timeRange === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        // Calculate week of year (simple version)
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
        key = `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
      }

      if (!timeMap[key]) {
        timeMap[key] = { income: 0, expense: 0 };
      }

      if (t.type === "income") {
        timeMap[key].income += t.amount;
      } else {
        timeMap[key].expense += t.amount;
      }
    });

    return Object.entries(timeMap)
      .sort()
      .map(([period, data]) => ({
        period,
        ...data,
      }));
  }, [transactions, timeRange]);

  // Data for Type Distribution
  const typeData = useMemo(() => {
    const typeMap: { [key: string]: number } = {
      income: 0,
      expense: 0,
    };

    transactions.forEach((t: any) => {
      typeMap[t.type] = (typeMap[t.type] || 0) + 1;
    });

    return [
      { name: "Income", value: typeMap.income },
      { name: "Expense", value: typeMap.expense },
    ];
  }, [transactions]);

  const [trendChartType, setTrendChartType] = useState<"line" | "area" | "bar">("area");
  const [categoryView, setCategoryView] = useState<"expense" | "income">("expense");

  const COLORS = ["#10b981", "#ef4444"];
  const CATEGORY_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#6366f1", "#14b8a6"];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl border border-blue-500/20 p-6 rounded-2xl shadow-lg transition-transform hover:scale-105">
          <p className="text-gray-400 text-sm mb-2 font-medium">Total Balance</p>
          <p className="text-2xl font-bold text-blue-400">
            {formatRupiah(summary.balance)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-xl border border-emerald-500/20 p-6 rounded-2xl shadow-lg transition-transform hover:scale-105">
          <p className="text-gray-400 text-sm mb-2 font-medium">Total Income</p>
          <p className="text-2xl font-bold text-emerald-400">
            {formatRupiah(summary.income)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-rose-500/20 to-rose-600/10 backdrop-blur-xl border border-rose-500/20 p-6 rounded-2xl shadow-lg transition-transform hover:scale-105">
          <p className="text-gray-400 text-sm mb-2 font-medium">Total Expense</p>
          <p className="text-2xl font-bold text-rose-400">
            {formatRupiah(summary.expense)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl border border-purple-500/20 p-6 rounded-2xl shadow-lg transition-transform hover:scale-105">
          <p className="text-gray-400 text-sm mb-2 font-medium">Total Transactions</p>
          <p className="text-2xl font-bold text-purple-400">
            {summary.totalTransactions}
          </p>
        </div>
      </div>

      {/* Time Series Trend with Variations */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg relative">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-white">Cash Flow Trend</h3>
            <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden p-1">
              <button
                onClick={() => setTimeRange("weekly")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === 'weekly' ? 'bg-slate-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange("monthly")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === 'monthly' ? 'bg-slate-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden p-1">
            <button
              onClick={() => setTrendChartType("area")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${trendChartType === 'area' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              Area
            </button>
            <button
              onClick={() => setTrendChartType("line")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${trendChartType === 'line' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              Line
            </button>
            <button
              onClick={() => setTrendChartType("bar")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${trendChartType === 'bar' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              Bar
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          {trendChartType === "area" ? (
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="period" stroke="#9ca3af" tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#9ca3af" tickFormatter={(v) => `Rp${v/1000}k`} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value: any) => formatRupiah(value)}
                contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px" }}
                itemStyle={{ fontWeight: "bold", color: "#fff" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          ) : trendChartType === "bar" ? (
            <BarChart data={timeSeriesData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="period" stroke="#9ca3af" tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#9ca3af" tickFormatter={(v) => `Rp${v/1000}k`} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value: any) => formatRupiah(value)}
                contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                itemStyle={{ fontWeight: "bold", color: "#fff" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="period" stroke="#9ca3af" tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#9ca3af" tickFormatter={(v) => `Rp${v/1000}k`} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value: any) => formatRupiah(value)}
                contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                itemStyle={{ fontWeight: "bold", color: "#fff" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Category Breakdown</h3>
            <div className="flex bg-slate-800 border border-slate-700 rounded-lg overflow-hidden p-1">
              <button
                onClick={() => setCategoryView("expense")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${categoryView === 'expense' ? 'bg-rose-500/30 text-rose-300' : 'text-gray-400 hover:text-white'}`}
              >
                Expense
              </button>
              <button
                onClick={() => setCategoryView("income")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${categoryView === 'income' ? 'bg-emerald-500/30 text-emerald-300' : 'text-gray-400 hover:text-white'}`}
              >
                Income
              </button>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            {categoryView === "expense" ? (
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  labelLine={false}
                >
                  {expenseCategoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatRupiah(value)}
                  contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  itemStyle={{ fontWeight: "bold", color: "#fff" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: "#e2e8f0", fontSize: "12px" }} iconType="circle" />
              </PieChart>
            ) : (
              <PieChart>
                <Pie
                  data={incomeCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  labelLine={false}
                >
                  {incomeCategoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatRupiah(value)}
                  contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  itemStyle={{ fontWeight: "bold", color: "#fff" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ color: "#e2e8f0", fontSize: "12px" }} iconType="circle" />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Overview Pie Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-white">Overall Cash Flow</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeExpenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => formatRupiah(value)}
                contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                itemStyle={{ fontWeight: "bold", color: "#fff" }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: "#e2e8f0" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
