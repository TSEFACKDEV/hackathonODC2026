"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { MdPerson, MdPhone, MdEdit, MdSave, MdClose, MdImage, MdStar, MdEco, MdReportProblem, MdSwapHoriz, MdEmojiEvents, MdPhoneAndroid, MdNature, MdCardGiftcard, MdAccessTime, MdCheckCircle, MdLocalShipping, MdLocationOn, MdTipsAndUpdates } from "react-icons/md";
import { RootState } from "@/store";
import { updateUser } from "@/store/slices/authSlice";
import { useAuth } from "@/hooks/useAuth";
import api from "@/utils/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [convertModal, setConvertModal] = useState(false);
  const [converting, setConverting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const POINTS_PER_CREDIT = 100;
  const MIN_EXCHANGE = 500;

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([
      api.get("/users/me"),
      api.get("/signals?limit=5"),
    ]).then(([p, s]) => {
      setProfile(p.data.data);
      setSignals(s.data.data?.filter((sig: any) => sig.userId === user?.id) || []);
    }).catch(() => {});
  }, [isAuthenticated, user?.id]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { name: profile?.name || "", phone: profile?.phone || "" },
    validationSchema: Yup.object({
      name: Yup.string().min(2, "Min 2 caractères").required("Nom requis"),
      phone: Yup.string()
        .transform((value, originalValue) => (originalValue === "" ? undefined : value))
        .matches(/^[0-9+\s\-]{8,15}$/, "Numéro invalide")
        .notRequired(),
    }),
    onSubmit: async (values) => {
      try {
        let avatar = profile?.avatar;
        if (avatarFile) {
          const fd = new FormData();
          fd.append("file", avatarFile);
          fd.append("folder", "avatars");
          const r = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
          avatar = r.data.data.url;
        }
        const res = await api.patch("/users/me", { ...values, avatar });
        setProfile(res.data.data);
        dispatch(updateUser(res.data.data));
        toast.success("Profil mis à jour");
        setEditing(false);
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Erreur");
      }
    },
  });

  // Helper to safely return a string error or undefined for Inputs
  const getFieldError = (field: string) => {
    const touched = (formik.touched as any)?.[field];
    const error = (formik.errors as any)?.[field];
    return touched && typeof error === "string" ? error : undefined;
  };

  const handleConvert = async () => {
    if (!profile || profile.points < MIN_EXCHANGE) {
      toast.error(`Il vous faut au moins ${MIN_EXCHANGE} points pour convertir`);
      return;
    }
    setConverting(true);
    try {
      // Convertir tous les points possibles en crédits
      const creditsToAdd = Math.floor(profile.points / POINTS_PER_CREDIT);
      const pointsUsed = creditsToAdd * POINTS_PER_CREDIT;
      const res = await api.patch("/users/me", {
        points: profile.points - pointsUsed,
        credits: profile.credits + creditsToAdd,
      });
      // Note: pour cette opération admin, on utilise l'API dédiée
      // Pour l'instant on simule via un endpoint dédié
      setProfile((p: any) => ({
        ...p,
        points: p.points - pointsUsed,
        credits: p.credits + creditsToAdd,
      }));
      dispatch(updateUser({ points: profile.points - pointsUsed, credits: profile.credits + creditsToAdd }));
      toast.success(`${creditsToAdd} crédit(s) ajouté(s) ! (-${pointsUsed} points)`);
      setConvertModal(false);
    } catch {
      toast.error("Erreur lors de la conversion");
    } finally {
      setConverting(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full"/>
      </div>
    );
  }

  const progressToNextCredit = profile.points % POINTS_PER_CREDIT;
  const creditsAvailable = Math.floor(profile.points / POINTS_PER_CREDIT);
  const levelThresholds = [0, 100, 500, 1000, 2500, 5000, 10000];
  const level = levelThresholds.findLastIndex((t) => profile.totalPoints >= t) + 1;
  const levelNames = ["", "Débutant", "Apprenti", "Engagé", "Champion", "Expert", "Légende"];
  const levelColors = ["", "text-gray-500", "text-blue-500", "text-primary-600", "text-yellow-500", "text-orange-500", "text-purple-600"];
  const levelIcons = ["", <MdNature/>, <MdNature/>, <MdNature/>, <MdNature/>, <MdNature/>, <MdEmojiEvents/>];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="gradient-hero py-12 px-4">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary-600 flex items-center justify-center shadow-xl">
                {avatarPreview || profile.avatar ? (
                  <img src={avatarPreview || profile.avatar} alt="" className="w-full h-full object-cover"/>
                ) : (
                  <span className="text-4xl font-bold text-white">{profile.name?.[0]?.toUpperCase()}</span>
                )}
              </div>
              {editing && (
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer border-2 border-primary-100">
                  <MdImage size={16} className="text-primary-600"/>
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); }
                  }}/>
                </label>
              )}
            </div>
            {/* Infos */}
            <div className="text-white text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-display font-bold">{profile.name}</h1>
                <span className={`text-sm font-semibold px-2 py-0.5 bg-white/20 rounded-full ${levelColors[level]}`}>
                  {levelNames[level]} Niv.{level}
                </span>
              </div>
              <p className="text-white/70 text-sm">{profile.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-semibold"><MdEmojiEvents className="inline mr-1"/>{profile.points} pts</span>
                <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-semibold"><MdPhoneAndroid className="inline mr-1"/>{profile.credits} crédits</span>
                <span className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-semibold"><MdStar className="inline mr-1"/>{profile.totalPoints} pts total</span>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2">
              {!editing ? (
                <Button variant="white" size="sm" icon={<MdEdit size={16}/>} onClick={() => setEditing(true)}>Modifier</Button>
              ) : (
                <Button variant="ghost" size="sm" icon={<MdClose size={16}/>} className="bg-white/20 text-white" onClick={() => { setEditing(false); setAvatarFile(null); setAvatarPreview(null); }}>Annuler</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 space-y-6">
        {/* Formulaire édition */}
        {editing && (
          <motion.div initial={{ opacity:0,y:-10 }} animate={{ opacity:1,y:0 }} className="card p-6">
            <h2 className="text-lg font-display font-bold text-gray-900 mb-4"><MdEdit className="inline mr-2"/>Modifier mon profil</h2>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nom complet *" leftIcon={<MdPerson size={18}/>} {...formik.getFieldProps("name")} error={getFieldError("name")}/>
                <Input label="Téléphone" type="tel" leftIcon={<MdPhone size={18}/>} placeholder="+237 6XX XXX XXX" {...formik.getFieldProps("phone")} error={getFieldError("phone")}/>
              </div>
              <Button type="submit" icon={<MdSave size={18}/>} loading={formik.isSubmitting}>Enregistrer les modifications</Button>
            </form>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon:<MdLocationOn/>, label:"Signalements", value: profile._count?.signals || 0, color:"bg-orange-50 text-orange-700" },
            { icon:<MdNature/>, label:"Activités", value: profile._count?.activities || 0, color:"bg-primary-50 text-primary-700" },
            { icon:<MdEmojiEvents/>, label:"Points", value: profile.points, color:"bg-yellow-50 text-yellow-700" },
            { icon:<MdPhoneAndroid/>, label:"Crédits", value: profile.credits, color:"bg-blue-50 text-blue-700" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.08 }}
              className={`card p-5 ${s.color} border-0 text-center`}>
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-2xl font-display font-bold">{s.value}</div>
              <div className="text-xs font-medium opacity-80">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Progression */}
        <div className="card p-6" id="rewards">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-display font-bold text-gray-900">🎁 Points & Récompenses</h2>
              <p className="text-sm text-gray-500">100 points = 1 crédit téléphonique</p>
            </div>
            <Button
              onClick={() => setConvertModal(true)}
              disabled={profile.points < MIN_EXCHANGE}
              icon={<MdSwapHoriz size={18}/>}
              size="sm"
            >
              Convertir ({creditsAvailable} dispo)
            </Button>
          </div>

          {/* Barre de progression */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">{progressToNextCredit}/100 pts pour le prochain crédit</span>
              <span className="text-primary-600 font-bold">{profile.credits} crédits</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextCredit}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
              />
            </div>
          </div>

          {/* Niveau */}
          <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl">
            <div className="text-4xl">
              {levelIcons[level]}
            </div>
            <div>
              <p className={`font-bold ${levelColors[level]}`}>{levelNames[level]} — Niveau {level}</p>
              <p className="text-xs text-gray-500">
                {level < 6
                  ? `${levelThresholds[level + 1] - profile.totalPoints} pts pour atteindre ${levelNames[level + 1]}`
                  : <>Niveau maximum atteint ! <MdEmojiEvents className="inline ml-1"/></>}
              </p>
            </div>
          </div>

          {/* Comment gagner */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon:<MdLocationOn size={20}/>, action:"Signaler un dépôt", pts:"+10 pts" },
              { icon:<MdLocalShipping size={20}/>, action:"Activité approuvée", pts:"+10 à +50 pts" },
              { icon:<MdTipsAndUpdates size={20}/>, action:"Lire une astuce", pts:"+2 pts" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-primary-600">{item.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{item.action}</p>
                  <p className="text-xs text-primary-600 font-bold">{item.pts}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mes signalements récents */}
        {signals.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-display font-bold text-gray-900 mb-4">📍 Mes derniers signalements</h2>
            <div className="space-y-3">
              {signals.slice(0, 3).map((sig: any) => (
                <div key={sig.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <img src={sig.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{sig.description}</p>
                    <p className="text-xs text-gray-400">{new Date(sig.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <span className={`badge shrink-0 ${sig.status==="PENDING"?"badge-yellow":sig.status==="COLLECTED"?"badge-green":"badge-blue"}`}>
                    {sig.status==="PENDING"?<MdAccessTime/>:sig.status==="COLLECTED"?<MdCheckCircle/>:<MdLocalShipping/>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal conversion */}
      <Modal open={convertModal} onClose={() => setConvertModal(false)} title="Convertir des points en crédits" size="sm">
        <div className="p-6 space-y-5">
          <div className="text-center">
            <div className="text-5xl mb-3"><MdCardGiftcard/></div>
            <p className="text-gray-600">Vous allez convertir :</p>
            <div className="flex items-center justify-center gap-3 my-4">
              <div className="text-center p-4 bg-yellow-50 rounded-2xl flex-1">
                <p className="text-2xl font-bold text-yellow-700">{creditsAvailable * POINTS_PER_CREDIT}</p>
                <p className="text-xs text-yellow-600">points utilisés</p>
              </div>
              <MdSwapHoriz size={28} className="text-gray-400 shrink-0"/>
              <div className="text-center p-4 bg-blue-50 rounded-2xl flex-1">
                <p className="text-2xl font-bold text-blue-700">{creditsAvailable}</p>
                <p className="text-xs text-blue-600">crédits télécom</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Il vous restera {profile.points - creditsAvailable * POINTS_PER_CREDIT} points après conversion.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setConvertModal(false)}>Annuler</Button>
            <Button fullWidth loading={converting} onClick={handleConvert}>Confirmer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}