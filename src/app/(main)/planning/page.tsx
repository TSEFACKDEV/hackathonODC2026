"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "@/utils/api";
import { MdSearch, MdDownload, MdCalendarToday, MdAccessTime, MdLocationOn, MdMap, MdAssignment } from "react-icons/md";
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
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.get("/schedule"), api.get("/collections?status=PLANNED")])
      .then(([s, c]) => {
        setSchedules(s.data.data || []);
        setCollections(c.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = schedules.filter((s: any) =>
    search === "" || (s.zone || "").toLowerCase().includes(search.toLowerCase()) || (s.title || "").toLowerCase().includes(search.toLowerCase())
  );

  const byZone: Record<string, any[]> = {};
  filtered.forEach((s: any) => { if (!byZone[s.zone]) byZone[s.zone] = []; byZone[s.zone].push(s); });

  const allRoutePoints = collections.flatMap((c: any) => (c.points || []).map((p: any) => ({ ...p, collectionTitle: c.title })));

  async function downloadPlanningWithMap() {
    try {
      const left = document.getElementById("planning-left");
      const mapEl = document.getElementById("collection-map");
      if (!left || !mapEl) return alert("Impossible de trouver les éléments à capturer.");

      // dynamic imports (ignore TS module absence in workspace)
      // @ts-ignore
      const html2canvas = (await import("html2canvas")).default;
      // @ts-ignore
      const { jsPDF } = await import("jspdf");

      // Capture with html2canvas options to handle lab() colors from Tailwind 4
      const canvasLeft = await html2canvas(left, { 
        scale: 2, 
        allowTaint: true,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      const canvasMap = await html2canvas(mapEl, { 
        scale: 2, 
        allowTaint: true,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      const imgLeft = canvasLeft.toDataURL("image/png");
      const imgMap = canvasMap.toDataURL("image/png");

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // add schedule on first page
      const leftRatio = canvasLeft.width / canvasLeft.height;
      const leftHeight = pageWidth / leftRatio;
      pdf.addImage(imgLeft, "PNG", 0, 0, pageWidth, Math.min(leftHeight, pageHeight));

      // add map on second page
      pdf.addPage();
      const mapRatio = canvasMap.width / canvasMap.height;
      const mapHeight = pageWidth / mapRatio;
      pdf.addImage(imgMap, "PNG", 0, 0, pageWidth, Math.min(mapHeight, pageHeight));

      pdf.save(`planning-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du PDF.");
    }
  }

  return (
    <div className="min-h-screen">
      <div className="gradient-hero py-14 text-white text-center px-4">
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2"><MdCalendarToday className="inline mr-2"/>Planning de collecte</h1>
          <p className="text-white/80 text-base max-w-2xl mx-auto">Consultez les horaires par quartier, téléchargez les plannings et visualisez les itinéraires colorés de collecte.</p>
        </motion.div>
      </div>

      <div className="container-custom py-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 gap-1">
            {[
              { key: "schedule", label: <><MdAssignment className="inline mr-2"/>Horaires</>, },
              { key: "map", label: <><MdMap className="inline mr-2"/>Carte</>, },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === t.key ? "bg-primary-600 text-white shadow-sm" : "text-gray-600 hover:text-primary-700"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xl">
            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un quartier ou un titre..." className="input pl-10 bg-white"/>
          </div>

          <div className="ml-auto">
            <button onClick={downloadPlanningWithMap} className="btn btn-primary">Télécharger planning + carte</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div id="planning-left" className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_,i) => <div key={i} className="card p-5 h-40 animate-pulse bg-gray-100"/>) }
              </div>
            ) : Object.keys(byZone).length === 0 ? (
              <EmptyState icon={<MdCalendarToday/>} title="Aucun planning disponible" description="Le planning de collecte sera publié prochainement."/>
            ) : (
              Object.entries(byZone).map(([zone, items], zi) => (
                <motion.div key={zone} initial={{ opacity:0,y:12 }} whileInView={{ opacity:1,y:0 }} transition={{ delay: zi*0.06 }}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="flex items-center gap-2 text-lg font-display font-bold text-gray-900"><MdLocationOn className="text-primary-600" size={20}/> Zone : {zone}</h2>
                    <div className="flex items-center gap-3">
                      <button onClick={() => { setSelectedZone(zone); setTab('map'); }} className="btn btn-sm btn-outline">Voir sur la carte</button>
                      <a href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(items))}`} download={`planning-${zone}.json`} className="btn btn-sm btn-white">Exporter</a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item: any) => (
                      <div key={item.id} className={`card p-5 border ${selectedCollectionId===item.id? 'border-primary-500 shadow-lg': 'border-gray-100'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-display font-bold text-gray-900">{item.title}</h3>
                            {item.description && <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>}
                          </div>
                          <span className={freqColors[item.frequency] || "badge-gray"}>{freqLabels[item.frequency] || item.frequency}</span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                          {item.dayOfWeek != null && (
                            <span className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg font-medium">
                              <MdCalendarToday size={15}/>{days[item.dayOfWeek]}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                            <MdAccessTime size={15}/>{item.timeSlot}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button onClick={() => { setSelectedCollectionId(item.id); setSelectedZone(zone); setTab('map'); }} className="btn btn-primary btn-sm">Voir itinéraire</button>
                          {item.pdfUrl && (
                            <a href={item.pdfUrl} download className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-800">
                              <MdDownload size={16}/> Télécharger PDF
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="lg:col-span-1">
            <div id="collection-map" className="card overflow-hidden" style={{ minHeight: 520 }}>
              <CollectionMap collections={collections} routePoints={allRoutePoints} selectedCollectionId={selectedCollectionId} highlightedZone={selectedZone} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
