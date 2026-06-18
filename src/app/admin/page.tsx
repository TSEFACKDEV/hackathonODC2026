"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/utils/api";
import { MdPeople, MdReportProblem, MdEco, MdTipsAndUpdates, MdOutlineWarningAmber, MdLightbulb, MdEventNote, MdPeopleOutline, MdPlace } from "react-icons/md";

interface Stats { users:number; signals:number; activities:number; tips:number; pendingSignals:number; pendingActivities:number; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats|null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/users?role=ALL&limit=1"),
      api.get("/signals?limit=1"),
      api.get("/activities?status=ALL&limit=1"),
      api.get("/tips?limit=1"),
      api.get("/signals?status=PENDING&limit=1"),
      api.get("/activities?status=PENDING&limit=1"),
    ]).then(([u,s,a,t,ps,pa]) => {
      setStats({
        users: u.data.pagination?.total || 0,
        signals: s.data.pagination?.total || 0,
        activities: a.data.pagination?.total || 0,
        tips: t.data.pagination?.total || 0,
        pendingSignals: ps.data.pagination?.total || 0,
        pendingActivities: pa.data.pagination?.total || 0,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label:"Utilisateurs", value: stats?.users ?? "—", icon:<MdPeople size={24}/>, color:"bg-blue-500", bg:"bg-blue-50", href:"/admin/users" },
    { label:"Signalements", value: stats?.signals ?? "—", sub:`${stats?.pendingSignals ?? 0} en attente`, icon:<MdReportProblem size={24}/>, color:"bg-orange-500", bg:"bg-orange-50", href:"/admin/signals" },
    { label:"Activités", value: stats?.activities ?? "—", sub:`${stats?.pendingActivities ?? 0} à valider`, icon:<MdEco size={24}/>, color:"bg-primary-600", bg:"bg-primary-50", href:"/admin/activities" },
    { label:"Astuces publiées", value: stats?.tips ?? "—", icon:<MdTipsAndUpdates size={24}/>, color:"bg-purple-600", bg:"bg-purple-50", href:"/admin/tips" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-gray-900">Vue d'ensemble</h2>
        <p className="text-gray-500 text-sm mt-1">Statistiques générales de la plateforme EcoTrack</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((c, i) => (
          <motion.a key={i} href={c.href} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.1 }}
            className={`card p-5 ${c.bg} border-0 hover:shadow-md transition-shadow cursor-pointer block`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-11 h-11 ${c.color} rounded-xl flex items-center justify-center text-white`}>{c.icon}</div>
              <span className="text-2xl font-display font-bold text-gray-900">{c.value}</span>
            </div>
            <p className="font-semibold text-gray-700">{c.label}</p>
            {c.sub && <p className="text-xs text-orange-500 font-medium mt-0.5">{c.sub}</p>}
          </motion.a>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-display font-bold text-gray-900 mb-3">Actions urgentes</h3>
          <div className="space-y-2">
            {stats?.pendingSignals ? (
              <a href="/admin/signals?status=PENDING" className="flex items-center justify-between p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                <span className="text-sm font-medium text-orange-700"><MdOutlineWarningAmber className="inline mr-1" size={16}/> {stats.pendingSignals} signalement(s) en attente</span>
                <span className="text-orange-500">→</span>
              </a>
            ) : null}
            {stats?.pendingActivities ? (
              <a href="/admin/activities?status=PENDING" className="flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <span className="text-sm font-medium text-blue-700"><MdEventNote className="inline mr-1" size={16}/> {stats.pendingActivities} activité(s) à valider</span>
                <span className="text-blue-500">→</span>
              </a>
            ) : null}
            {!stats?.pendingSignals && !stats?.pendingActivities && (
              <p className="text-sm text-gray-400 text-center py-4">✅ Aucune action urgente</p>
            )}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-display font-bold text-gray-900 mb-3">⚡ Accès rapide</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href:"/admin/tips", label:"+ Nouvelle astuce", icon:"💡" },
              { href:"/admin/planning", label:"+ Nouveau planning", icon:"📅" },
              { href:"/admin/users", label:"Gérer users", icon:"👥" },
              { href:"/admin/signals", label:"Voir signalements", icon:"📍" },
            ].map((item, i) => (
              <a key={i} href={item.href} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-primary-50 text-sm font-medium text-gray-700 hover:text-primary-700 transition-colors">
                <span>{item.icon}</span>{item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}