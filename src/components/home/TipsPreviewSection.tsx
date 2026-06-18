"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/utils/api";
import Button from "@/components/ui/Button";
import { MdArrowForward, MdNature, MdAutorenew, MdPalette, MdLightbulb } from "react-icons/md";

const typeColors: Record<string, string> = {
  COMPOSTING: "badge-green",
  RECYCLING: "badge-blue",
  UPCYCLING: "badge-yellow",
  GENERAL: "badge-gray",
};
const typeLabels: Record<string, string> = {
  COMPOSTING: "Compostage",
  RECYCLING: "Recyclage",
  UPCYCLING: "Upcycling",
  GENERAL: "Général",
};

const typeIcons: Record<string, any> = {
  COMPOSTING: <MdNature/>,
  RECYCLING: <MdAutorenew/>,
  UPCYCLING: <MdPalette/>,
  GENERAL: <MdLightbulb/>,
};

export default function TipsPreviewSection() {
  const [tips, setTips] = useState<any[]>([]);

  useEffect(() => {
    api.get("/tips?limit=3").then(r => setTips(r.data.data || [])).catch(() => {});
  }, []);

  return (
    <section className="section gradient-light">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-600/10 px-4 py-2 text-sm font-semibold text-primary-700">
              <MdLightbulb size={18} />
              Astuces
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mt-4">
              Apprenez à recycler mieux
            </h2>
          </div>
          <Link href="/tips">
            <Button variant="outline" size="md" iconRight={<MdArrowForward size={18} />}>
              Voir tout
            </Button>
          </Link>
        </div>

        {tips.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5 space-y-3 animate-pulse">
                <div className="bg-gray-200 h-44 rounded-xl"/>
                <div className="bg-gray-200 h-4 rounded w-3/4"/>
                <div className="bg-gray-200 h-3 rounded w-full"/>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tips.map((tip, i) => (
              <motion.article
                key={tip.id}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay: i * 0.1 }}
                className="card overflow-hidden border border-gray-100 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-primary-100 to-emerald-100">
                  {tip.imageUrl ? (
                    <img src={tip.imageUrl} alt={tip.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center text-4xl text-primary-700">
                      {typeIcons[tip.type] || <MdLightbulb />}
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  <div className={`inline-flex items-center gap-2 ${typeColors[tip.type] || "badge-gray"}`}>
                    {typeIcons[tip.type]}
                    <span>{typeLabels[tip.type] || tip.type}</span>
                  </div>
                  <h3 className="font-display font-bold text-gray-900 mt-2 mb-1 line-clamp-2">{tip.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{tip.content}</p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}