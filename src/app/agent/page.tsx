"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import api from "@/utils/api";
import { MdMap, MdRoute, MdCheckCircle, MdPending } from "react-icons/md";

export default function AgentDashboard() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [stats, setStats] = useState({ pendingSignals: 0, myCollections: 0, completed: 0 });

  useEffect(() => {
    Promise.all([
      api.get("/signals?status=PENDING&limit=1"),
      api.get("/collections?status=PLANNED&limit=1"),
      api.get("/collections?status=COMPLETED&limit=1"),
    ]).then(([p, pl, c]) => {
      setStats({
        pendingSignals: p.data.pagination?.total || 0,
        myCollections: pl.data.pagination?.total || 0,
        completed: c.data.pagination?.total || 0,
      });
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900">Bonjour, {user?.name?.split(" ")[0]} 👋</h2>
        <p className="text-gray-500 text-sm">Voici l'état de vos missions de collecte.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon:<MdPending size={24}/>, label:"Signalements en attente", value:stats.pendingSignals, color:"bg-orange-500", bg:"bg-orange-50" },
          { icon:<MdRoute size={24}/>, label:"Collectes planifiées", value:stats.myCollections, color:"bg-blue-500", bg:"bg-blue-50" },
          { icon:<MdCheckCircle size={24}/>, label:"Collectes terminées", value:stats.completed, color:"bg-primary-600", bg:"bg-primary-50" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.1 }}
            className={`card p-5 ${s.bg} border-0`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-11 h-11 ${s.color} rounded-xl flex items-center justify-center text-white`}>{s.icon}</div>
              <span className="text-3xl font-display font-bold text-gray-900">{s.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link href="/agent/map">
          <motion.div whileHover={{ y:-3 }} className="card p-6 border-2 border-primary-100 hover:border-primary-400 transition-all cursor-pointer">
            <div className="text-4xl mb-3">🗺️</div>
            <h3 className="font-display font-bold text-gray-900 mb-1">Voir la carte</h3>
            <p className="text-sm text-gray-500">Consultez tous les signalements et créez un nouvel itinéraire optimisé.</p>
          </motion.div>
        </Link>
        <Link href="/agent/collections">
          <motion.div whileHover={{ y:-3 }} className="card p-6 border-2 border-blue-100 hover:border-blue-400 transition-all cursor-pointer">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-display font-bold text-gray-900 mb-1">Mes itinéraires</h3>
            <p className="text-sm text-gray-500">Gérez vos collectes planifiées et suivez la progression.</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}