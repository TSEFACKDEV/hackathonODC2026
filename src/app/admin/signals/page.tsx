"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { MdCheckCircle, MdCancel, MdFilterList } from "react-icons/md";
import api from "@/utils/api";
import EmptyState from "@/components/ui/EmptyState";

const STATUS_OPTS = ["ALL","PENDING","IN_PROGRESS","COLLECTED","REJECTED"];
const sConfig: Record<string,{label:string;cls:string}> = {
  PENDING:{label:"⏳ En attente",cls:"badge-yellow"},
  IN_PROGRESS:{label:"🚛 En cours",cls:"badge-blue"},
  COLLECTED:{label:"✅ Collecté",cls:"badge-green"},
  REJECTED:{label:"❌ Rejeté",cls:"badge-red"},
};

export default function AdminSignalsPage() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");

  const fetch = () => {
    const params = status !== "ALL" ? `?status=${status}` : "";
    api.get(`/signals${params}&limit=50`).then(r => setSignals(r.data.data || [])).finally(() => setLoading(false));
  };
  useEffect(() => { setLoading(true); fetch(); }, [status]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/signals/${id}`, { status: newStatus });
      setSignals(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      toast.success("Statut mis à jour");
    } catch { toast.error("Erreur"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Signalements 📍</h2>
          <p className="text-gray-500 text-sm">{signals.length} signalement(s)</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTS.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${status===s?"bg-primary-600 text-white border-primary-600":"bg-white text-gray-600 border-gray-200 hover:border-primary-300"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_,i) => <div key={i} className="card h-40 animate-pulse bg-gray-100"/>)}
        </div>
      ) : signals.length === 0 ? (
        <EmptyState icon="📍" title="Aucun signalement" description="Aucun signalement pour ce filtre."/>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.map((sig, i) => (
            <motion.div key={sig.id} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }}
              className="card p-4 flex gap-4">
              <img src={sig.imageUrl} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0 bg-gray-100"/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={sConfig[sig.status]?.cls || "badge-gray"}>{sConfig[sig.status]?.label || sig.status}</span>
                  <span className={`badge ${sig.severity===1?"badge-green":sig.severity===2?"badge-yellow":"badge-red"}`}>
                    {["","Faible","Moyen","Grave"][sig.severity]}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{sig.description}</p>
                {sig.user && <p className="text-xs text-gray-400 mt-1">👤 {sig.user.name}</p>}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {sig.status === "PENDING" && <>
                    <button onClick={() => updateStatus(sig.id,"IN_PROGRESS")}
                      className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors">
                      🚛 En cours
                    </button>
                    <button onClick={() => updateStatus(sig.id,"REJECTED")}
                      className="flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors">
                      ❌ Rejeter
                    </button>
                  </>}
                  {sig.status === "IN_PROGRESS" && (
                    <button onClick={() => updateStatus(sig.id,"COLLECTED")}
                      className="flex items-center gap-1 text-xs bg-primary-50 text-primary-600 hover:bg-primary-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors">
                      ✅ Marquer collecté
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}