"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { MdAdd, MdClose, MdMyLocation, MdImage } from "react-icons/md";
import { RootState } from "@/store";
import { setSignals, addSignal } from "@/store/slices/signalSlice";
import api from "@/utils/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Map Leaflet — chargée côté client uniquement
const SignalMap = dynamic(() => import("@/components/maps/SignalMap"), { ssr: false });

const schema = Yup.object({
  description: Yup.string().min(10, "Minimum 10 caractères").required("Description requise"),
  severity: Yup.number().min(1).max(3).required(),
});

export default function SignalsPage() {
  const dispatch = useDispatch();
  const { signals } = useSelector((state: RootState) => state.signals);
  const [showForm, setShowForm] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get("/signals?limit=50").then((res) => {
      dispatch(setSignals({ signals: res.data.data, total: res.data.pagination?.total || 0 }));
    });
  }, [dispatch]);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => toast.error("Impossible d'obtenir votre position")
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const formik = useFormik({
    initialValues: { description: "", severity: 1 },
    validationSchema: schema,
    onSubmit: async (values, { resetForm }) => {
      if (!position) { toast.error("Sélectionnez une position sur la carte"); return; }
      if (!imageFile) { toast.error("Ajoutez une photo du dépôt"); return; }

      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("folder", "signals");
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setUploading(false);

        const res = await api.post("/signals", {
          ...values,
          imageUrl: uploadRes.data.data.url,
          latitude: position[0],
          longitude: position[1],
        });

        dispatch(addSignal(res.data.data));
        toast.success(res.data.message || "Signalement créé ! +10 points 🌿");
        setShowForm(false);
        setImageFile(null);
        setImagePreview(null);
        setPosition(null);
        resetForm();
      } catch (err: any) {
        setUploading(false);
        toast.error(err.response?.data?.error || "Erreur lors du signalement");
      }
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Signalements 📍</h1>
          <p className="text-gray-500 text-sm">{signals.length} dépôt(s) signalé(s)</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={<MdAdd size={20} />}>
          Signaler
        </Button>
      </div>

      {/* Carte */}
      <div className="h-96 rounded-2xl overflow-hidden shadow-card">
        <SignalMap
          signals={signals}
          onPositionSelect={setPosition}
          selectedPosition={position}
        />
      </div>

      {/* Modal signalement */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-display font-bold">Nouveau signalement</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <MdClose size={18} />
                </button>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Photo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Photo du dépôt *</label>
                  <label className={`flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed cursor-pointer transition-colors
                    ${imagePreview ? "border-primary-400 bg-primary-50" : "border-gray-300 bg-gray-50 hover:border-primary-400"}`}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="h-full w-full object-cover rounded-xl" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <MdImage size={40} />
                        <span className="text-sm">Cliquez pour ajouter une photo</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
                  <textarea
                    {...formik.getFieldProps("description")}
                    className="input-field resize-none h-24"
                    placeholder="Décrivez le dépôt d'ordures (taille, type de déchets...)"
                  />
                  {formik.touched.description && formik.errors.description && (
                    <p className="text-red-500 text-xs mt-1">⚠️ {formik.errors.description}</p>
                  )}
                </div>

                {/* Gravité */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Niveau de gravité</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: 1, label: "Faible", color: "border-green-400 bg-green-50 text-green-700" },
                      { v: 2, label: "Moyen", color: "border-yellow-400 bg-yellow-50 text-yellow-700" },
                      { v: 3, label: "Grave", color: "border-red-400 bg-red-50 text-red-700" },
                    ].map(({ v, label, color }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => formik.setFieldValue("severity", v)}
                        className={`py-2 rounded-xl border-2 text-sm font-semibold transition-all
                          ${formik.values.severity === v ? color : "border-gray-200 text-gray-500"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position */}
                <div>
                  <button
                    type="button"
                    onClick={getLocation}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary-300 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors text-sm font-semibold"
                  >
                    <MdMyLocation size={20} />
                    {position ? `📍 Position obtenue (${position[0].toFixed(4)}, ${position[1].toFixed(4)})` : "Obtenir ma position GPS"}
                  </button>
                </div>

                <Button type="submit" fullWidth isLoading={formik.isSubmitting || uploading} size="lg">
                  Envoyer le signalement
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste signalements */}
      <div className="space-y-3">
        {signals.map((signal: any, i) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card flex gap-4 p-4"
          >
            <img src={signal.imageUrl} alt="signal" className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge ${
                  signal.status === "PENDING" ? "badge-warning" :
                  signal.status === "COLLECTED" ? "badge-success" : "badge-info"
                }`}>
                  {signal.status === "PENDING" ? "⏳ En attente" :
                   signal.status === "IN_PROGRESS" ? "🚛 En cours" :
                   signal.status === "COLLECTED" ? "✅ Collecté" : "❌ Rejeté"}
                </span>
                <span className="text-xs text-gray-400">
                  {["", "🟢 Faible", "🟡 Moyen", "🔴 Grave"][signal.severity]}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{signal.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(signal.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}