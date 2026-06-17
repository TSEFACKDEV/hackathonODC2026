"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { MdPerson, MdEmail, MdLock, MdPhone, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { setCredentials } from "@/store/slices/authSlice";
import api from "@/utils/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const schema = Yup.object({
  name: Yup.string().min(2, "Minimum 2 caractères").required("Nom requis"),
  email: Yup.string().email("Email invalide").required("Email requis"),
  phone: Yup.string().matches(/^[0-9+\s-]{8,15}$/, "Numéro invalide").optional(),
  password: Yup.string().min(8, "Minimum 8 caractères").required("Mot de passe requis"),
  confirm: Yup.string().oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas").required("Confirmation requise"),
});

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPwd, setShowPwd] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", email: "", phone: "", password: "", confirm: "" },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const { confirm, ...data } = values;
        const res = await api.post("/auth/register", data);
        dispatch(setCredentials(res.data.data));
        toast.success("Compte créé ! Vérifiez votre email 🌿");
        router.push("/dashboard");
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Erreur lors de l'inscription");
      }
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-card p-8"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-gray-900">Créer un compte 🌱</h2>
        <p className="text-gray-500 mt-1 text-sm">Rejoignez la communauté EcoTrack</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <Input
          label="Nom complet"
          placeholder="Jean Dupont"
          icon={<MdPerson size={18} />}
          {...formik.getFieldProps("name")}
          error={formik.touched.name ? formik.errors.name : ""}
        />
        <Input
          label="Email"
          type="email"
          placeholder="vous@exemple.cm"
          icon={<MdEmail size={18} />}
          {...formik.getFieldProps("email")}
          error={formik.touched.email ? formik.errors.email : ""}
        />
        <Input
          label="Téléphone (optionnel)"
          type="tel"
          placeholder="+237 6XX XXX XXX"
          icon={<MdPhone size={18} />}
          {...formik.getFieldProps("phone")}
          error={formik.touched.phone ? formik.errors.phone : ""}
        />
        <Input
          label="Mot de passe"
          type={showPwd ? "text" : "password"}
          placeholder="Minimum 8 caractères"
          icon={<MdLock size={18} />}
          rightIcon={<span onClick={() => setShowPwd(!showPwd)}>{showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}</span>}
          {...formik.getFieldProps("password")}
          error={formik.touched.password ? formik.errors.password : ""}
        />
        <Input
          label="Confirmer le mot de passe"
          type={showPwd ? "text" : "password"}
          placeholder="Répétez le mot de passe"
          icon={<MdLock size={18} />}
          rightIcon={<span onClick={() => setShowPwd(!showPwd)}>{showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}</span>}
          {...formik.getFieldProps("confirm")}
          error={formik.touched.confirm ? formik.errors.confirm : ""}
        />

        <div className="flex items-start gap-2 pt-1">
          <input type="checkbox" required id="terms" className="mt-0.5 accent-primary-600" />
          <label htmlFor="terms" className="text-xs text-gray-500">
            J'accepte les{" "}
            <Link href="/terms" className="text-primary-600 hover:underline">conditions d'utilisation</Link>
            {" "}et la{" "}
            <Link href="/privacy" className="text-primary-600 hover:underline">politique de confidentialité</Link>
          </label>
        </div>

        <Button type="submit" fullWidth isLoading={formik.isSubmitting} size="lg" className="mt-2">
          Créer mon compte
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-primary-600 hover:underline font-semibold">
          Se connecter
        </Link>
      </p>
    </motion.div>
  );
}