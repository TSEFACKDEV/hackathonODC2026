"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import api from "@/utils/api";
import { MdCheckCircle, MdMap, MdExpandMore, MdExpandLess } from "react-icons/md";
import EmptyState from "@/components/ui/EmptyState";

const MiniMap = dynamic(() => import("@/components/maps/CollectionMap"), { ssr: false });

const statusCfg: Record<string, { label: string; cls: string }> = {
  PLANNED: { label: "📋 Planifiée", cls: "badge-blue" },
  IN_PROGRESS: { label: "🚛 En cours", cls: "badge-yellow" },
  COMPLETED: { label: "✅ Terminée", cls: "badge-green" },
  CANCELLED: { label: "❌ Annulée", cls: "badge-red" },
};

export default function AgentCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [status, setStatus] = useState("ALL");

  const fetch = () => {
    const q = status !== "ALL" ? `?status=${status}` : "";
    api.get(`/collections${q}`).then(r => setCollections(r.data.data || [])).finally(() => setLoading(false));
  };
  useEffect(() => { setLoading(true); fetch(); }, [status]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/collections/${id}`, { status: newStatus });
      setCollections(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast.success("Statut mis à jour ✅");
    } catch { toast.error("Erreur"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Mes Itinéraires 📋</h2>
          <p className="text-sm text-gray-500">{collections.length} itinéraire(s)</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "PLANNED", "IN_PROGRESS", "COMPLETED"].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${status === s ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-600 border-gray-200"}`}>
              {s === "ALL" ? "Tous" : statusCfg[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100"/>)}</div>
      ) : collections.length === 0 ? (
        <EmptyState icon="📋" title="Aucun itinéraire" description="Créez un itinéraire depuis la carte des signalements."/>
      ) : (
        <div className="space-y-4">
          {collections.map((col, i) => (
            <motion.div key={col.id} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }} className="card overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <h3 className="font-display font-bold text-gray-900">{col.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      📅 {new Date(col.date).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
                    </p>
                  </div>
                  <span className={statusCfg[col.status]?.cls || "badge-gray"}>
                    {statusCfg[col.status]?.label || col.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-4">
                  {col.points?.length && <span className="bg-gray-100 px-2.5 py-1.5 rounded-lg">📍 {col.points.length} arrêts</span>}
                  {col.distance && <span className="bg-gray-100 px-2.5 py-1.5 rounded-lg">📏 {col.distance} km</span>}
                  {col.carbonSaved && <span className="bg-primary-50 text-primary-700 px-2.5 py-1.5 rounded-lg">🌿 -{col.carbonSaved} kg CO₂</span>}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {col.status === "PLANNED" && (
                    <button onClick={() => updateStatus(col.id, "IN_PROGRESS")}
                      className="px-3 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg text-xs font-semibold transition-colors">
                      🚛 Démarrer
                    </button>
                  )}
                  {col.status === "IN_PROGRESS" && (
                    <button onClick={() => updateStatus(col.id, "COMPLETED")}
                      className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-xs font-semibold transition-colors">
                      <MdCheckCircle size={14}/> Terminer
                    </button>
                  )}
                  <button onClick={() => setExpanded(expanded === col.id ? null : col.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-xs font-semibold transition-colors">
                    <MdMap size={14}/> {expanded === col.id ? <><MdExpandLess size={14}/>Masquer carte</> : <><MdExpandMore size={14}/>Voir carte</>}
                  </button>
                </div>
              </div>

              {/* Carte dépliable */}
              {expanded === col.id && col.points?.length > 0 && (
                <motion.div initial={{ height:0,opacity:0 }} animate={{ height:280,opacity:1 }} exit={{ height:0,opacity:0 }}
                  className="overflow-hidden">
                  <MiniMap collections={[col]} routePoints={col.points.map((p: any) => ({ ...p, collectionTitle: col.title }))}/>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}