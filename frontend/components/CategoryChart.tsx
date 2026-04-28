"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function CategoryChart({ transactions, type }: { transactions: any[], type: "income" | "expense" }) {
  
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    // Filter by type
    const filtered = transactions.filter(t => t.type === type);
    
    // Group by categoryName
    const grouped = filtered.reduce((acc: any, curr: any) => {
      const catName = curr.categoryName || "Uncategorized";
      if (!acc[catName]) {
        acc[catName] = 0;
      }
      acc[catName] += curr.amount;
      return acc;
    }, {});
    
    // Convert to array
    return Object.keys(grouped).map(key => ({
      name: key,
      value: grouped[key]
    })).sort((a, b) => b.value - a.value); // Sort by highest
  }, [transactions, type]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        No {type} data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 p-3 border border-slate-700 shadow-xl rounded-xl text-sm">
          <p className="font-bold text-gray-300 mb-1">{data.name}</p>
          <p className="font-semibold text-white">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{ fontSize: '12px', paddingLeft: '20px', color: '#e2e8f0' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
