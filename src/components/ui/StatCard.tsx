"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color: "green" | "blue" | "yellow" | "purple" | "teal";
  trend?: { value: number; positive: boolean };
}

const colors = {
  green: { bg: "bg-primary-50", icon: "bg-primary-600", text: "text-primary-700" },
  blue: { bg: "bg-blue-50", icon: "bg-blue-600", text: "text-blue-700" },
  yellow: { bg: "bg-yellow-50", icon: "bg-yellow-500", text: "text-yellow-700" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-600", text: "text-purple-700" },
  teal: { bg: "bg-teal-50", icon: "bg-teal-600", text: "text-teal-700" },
};

export default function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
  const c = colors[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card ${c.bg} border-0`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className={`text-3xl font-display font-bold ${c.text}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-semibold mt-2 ${trend.positive ? "text-primary-600" : "text-red-500"}`}>
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% ce mois
            </p>
          )}
        </div>
        <div className={`${c.icon} w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}