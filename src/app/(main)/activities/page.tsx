"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { MdAdd, MdImage, MdClose, MdStar, MdEco, MdReportProblem } from "react-icons/md";
import { RootState } from "@/store";
import api from "@/utils/api";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";

const schema = Yup.object({
  title: Yup.string().min(3,"Minimum 3 caractères").required("Titre requis"),
  description: Yup.string().min(20,"Minimum 20 caractères").required("Description requise"),
});

const TAGS = ["Compostage","Recyclage","Nettoyage","Jardinage","Sensibilisation","Upcycling","Éducation","Plantation"];

export default function ActivitiesPage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mediaFile, setMediaFile] = useState<File|null>(null);
  const [mediaPreview, setMediaPreview] = useState<string|null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  useEffect(() => {
    api.get(`/activities?limit=${LIMIT}&page=${page}`)
      .then(r => { setActivities(r.data.data || []); setTotal(r.data.pagination?.total || 0); })
      .finally(() => setLoading(false));
  }, [page]);

  const toggleTag = (t: string) => setSelectedTags(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev,t]);

  const formik = useFormik({
    initialValues: { title:"", description:"" },
    validationSchema: schema,
    onSubmit: async (values, { resetForm }) => {
      try {
        let mediaUrl, mediaType;
        if (mediaFile) {
          const fd = new FormData();
          fd.append("file", mediaFile);
          fd.append("folder", "activities");
          const r = await api.post("/upload", fd, { headers:{"Content-Type":"multipart/form-data"} });
          mediaUrl = r.data.data.url;
          mediaType = mediaFile.type.startsWith("video") ? "video" : "image";
        }
        await api.post("/activities", { ...values, mediaUrl, mediaType, tags: selectedTags });
        toast.success("Activité publiée ! En attente de validation 🌱");
        setShowForm(false);
        setMediaFile(null); setMediaPreview(null); setSelectedTags([]);
        resetForm();
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Erreur");
      }
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="gradient-hero py-16 text-white px-4">
        <div className="container-custom">
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">Activités Écologiques</h1>
              <p className="text-white/80 text-lg">Partagez vos actions vertes, inspirez la communauté et gagnez des points.</p>
            </div>
            {user && (
              <Button onClick={() => setShowForm(true)} size="lg" variant="white" icon={<MdAdd size={20}/>}>
                Publier une activité
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_,i) => <SkeletonCard key={i}/>)}
          </div>
        ) : activities.length === 0 ? (
          <EmptyState icon={<MdEco size={48}/>} title="Aucune activité pour l'instant" description="Soyez le premier à partager votre action écologique !">
            {user && <Button onClick={() => setShowForm(true)} icon={<MdAdd size={18}/>}>Publier une activité</Button>}
          </EmptyState>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((act, i) => (
                <motion.article
                  key={act.id}
                  initial={{ opacity:0, y:20 }}
                  animate={{ opacity:1, y:0 }}
                  transition={{ delay: i*0.05 }}
                  className="card-hover overflow-hidden"
                >
                  {act.mediaUrl && (
                    <div className="h-52 overflow-hidden">
                      {act.mediaType === "video" ? (
                        <video src={act.mediaUrl} className="w-full h-full object-cover" controls/>
                      ) : (
                        <img src={act.mediaUrl} alt={act.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"/>
                      )}
                    </div>
                  )}
                  {!act.mediaUrl && (
                    <div className="h-32 gradient-light flex items-center justify-center text-5xl"><MdEco size={40} /></div>
                  )}
                  <div className="p-5">
                    {act.tags && JSON.parse(act.tags || "[]").map((t:string) => (
                      <span key={t} className="badge-green text-xs mr-1 mb-1 inline-block">{t}</span>
                    ))}
                    <h3 className="font-display font-bold text-gray-900 mt-2 mb-1">{act.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-3">{act.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 gradient-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {act.user?.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{act.user?.name}</span>
                      </div>
                      {act.score > 0 && (
                        <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                          <MdStar size={14}/>{act.score} pts
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
            {/* Pagination */}
            {Math.ceil(total/LIMIT) > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(Math.ceil(total/LIMIT))].map((_,i) => (
                  <button key={i} onClick={() => setPage(i+1)}
                    className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${page===i+1?"bg-primary-600 text-white":"bg-white text-gray-600 border border-gray-200"}`}>
                    {i+1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal publication */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Publier une activité" size="lg">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
          <Input label="Titre de l'activité *" placeholder="Ex: Compostage de mes déchets de cuisine" {...formik.getFieldProps("title")} error={formik.touched.title?formik.errors.title:""}/>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
            <textarea {...formik.getFieldProps("description")} className={`input resize-none h-28 ${formik.touched.description&&formik.errors.description?"input-error":""}`} placeholder="Décrivez votre action écologique..."/>
            {formik.touched.description && formik.errors.description && <p className="text-xs text-red-500 mt-1">⚠ {formik.errors.description}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(t => (
                <button key={t} type="button" onClick={() => toggleTag(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedTags.includes(t)?"bg-primary-600 text-white":"bg-gray-100 text-gray-600 hover:bg-primary-50"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Média */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Photo ou vidéo (optionnel)</label>
            {mediaPreview ? (
              <div className="relative h-48 rounded-xl overflow-hidden">
                {mediaFile?.type.startsWith("video") ? (
                  <video src={mediaPreview} className="w-full h-full object-cover" controls/>
                ) : (
                  <img src={mediaPreview} alt="" className="w-full h-full object-cover"/>
                )}
                <button type="button" onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80">
                  <MdClose size={16}/>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-400 cursor-pointer transition-colors bg-gray-50 hover:bg-primary-50">
                <MdImage size={36} className="text-gray-400 mb-2"/>
                <span className="text-sm text-gray-500">Cliquez pour ajouter une photo ou vidéo</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG, MP4 — Max 10MB</span>
                <input type="file" accept="image/*,video/*" className="hidden" onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) { setMediaFile(f); setMediaPreview(URL.createObjectURL(f)); }
                }}/>
              </label>
            )}
          </div>

          <Button type="submit" fullWidth size="lg" loading={formik.isSubmitting}>
            Publier l'activité
          </Button>
        </form>
      </Modal>
    </div>
  );
}