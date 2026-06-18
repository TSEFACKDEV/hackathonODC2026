"use client";
import { motion } from "framer-motion";
import { MdVisibility, MdNature, MdAutorenew, MdPalette, MdLightbulb } from "react-icons/md";

const typeColors: Record<string,string> = { COMPOSTING:"badge-green", RECYCLING:"badge-blue", UPCYCLING:"badge-yellow", GENERAL:"badge-gray" };
const typeLabels: Record<string,string> = { COMPOSTING:"Compostage", RECYCLING:"Recyclage", UPCYCLING:"Upcycling", GENERAL:"Général" };
const typeIcons: Record<string, any> = { COMPOSTING:<MdNature/>, RECYCLING:<MdAutorenew/>, UPCYCLING:<MdPalette/>, GENERAL:<MdLightbulb/> };

interface Props { tip: any; onClick: () => void; }

export default function TipCard({ tip, onClick }: Props) {
  return (
    <motion.article whileHover={{ y:-4 }} onClick={onClick} className="card cursor-pointer overflow-hidden group">
      <div className="h-48 bg-gradient-to-br from-primary-50 to-emerald-100 relative overflow-hidden">
        {tip.imageUrl ? (
          <img src={tip.imageUrl} alt={tip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl opacity-60">{typeIcons[tip.type] || <MdLightbulb/>}</div>
        )}
        <div className="absolute top-3 left-3">
          <span className={typeColors[tip.type] || "badge-gray"}>{typeLabels[tip.type] || tip.type}</span>
        </div>
      </div>
        
        <div className="p-5">
          <h3 className="font-display font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">{tip.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{tip.content}</p>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">{new Date(tip.createdAt).toLocaleDateString("fr-FR",{day:"numeric",month:"long"})}</span>
            <span className="flex items-center gap-1 text-xs text-gray-400"><MdVisibility size={14}/>{tip.views || 0}</span>
          </div>
        </div>
    </motion.article>
  );
}