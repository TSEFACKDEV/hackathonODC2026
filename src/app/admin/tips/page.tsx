"use client";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { MdAdd, MdEdit, MdDelete, MdImage, MdTipsAndUpdates, MdCheckCircle, MdPauseCircleOutline } from "react-icons/md";
import api from "@/utils/api";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";

const TYPES = [
  { value:"COMPOSTING", label:"Compostage" },
  { value:"RECYCLING", label:"Recyclage" },
  { value:"UPCYCLING", label:"Upcycling" },
  { value:"GENERAL", label:"Général" },
];

export default function TipsManagerPage() {
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTip, setEditTip] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [imagePreview, setImagePreview] = useState<string|null>(null);
  const [deleting, setDeleting] = useState<string|null>(null);

  const fetchTips = () => {
    api.get("/tips?limit=50").then(r => setTips(r.data.data || [])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchTips(); }, []);

  const openCreate = () => { setEditTip(null); setImageFile(null); setImagePreview(null); formik.resetForm(); setShowModal(true); };
  const openEdit = (tip: any) => {
    setEditTip(tip);
    setImagePreview(tip.imageUrl || null);
    formik.setValues({ title:tip.title, content:tip.content, type:tip.type, isPublished:tip.isPublished });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette astuce ?")) return;
    setDeleting(id);
    try {
      await api.delete(`/tips/${id}`);
      setTips(prev => prev.filter(t => t.id !== id));
      toast.success("Astuce supprimée");
    } catch { toast.error("Erreur"); }
    finally { setDeleting(null); }
  };

  const formik = useFormik({
    initialValues: { title:"", content:"", type:"GENERAL", isPublished:true },
    validationSchema: Yup.object({
      title: Yup.string().min(3).required("Titre requis"),
      content: Yup.string().min(20).required("Contenu requis"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        let imageUrl = editTip?.imageUrl;
        if (imageFile) {
          const fd = new FormData();
          fd.append("file", imageFile);
          fd.append("folder", "tips");
          const r = await api.post("/upload", fd, { headers:{"Content-Type":"multipart/form-data"} });
          imageUrl = r.data.data.url;
        }
        if (editTip) {
          const r = await api.put(`/tips/${editTip.id}`, { ...values, imageUrl });
          setTips(prev => prev.map(t => t.id === editTip.id ? r.data.data : t));
          toast.success("Astuce mise à jour !");
        } else {
          const r = await api.post("/tips", { ...values, imageUrl });
          setTips(prev => [r.data.data, ...prev]);
          toast.success("Astuce créée ! 🌿");
        }
        setShowModal(false);
        resetForm();
      } catch (err: any) { toast.error(err.response?.data?.error || "Erreur"); }
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2"><MdTipsAndUpdates size={24}/>Gestion des Astuces</h2>
          <p className="text-gray-500 text-sm">{tips.length} astuce(s) au total</p>
        </div>
        <Button onClick={openCreate} icon={<MdAdd size={18}/>}>Nouvelle astuce</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => <div key={i} className="card h-48 animate-pulse bg-gray-100"/>)}
        </div>
      ) : tips.length === 0 ? (
        <EmptyState icon={<MdTipsAndUpdates size={32}/>} title="Aucune astuce" description="Créez votre première astuce de recyclage.">
          <Button onClick={openCreate} icon={<MdAdd size={18}/>}>Créer une astuce</Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tips.map((tip, i) => (
            <motion.div key={tip.id} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
              className="card overflow-hidden">
              <div className="h-36 bg-gradient-to-br from-primary-50 to-emerald-100 relative overflow-hidden">
                {tip.imageUrl ? (
                  <img src={tip.imageUrl} alt="" className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-50">
                    {TYPES.find(t=>t.value===tip.type)?.label.split(" ")[0]}
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={tip.isPublished?"badge-green":"badge-gray"}>
                    {tip.isPublished ? <><MdCheckCircle className="inline mr-1" size={14}/>Publié</> : <><MdPauseCircleOutline className="inline mr-1" size={14}/>Brouillon</>}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="font-display font-bold text-gray-900 line-clamp-1 mb-1">{tip.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{tip.content}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(tip)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors">
                    <MdEdit size={14}/> Modifier
                  </button>
                  <button onClick={() => handleDelete(tip.id)} disabled={deleting===tip.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs font-semibold transition-colors disabled:opacity-50">
                    <MdDelete size={14}/> Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editTip ? "Modifier l'astuce" : "Nouvelle astuce"} size="xl">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
          <Input label="Titre *" placeholder="Ex: Comment faire du compost maison" {...formik.getFieldProps("title")} error={formik.touched.title?formik.errors.title:""}/>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contenu *</label>
            <textarea {...formik.getFieldProps("content")} className={`input resize-none h-40 ${formik.touched.content&&formik.errors.content?"input-error":""}`} placeholder="Rédigez votre astuce..."/>
            {formik.touched.content && formik.errors.content && <p className="text-xs text-red-500 mt-1">⚠ {formik.errors.content}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPES.map(t => (
                <button key={t.value} type="button" onClick={() => formik.setFieldValue("type", t.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border ${formik.values.type===t.value?"bg-primary-600 text-white border-primary-600":"bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-300"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {/* Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image (optionnel)</label>
            {imagePreview ? (
              <div className="relative h-40 rounded-xl overflow-hidden">
                <img src={imagePreview} alt="" className="w-full h-full object-cover"/>
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 text-xs">✕</button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 bg-gray-50 transition-colors">
                <MdImage size={28} className="text-gray-400 mb-1"/>
                <span className="text-sm text-gray-400">Cliquez pour ajouter une image</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                }}/>
              </label>
            )}
          </div>
          {/* Publié */}
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="relative">
              <input type="checkbox" checked={formik.values.isPublished} onChange={e => formik.setFieldValue("isPublished", e.target.checked)} className="sr-only"/>
              <div className={`w-11 h-6 rounded-full transition-colors ${formik.values.isPublished?"bg-primary-600":"bg-gray-300"}`}/>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${formik.values.isPublished?"left-6":"left-1"}`}/>
            </div>
            <span className="text-sm font-medium text-gray-700">Publier immédiatement</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" fullWidth loading={formik.isSubmitting}>{editTip ? "Mettre à jour" : "Créer l'astuce"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}