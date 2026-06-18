"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "@/utils/api";
import { MdSearch, MdClose, MdAutorenew, MdNature, MdPalette, MdLightbulb, MdEco } from "react-icons/md";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import TipCard from "@/components/tips/TipCard";
import TipDetailModal from "@/components/tips/TipDetailModal";

const types = [
  { value: "", label: "Tous", icon: <MdAutorenew/> },
  { value: "COMPOSTING", label: "Compostage", icon: <MdNature/> },
  { value: "RECYCLING", label: "Recyclage", icon: <MdAutorenew/> },
  { value: "UPCYCLING", label: "Upcycling", icon: <MdPalette/> },
  { value: "GENERAL", label: "Général", icon: <MdLightbulb/> },
];

export default function TipsPage() {
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<any>(null);
  const LIMIT = 9;

  const fetchTips = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: String(LIMIT), page: String(page) });
      if (type) p.set("type", type);
      const res = await api.get(`/tips?${p}`);
      setTips(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } finally { setLoading(false); }
  }, [type, page]);

  useEffect(() => { setPage(1); }, [type]);
  useEffect(() => { fetchTips(); }, [fetchTips]);

  const filtered = tips.filter(t =>
    search === "" || t.title.toLowerCase().includes(search.toLowerCase()) || t.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="gradient-hero py-16 text-white text-center px-4">
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3"><MdAutorenew className="inline mr-2"/>Astuces & Recyclage</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">Compost, upcycling, tri sélectif… Transformez vos déchets en ressources.</p>
        </motion.div>
      </div>

      <div className="container-custom py-10">
        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-[65px] z-20 bg-gray-50/95 backdrop-blur-sm py-3 -mx-4 px-4">
          {/* Recherche */}
          <div className="relative flex-1">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une astuce..."
              className="input pl-10 pr-10 bg-white"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <MdClose size={18}/>
              </button>
            )}
          </div>
          {/* Types */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {types.map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  type === t.value ? "bg-primary-600 text-white shadow-sm" : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300"
                }`}
              >
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_,i) => <SkeletonCard key={i}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<MdEco/>} title="Aucune astuce trouvée" description="Essayez d'autres mots-clés ou catégories." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((tip, i) => (
                <motion.div key={tip.id} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay: i*0.05 }}>
                  <TipCard tip={tip} onClick={() => setSelected(tip)}/>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {Math.ceil(total / LIMIT) > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(Math.ceil(total / LIMIT))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i+1)}
                    className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                      page === i+1 ? "bg-primary-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    {i+1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <TipDetailModal tip={selected} onClose={() => setSelected(null)}/>
    </div>
  );
}