"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/utils/api";
import { MdSearch, MdDownload, MdCalendarToday, MdAccessTime, MdLocationOn, MdMap, MdAssignment, MdPublic } from "react-icons/md";
import EmptyState from "@/components/ui/EmptyState";
import dynamic from "next/dynamic";

const CollectionMap = dynamic(() => import("@/components/maps/CollectionMap"), { ssr: false });

const days = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const freqLabels: Record<string,string> = { WEEKLY:"Hebdomadaire", BIWEEKLY:"Bihebdomadaire", MONTHLY:"Mensuel" };
const freqColors: Record<string,string> = { WEEKLY:"badge-green", BIWEEKLY:"badge-blue", MONTHLY:"badge-yellow" };

export default function PlanningPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"schedule"|"map">("schedule");

  useEffect(() => {
    Promise.all([api.get("/schedule"), api.get("/collections?status=PLANNED")]).then(([s, c]) => {
      setSchedules(s.data.data || []);
      setCollections(c.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = schedules.filter(s =>
    search === "" || s.zone.toLowerCase().includes(search.toLowerCase()) || s.title.toLowerCase().includes(search.toLowerCase())
  );

  // Grouper par zone
  const byZone: Record<string, any[]> = {};
  filtered.forEach(s => { if (!byZone[s.zone]) byZone[s.zone] = []; byZone[s.zone].push(s); });

  // Extraire tous les points d'itinéraire pour la carte
  const allRoutePoints = collections.flatMap(c => (c.points || []).map((p: any) => ({ ...p, collectionTitle: c.title })));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="gradient-hero py-16 text-white text-center px-4">
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3"><MdCalendarToday className="inline mr-2"/>Planning de Collecte</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">Consultez les horaires de collecte par quartier et visualisez les itinéraires des agents.</p>
        </motion.div>
      </div>

      <div className="container-custom py-10">
        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 gap-1">
            {[
              { key: "schedule", label: <><MdAssignment className="inline mr-2"/>Horaires</>, },
              { key: "map", label: <><MdMap className="inline mr-2"/>Carte des collectes</>, },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === t.key ? "bg-primary-600 text-white shadow-sm" : "text-gray-600 hover:text-primary-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === "schedule" && (
            <div className="relative flex-1">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un quartier..." className="input pl-10 bg-white"/>
            </div>
          )}
        </div>

        {tab === "map" ? (
          <div className="card overflow-hidden" style={{ height: 500 }}>
            <CollectionMap collections={collections} routePoints={allRoutePoints}/>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_,i) => <div key={i} className="card p-5 h-40 animate-pulse bg-gray-100"/>)}
          </div>
        ) : Object.keys(byZone).length === 0 ? (
          <EmptyState icon={<MdCalendarToday/>} title="Aucun planning disponible" description="Le planning de collecte sera publié prochainement."/>
        ) : (
          <div className="space-y-6">
            {Object.entries(byZone).map(([zone, items], zi) => (
              <motion.div key={zone} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay: zi*0.08 }}>
                <h2 className="flex items-center gap-2 text-lg font-display font-bold text-gray-900 mb-3">
                  <MdLocationOn className="text-primary-600" size={22}/> Zone : {zone}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item, i) => (
                    <div key={item.id} className="card p-5 border-l-4 border-primary-500">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-display font-bold text-gray-900">{item.title}</h3>
                          {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
                        </div>
                        <span className={freqColors[item.frequency] || "badge-gray"}>{freqLabels[item.frequency] || item.frequency}</span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        {item.dayOfWeek != null && (
                          <span className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg font-medium">
                            <MdCalendarToday size={15}/>{days[item.dayOfWeek]}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                          <MdAccessTime size={15}/>{item.timeSlot}
                        </span>
                      </div>
                      {item.pdfUrl && (
                        <a href={item.pdfUrl} download className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-800 text-sm font-semibold transition-colors">
                          <MdDownload size={18}/> Télécharger le planning PDF
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}