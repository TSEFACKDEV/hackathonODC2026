"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { MdAdd, MdClose, MdMyLocation, MdSave, MdDelete, MdMap, MdCheckCircle, MdInfo } from "react-icons/md";
import api from "@/utils/api";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

const AgentMap = dynamic(() => import("@/components/maps/AgentMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center animate-pulse"/>,
});

export default function AgentMapPage() {
  const [signals, setSignals] = useState<any[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<any[]>([]);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/signals?limit=200&status=PENDING")
      .then(r => setSignals(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const togglePoint = (signal: any) => {
    setSelectedPoints(prev => {
      const exists = prev.find(p => p.signalId === signal.id);
      if (exists) return prev.filter(p => p.signalId !== signal.id);
      return [...prev, { latitude: signal.latitude, longitude: signal.longitude, address: signal.address, signalId: signal.id }];
    });
  };

  const formik = useFormik({
    initialValues: { title: "", date: new Date().toISOString().slice(0, 10) },
    validationSchema: Yup.object({
      title: Yup.string().required("Titre requis"),
      date: Yup.string().required("Date requise"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (selectedPoints.length < 2) { toast.error("Sélectionnez au moins 2 points"); return; }
      try {
        await api.post("/collections", { ...values, points: selectedPoints });
        toast.success("Itinéraire créé et optimisé ✅");
        setShowRouteModal(false);
        setSelectedPoints([]);
        resetForm();
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Erreur");
      }
    },
  });

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2"><MdMap size={24}/>Carte des signalements</h2>
          <p className="text-sm text-gray-500">{signals.length} signalement(s) en attente · {selectedPoints.length} point(s) sélectionné(s)</p>
        </div>
        <div className="flex gap-2">
          {selectedPoints.length > 0 && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setSelectedPoints([])} icon={<MdDelete size={16}/>}>Effacer</Button>
              <Button size="sm" onClick={() => setShowRouteModal(true)} icon={<MdAdd size={16}/>}>Créer l'itinéraire ({selectedPoints.length})</Button>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      {selectedPoints.length === 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="card p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-700 font-medium"><MdInfo size={18} className="inline mr-2"/> Cliquez sur les marqueurs rouges pour les sélectionner, puis créez un itinéraire optimisé.</p>
        </motion.div>
      )}

      {/* Carte */}
      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ height: "calc(100vh - 280px)", minHeight: 400 }}>
        <AgentMap
          signals={signals}
          selectedPoints={selectedPoints}
          onTogglePoint={togglePoint}
        />
      </div>

      {/* Modal création itinéraire */}
      <Modal open={showRouteModal} onClose={() => setShowRouteModal(false)} title="Créer un itinéraire de collecte" size="md">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
          <div className="card p-4 bg-primary-50 border-primary-200">
            <p className="text-sm font-semibold text-primary-700"><MdCheckCircle className="inline mr-1" size={16}/>{selectedPoints.length} point(s) de collecte sélectionnés</p>
            <p className="text-xs text-primary-600 mt-1">L'algorithme optimisera automatiquement le parcours le plus court.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre de la collecte *</label>
            <input {...formik.getFieldProps("title")} className={`input ${formik.touched.title&&formik.errors.title?"input-error":""}`} placeholder="Ex: Collecte Akwa - Lundi 23 Juin"/>
            {formik.touched.title && formik.errors.title && <p className="text-xs text-red-500 mt-1">⚠ {formik.errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date de collecte *</label>
            <input type="date" {...formik.getFieldProps("date")} className="input"/>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowRouteModal(false)}>Annuler</Button>
            <Button type="submit" fullWidth loading={formik.isSubmitting} icon={<MdSave size={18}/>}>Créer et optimiser</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}