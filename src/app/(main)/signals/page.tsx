"use client";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { MdAdd, MdClose, MdMyLocation, MdImage, MdSearch, MdDelete, MdWarning, MdLocationOn, MdAccessTime, MdLocalShipping, MdCheckCircle, MdCancel } from "react-icons/md";
import { RootState } from "@/store";
import api from "@/utils/api";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";

const SignalMap = dynamic(() => import("@/components/maps/SignalMapFull"), { ssr: false, loading: () => (
  <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"/>
  </div>
) });

const MAX_IMAGES = 5;
const schema = Yup.object({
  description: Yup.string().min(10,"Minimum 10 caractères").required("Description requise"),
  severity: Yup.number().min(1).max(3).required(),
});

export default function SignalsPage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [position, setPosition] = useState<[number,number]|null>(null);
  const [address, setAddress] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [addressResults, setAddressResults] = useState<any[]>([]);
  const [images, setImages] = useState<{file:File;preview:string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const debounceRef = useRef<any>(null);

  // Redirection si non authentifié
useEffect(() => {
  if (!user) {
    const currentPath = window.location.pathname;
    router.push(`/login?redirect=${currentPath}`);
  }
}, [user, router]);

  useEffect(() => {
    if (searchParams.get("new") === "1") setShowForm(true);
  }, [searchParams]);

  useEffect(() => {
    api.get("/signals?limit=100").then(r => setSignals(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  // Recherche d'adresse via Nominatim (OpenStreetMap) — gratuit, parfait pour le Cameroun
  const searchAddress = (q: string) => {
    setAddressSearch(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 3) { setAddressResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + " Cameroun")}&format=json&limit=5&addressdetails=1`);
        const data = await res.json();
        setAddressResults(data);
      } catch { setAddressResults([]); }
    }, 500);
  };

  const selectAddress = (item: any) => {
    setPosition([parseFloat(item.lat), parseFloat(item.lon)]);
    setAddress(item.display_name);
    setAddressSearch(item.display_name);
    setAddressResults([]);
  };

  const getMyLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      setPosition([lat, lng]);
      // Reverse geocoding
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const d = await r.json();
        setAddress(d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        setAddressSearch(d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } catch { setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`); }
      toast.success("Position obtenue !");
    }, () => toast.error("Impossible d'obtenir votre position GPS"));
  };

  const addImages = (files: FileList|null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    const newOnes = Array.from(files).slice(0, remaining).map(file => ({ file, preview: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...newOnes]);
    if (Array.from(files).length > remaining) toast.warning(`Maximum ${MAX_IMAGES} images`);
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(images[i].preview);
    setImages(prev => prev.filter((_, j) => j !== i));
  };

  const formik = useFormik({
    initialValues: { description: "", severity: 2 },
    validationSchema: schema,
    onSubmit: async (values, { resetForm }) => {
      if (!position) { toast.error("Sélectionnez une localisation"); return; }
      if (images.length === 0) { toast.error("Ajoutez au moins une photo"); return; }
      try {
        setUploading(true);
        // Upload toutes les images
        const urls = await Promise.all(images.map(async ({ file }) => {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("folder", "signals");
          const r = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
          return r.data.data.url;
        }));
        setUploading(false);

        const r = await api.post("/signals", {
          ...values,
          imageUrl: urls[0], // principale
          imageUrls: urls,   // toutes
          latitude: position[0],
          longitude: position[1],
          address,
        });

        setSignals(prev => [r.data.data, ...prev]);
        toast.success("Signalement envoyé ! +10 points");
        setShowForm(false);
        setImages([]);
        setPosition(null);
        setAddress("");
        setAddressSearch("");
        resetForm();
      } catch (err: any) {
        setUploading(false);
        toast.error(err.response?.data?.error || "Erreur lors du signalement");
      }
    },
  });

  if (!user) return null;

  const statusConfig: Record<string,{label:string;color:string;icon:any}> = {
    PENDING: { label:"En attente", color:"badge-yellow", icon:<MdAccessTime/> },
    IN_PROGRESS: { label:"En cours", color:"badge-blue", icon:<MdLocalShipping/> },
    COLLECTED: { label:"Collecté", color:"badge-green", icon:<MdCheckCircle/> },
    REJECTED: { label:"Rejeté", color:"badge-red", icon:<MdCancel/> },
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="gradient-hero py-16 text-white px-4">
        <div className="container-custom">
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-2"><MdLocationOn className="inline mr-2"/>Signalements</h1>
              <p className="text-white/80 text-lg">Signalez les dépôts sauvages et gagnez 10 points par signalement validé.</p>
            </div>
            <Button onClick={() => setShowForm(true)} size="lg" variant="white" icon={<MdAdd size={20}/>}>
              Nouveau signalement
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">
        {/* Carte */}
        <div className="card overflow-hidden" style={{ height: 420 }}>
          <SignalMap signals={signals} onMapClick={pos => { setPosition(pos); setShowForm(true); }}/>
        </div>

        {/* Liste */}
        <div>
          <h2 className="text-xl font-display font-bold text-gray-900 mb-4">Tous les signalements ({signals.length})</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_,i) => <div key={i} className="card h-32 animate-pulse bg-gray-100"/>)}
            </div>
          ) : signals.length === 0 ? (
            <EmptyState icon={<MdLocationOn/>} title="Aucun signalement pour l'instant" description="Soyez le premier à signaler un dépôt dans votre quartier !">
              <Button onClick={() => setShowForm(true)} icon={<MdAdd size={18}/>}>Signaler maintenant</Button>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signals.map((sig, i) => {
                const st = statusConfig[sig.status] || statusConfig.PENDING;
                return (
                  <motion.div
                    key={sig.id}
                    initial={{ opacity:0,x:-20 }}
                    animate={{ opacity:1,x:0 }}
                    transition={{ delay: i*0.04 }}
                    className="card p-4 flex gap-4"
                  >
                    <img src={sig.imageUrl} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0 bg-gray-100"/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={st.color}>{st.icon} {st.label}</span>
                        <span className={`badge ${sig.severity===1?"badge-green":sig.severity===2?"badge-yellow":"badge-red"}`}>
                          {["","Faible","Moyen","Grave"][sig.severity]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{sig.description}</p>
                      {sig.address && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MdMyLocation size={12}/>{sig.address.slice(0,60)}...</p>}
                      <p className="text-xs text-gray-400 mt-1">{new Date(sig.createdAt).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Signalement */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nouveau signalement" size="lg">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-5">
          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Photos du dépôt * <span className="text-gray-400 font-normal">({images.length}/{MAX_IMAGES})</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={img.preview} alt="" className="w-full h-full object-cover"/>
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <MdDelete size={20} className="text-white"/>
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded-full">Principale</span>}
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-primary-50">
                  <MdImage size={24} className="text-gray-400 mb-1"/>
                  <span className="text-xs text-gray-400">Ajouter</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => addImages(e.target.files)}/>
                </label>
              )}
            </div>
            <p className="text-xs text-gray-400">La 1ère image sera l'image principale. Maximum {MAX_IMAGES} photos.</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
            <textarea
              {...formik.getFieldProps("description")}
              className={`input resize-none h-24 ${formik.touched.description && formik.errors.description ? "input-error" : ""}`}
              placeholder="Décrivez le dépôt : taille, type de déchets, contexte..."
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-xs text-red-500 mt-1">⚠ {formik.errors.description}</p>
            )}
          </div>

          {/* Gravité */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Niveau de gravité *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v:1, label:"Faible", desc:"Quelques déchets", icon:"🟢", cls:"border-green-400 bg-green-50 text-green-700" },
                { v:2, label:"Moyen", desc:"Amas modéré", icon:"🟡", cls:"border-yellow-400 bg-yellow-50 text-yellow-700" },
                { v:3, label:"Grave", desc:"Décharge sauvage", icon:"🔴", cls:"border-red-400 bg-red-50 text-red-700" },
              ].map(({ v, label, desc, icon, cls }) => (
                <button
                  key={v} type="button"
                  onClick={() => formik.setFieldValue("severity", v)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center ${formik.values.severity === v ? cls : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                >
                  <span className="text-xl mb-1">{icon}</span>
                  <span className="font-semibold text-sm">{label}</span>
                  <span className="text-xs opacity-70">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Localisation */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Localisation *</label>
            <div className="relative mb-2">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
              <input
                value={addressSearch}
                onChange={e => searchAddress(e.target.value)}
                placeholder="Recherchez une adresse, un quartier..."
                className="input pl-10"
              />
              <AnimatePresence>
                {addressResults.length > 0 && (
                  <motion.div
                    initial={{ opacity:0,y:-4 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-4 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden"
                  >
                    {addressResults.map((item, i) => (
                      <button
                        key={i} type="button"
                        onClick={() => selectAddress(item)}
                        className="w-full text-left px-4 py-3 hover:bg-primary-50 text-sm border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <span className="font-medium text-gray-800">{item.display_name.split(",").slice(0,2).join(", ")}</span>
                        <span className="text-xs text-gray-400 block">{item.display_name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              type="button" onClick={getMyLocation}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary-300 text-primary-600 rounded-xl hover:bg-primary-50 transition-colors text-sm font-semibold"
            >
              <MdMyLocation size={20}/>
              {position ? `✅ ${address.slice(0,50)}...` : "Utiliser ma position GPS actuelle"}
            </button>
            {!position && <p className="text-xs text-orange-500 mt-1.5 flex items-center gap-1"><MdWarning size={14}/> Une localisation est obligatoire</p>}
          </div>

          <Button type="submit" fullWidth size="lg" loading={formik.isSubmitting || uploading}>
            {uploading ? "Upload des images..." : "Envoyer le signalement (+10 pts)"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}