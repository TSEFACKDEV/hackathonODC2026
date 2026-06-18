"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import api from "@/utils/api";
import EmptyState from "@/components/ui/EmptyState";

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("PENDING");

  useEffect(() => {
    api.get(`/activities?status=${status}&limit=50`)
      .then(r => setActivities(r.data.data || [])).finally(() => setLoading(false));
  }, [status]);

  const approve = async (id: string, score: number) => {
    await api.patch(`/activities/${id}`, { status:"APPROVED", score });
    setActivities(prev => prev.filter(a => a.id !== id));
    toast.success(`Activité approuvée ! +${score} pts attribués`);
  };

  const reject = async (id: string) => {
    await api.patch(`/activities/${id}`, { status:"REJECTED", score:0 });
    setActivities(prev => prev.filter(a => a.id !== id));
    toast.info("Activité rejetée");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Modération des Activités 🌱</h2>
          <p className="text-gray-500 text-sm">{activities.length} activité(s)</p>
        </div>
        <div className="flex gap-2">
          {["PENDING","APPROVED","REJECTED"].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${status===s?"bg-primary-600 text-white border-primary-600":"bg-white text-gray-600 border-gray-200"}`}>
              {s==="PENDING"?"⏳ En attente":s==="APPROVED"?"✅ Approuvé":"❌ Rejeté"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_,i) => <div key={i} className="card h-44 animate-pulse bg-gray-100"/>)}
        </div>
      ) : activities.length === 0 ? (
        <EmptyState icon="🌱" title="Aucune activité à modérer"/>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map((act, i) => (
            <motion.div key={act.id} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }}
              className="card overflow-hidden">
              {act.mediaUrl && (
                <div className="h-44 overflow-hidden">
                  {act.mediaType==="video"
                    ? <video src={act.mediaUrl} className="w-full h-full object-cover" controls/>
                    : <img src={act.mediaUrl} alt="" className="w-full h-full object-cover"/>}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{act.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{act.description}</p>
                <p className="text-xs text-gray-400 mb-3">👤 {act.user?.name} · {new Date(act.createdAt).toLocaleDateString("fr-FR")}</p>
                {status === "PENDING" && (
                  <div className="flex gap-2 flex-wrap">
                    {[10,25,50].map(pts => (
                      <button key={pts} onClick={() => approve(act.id, pts)}
                        className="flex-1 py-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 text-xs font-bold transition-colors min-w-16">
                        +{pts}pts
                      </button>
                    ))}
                    <button onClick={() => reject(act.id)}
                      className="flex-1 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs font-bold transition-colors min-w-16">
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}