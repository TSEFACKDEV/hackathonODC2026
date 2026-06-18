"use client";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { MdAdd, MdEdit, MdDelete, MdCalendarToday, MdAccessTime, MdLocationOn } from "react-icons/md";
import api from "@/utils/api";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";

const DAYS = ["","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
const FREQS = [{ value:"WEEKLY",label:"Hebdomadaire" },{ value:"BIWEEKLY",label:"Bihebdomadaire" },{ value:"MONTHLY",label:"Mensuel" }];

export default function PlanningManagerPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const fetch = () => api.get("/schedule").then(r => setSchedules(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditItem(null); formik.resetForm(); setShowModal(true); };
  const openEdit = (item: any) => {
    setEditItem(item);
    formik.setValues({ title:item.title, description:item.description||"", zone:item.zone, frequency:item.frequency, dayOfWeek:item.dayOfWeek||1, timeSlot:item.timeSlot, isActive:item.isActive });
    setShowModal(true);
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce planning ?")) return;
    await api.delete(`/schedule/${id}`);
    setSchedules(prev => prev.filter(s => s.id !== id));
    toast.success("Planning supprimé");
  };

  const formik = useFormik({
    initialValues: { title:"", description:"", zone:"", frequency:"WEEKLY", dayOfWeek:1, timeSlot:"07:00-12:00", isActive:true },
    validationSchema: Yup.object({
      title: Yup.string().required("Titre requis"),
      zone: Yup.string().required("Zone requise"),
      timeSlot: Yup.string().required("Horaire requis"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editItem) {
          const r = await api.put(`/schedule/${editItem.id}`, values);
          setSchedules(prev => prev.map(s => s.id === editItem.id ? r.data.data : s));
          toast.success("Planning mis à jour !");
        } else {
          const r = await api.post("/schedule", values);
          setSchedules(prev => [r.data.data, ...prev]);
          toast.success("Planning créé !");
        }
        setShowModal(false); resetForm();
      } catch (err: any) { toast.error(err.response?.data?.error || "Erreur"); }
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2"><MdCalendarToday size={24}/>Gestion du Planning</h2>
          <p className="text-gray-500 text-sm">{schedules.length} zone(s) configurée(s)</p>
        </div>
        <Button onClick={openCreate} icon={<MdAdd size={18}/>}>Nouveau planning</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_,i) => <div key={i} className="card h-36 animate-pulse bg-gray-100"/>)}
        </div>
      ) : schedules.length === 0 ? (
        <EmptyState icon={<MdCalendarToday size={32}/>} title="Aucun planning configuré">
          <Button onClick={openCreate} icon={<MdAdd size={18}/>}>Créer un planning</Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
              className="card p-5 border-l-4 border-primary-500">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold text-gray-900">{s.title}</h3>
                  <p className="text-xs text-primary-600 font-semibold mt-0.5"><MdLocationOn className="inline mr-1" size={14}/> {s.zone}</p>
                </div>
                <span className={`badge ${s.isActive?"badge-green":"badge-gray"}`}>{s.isActive?"Actif":"Inactif"}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs mb-4">
                <span className="flex items-center gap-1 bg-primary-50 text-primary-700 px-2.5 py-1.5 rounded-lg font-medium">
                  <MdCalendarToday size={12}/>{DAYS[s.dayOfWeek] || "—"} · {FREQS.find(f=>f.value===s.frequency)?.label}
                </span>
                <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg">
                  <MdAccessTime size={12}/>{s.timeSlot}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(s)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors">
                  <MdEdit size={14}/> Modifier
                </button>
                <button onClick={() => handleDelete(s.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs font-semibold transition-colors">
                  <MdDelete size={14}/> Supprimer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? "Modifier le planning" : "Nouveau planning"} size="md">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
          <Input label="Titre *" placeholder="Ex: Collecte Akwa" {...formik.getFieldProps("title")} error={formik.touched.title?formik.errors.title:""}/>
          <Input label="Zone / Quartier *" placeholder="Ex: Akwa, Bonanjo..." {...formik.getFieldProps("zone")} error={formik.touched.zone?formik.errors.zone:""}/>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fréquence</label>
            <div className="grid grid-cols-3 gap-2">
              {FREQS.map(f => (
                <button key={f.value} type="button" onClick={() => formik.setFieldValue("frequency", f.value)}
                  className={`py-2.5 rounded-xl text-xs font-semibold transition-all border ${formik.values.frequency===f.value?"bg-primary-600 text-white border-primary-600":"bg-gray-50 text-gray-600 border-gray-200"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Jour de collecte</label>
            <div className="grid grid-cols-4 gap-1.5">
              {DAYS.slice(1).map((d,i) => (
                <button key={i+1} type="button" onClick={() => formik.setFieldValue("dayOfWeek", i+1)}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all border ${formik.values.dayOfWeek===i+1?"bg-primary-600 text-white border-primary-600":"bg-gray-50 text-gray-600 border-gray-200"}`}>
                  {d.slice(0,3)}
                </button>
              ))}
            </div>
          </div>
          <Input label="Horaire *" placeholder="Ex: 07:00-12:00" {...formik.getFieldProps("timeSlot")} error={formik.touched.timeSlot?formik.errors.timeSlot:""}/>
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
            <div className="relative">
              <input type="checkbox" checked={formik.values.isActive} onChange={e => formik.setFieldValue("isActive", e.target.checked)} className="sr-only"/>
              <div className={`w-11 h-6 rounded-full transition-colors ${formik.values.isActive?"bg-primary-600":"bg-gray-300"}`}/>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${formik.values.isActive?"left-6":"left-1"}`}/>
            </div>
            <span className="text-sm font-medium text-gray-700">Planning actif</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" fullWidth loading={formik.isSubmitting}>{editItem ? "Mettre à jour" : "Créer"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}