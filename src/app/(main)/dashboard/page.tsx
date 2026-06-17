"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { motion } from "framer-motion";
import { RootState } from "@/store";
import api from "@/utils/api";
import StatCard from "@/components/ui/StatCard";
import { MdReportProblem, MdEco, MdStar, MdTipsAndUpdates } from "react-icons/md";
import { Metadata } from "next";

interface Stats {
  signals: number;
  activities: number;
  points: number;
  tips: number;
}

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSignals, setRecentSignals] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/signals?limit=3"),
      api.get("/tips?limit=3"),
    ]).then(([sigRes]) => {
      setRecentSignals(sigRes.data.data || []);
    }).catch(() => {});

    if (user) {
      setStats({
        signals: 0,
        activities: 0,
        points: user.points,
        tips: 0,
      });
    }
  }, [user]);

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <div className="space-y-6">
      {/* Salutation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-green rounded-2xl p-6 text-white overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 opacity-10 text-[10rem] leading-none">🌿</div>
        <h1 className="text-2xl font-display font-bold">
          {greetingTime()}, {user?.name?.split(" ")[0]} ! 👋
        </h1>
        <p className="text-white/80 mt-1">Continuez à contribuer pour des villes plus propres.</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
            <p className="text-xs text-white/70">Vos points</p>
            <p className="text-xl font-bold">🏆 {user?.points}</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm">
            <p className="text-xs text-white/70">Crédits</p>
            <p className="text-xl font-bold">📱 {user?.credits}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Mes signalements", value: "0", icon: <MdReportProblem />, color: "green" as const, subtitle: "dépôts signalés" },
          { title: "Activités éco", value: "0", icon: <MdEco />, color: "teal" as const, subtitle: "publiées" },
          { title: "Mes points", value: user?.points || 0, icon: <MdStar />, color: "yellow" as const, subtitle: "accumulés" },
          { title: "Astuces lues", value: "0", icon: <MdTipsAndUpdates />, color: "purple" as const, subtitle: "ce mois" },
        ].map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-lg font-display font-bold text-gray-800 mb-3">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/signals?new=1", label: "Signaler un dépôt", icon: "📍", color: "bg-red-50 border-red-200 text-red-700" },
            { href: "/schedule", label: "Voir le planning", icon: "📅", color: "bg-blue-50 border-blue-200 text-blue-700" },
            { href: "/tips", label: "Astuces recyclage", icon: "♻️", color: "bg-primary-50 border-primary-200 text-primary-700" },
            { href: "/activities?new=1", label: "Publier activité", icon: "🌱", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${action.color}`}
              >
                <span className="text-3xl">{action.icon}</span>
                <span className="text-xs font-semibold text-center leading-tight">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Points → Crédits */}
      <div className="card bg-gradient-to-r from-primary-50 to-emerald-50 border-primary-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-display font-bold text-gray-800">🎁 Convertir vos points en crédits</h3>
            <p className="text-sm text-gray-500 mt-1">100 points = 1 crédit de communication</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-700">{user?.points} pts</p>
            <Link href="/profile#rewards">
              <button className="btn-primary text-sm px-4 py-2 mt-2">Convertir</button>
            </Link>
          </div>
        </div>
        {/* Barre de progression */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progression</span>
            <span>{(user?.points || 0) % 100}/100 pour le prochain crédit</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((user?.points || 0) % 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-primary-500 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}