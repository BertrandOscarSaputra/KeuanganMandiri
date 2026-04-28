"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function DashboardChart({ data }: { data: any[] }) {
  const [chartType, setChartType] = useState<"bar" | "area" | "line">("bar");
  const [viewType, setViewType] = useState<"comparison" | "balance">("comparison");

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        No chart data available
      </div>
    );
  }

  // Reverse the array to show chronological order (oldest to newest)
  const chartData = [...data].reverse().map(item => ({
    ...item,
    // Format "2026-04" to "Apr 2026"
    monthLabel: new Date(item.month + "-01").toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    balance: item.income - item.expense
  }));

  const formatRupiah = (value: number) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}M`;
    } else if (value <= -1000000) {
      return `-Rp ${(Math.abs(value) / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `Rp ${(value / 1000).toFixed(0)}k`;
    } else if (value <= -1000) {
      return `-Rp ${(Math.abs(value) / 1000).toFixed(0)}k`;
    }
    return `Rp ${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl text-sm min-w-[160px]">
          <p className="font-bold text-gray-700 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4 mb-1">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}
              </span>
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChartContent = () => {
    if (chartType === "bar") {
      return (
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={16}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={formatRupiah} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip cursor={{ fill: '#f9fafb' }} content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="circle" />
          {viewType === "comparison" ? (
            <>
              <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </>
          ) : (
            <Bar dataKey="balance" name="Net Balance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      );
    }

    if (chartType === "area") {
      return (
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={formatRupiah} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="circle" />
          {viewType === "comparison" ? (
            <>
              <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
            </>
          ) : (
            <Area type="monotone" dataKey="balance" name="Net Balance" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
          )}
        </AreaChart>
      );
    }

    // Line Chart
    return (
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tickFormatter={formatRupiah} tick={{ fontSize: 12, fill: '#6b7280' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="circle" />
        {viewType === "comparison" ? (
          <>
            <Line type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </>
        ) : (
          <Line type="monotone" dataKey="balance" name="Net Balance" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        )}
      </LineChart>
    );
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      
      {/* CONTROLS */}
      <div className="absolute -top-12 right-0 flex gap-2">
        <select
          value={viewType}
          onChange={(e) => setViewType(e.target.value as any)}
          className="text-xs bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2E76EF] cursor-pointer"
        >
          <option value="comparison">Income vs Expense</option>
          <option value="balance">Net Balance</option>
        </select>

        <div className="flex bg-gray-50 border border-gray-200 rounded-lg overflow-hidden p-0.5">
          <button
            onClick={() => setChartType("bar")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${chartType === 'bar' ? 'bg-white shadow-sm text-[#2E76EF]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType("area")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${chartType === 'area' ? 'bg-white shadow-sm text-[#2E76EF]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Area
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${chartType === 'line' ? 'bg-white shadow-sm text-[#2E76EF]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Line
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[200px] mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {renderChartContent()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
