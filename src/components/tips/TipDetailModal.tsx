"use client";
import Modal from "@/components/ui/Modal";
import { MdCalendarToday, MdVisibility, MdPerson, MdNature, MdAutorenew, MdPalette, MdLightbulb } from "react-icons/md";

const typeColors: Record<string,string> = { COMPOSTING:"badge-green", RECYCLING:"badge-blue", UPCYCLING:"badge-yellow", GENERAL:"badge-gray" };
const typeLabels: Record<string,string> = { COMPOSTING:"Compostage", RECYCLING:"Recyclage", UPCYCLING:"Upcycling", GENERAL:"Général" };
const typeIcons: Record<string, any> = { COMPOSTING:<MdNature/>, RECYCLING:<MdAutorenew/>, UPCYCLING:<MdPalette/>, GENERAL:<MdLightbulb/> };

interface Props { tip: any; onClose: () => void; }

export default function TipDetailModal({ tip, onClose }: Props) {
  if (!tip) return null;
  return (
    <Modal open={!!tip} onClose={onClose} size="lg">
      <div>
        {tip.imageUrl && (
          <div className="h-64 w-full overflow-hidden">
            <img src={tip.imageUrl} alt={tip.title} className="w-full h-full object-cover"/>
          </div>
        )}
        <div className="p-6">
          <span className={typeColors[tip.type] || "badge-gray"}>{typeIcons[tip.type]} {typeLabels[tip.type] || tip.type}</span>
          <h2 className="text-2xl font-display font-bold text-gray-900 mt-3 mb-4">{tip.title}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-5 pb-5 border-b border-gray-100">
            {tip.admin && <span className="flex items-center gap-1.5"><MdPerson size={16}/>{tip.admin.name}</span>}
            <span className="flex items-center gap-1.5"><MdCalendarToday size={16}/>{new Date(tip.createdAt).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</span>
            <span className="flex items-center gap-1.5"><MdVisibility size={16}/>{tip.views || 0} vues</span>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{tip.content}</div>
        </div>
      </div>
    </Modal>
  );
}