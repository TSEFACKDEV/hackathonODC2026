"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { MdPerson, MdEmail, MdLock, MdPhone, MdVisibility, MdVisibilityOff, MdEco } from "react-icons/md";
import { setCredentials } from "@/store/slices/authSlice";
import api from "@/utils/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Minimum 2 caractères")
    .max(50, "Maximum 50 caractères")
    .required("Nom complet requis"),
  email: Yup.string()
    .email("Email invalide")
    .required("Email requis"),
  phone: Yup.string()
    .matches(/^[0-9+\s-]{8,15}$/, "Numéro invalide (ex: +237 6XX XXX XXX)")
    .nullable()
    .optional(),
  password: Yup.string()
    .min(8, "Minimum 8 caractères")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Doit contenir une majuscule, une minuscule et un chiffre"
    )
    .required("Mot de passe requis"),
  confirm: Yup.string()
    .oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas")
    .required("Confirmation requise"),
});

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPwd, setShowPwd] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", email: "", phone: "", password: "", confirm: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { confirm, ...data } = values;
        const res = await api.post("/auth/register", data);
        dispatch(setCredentials(res.data.data));
        toast.success("Compte créé ! Vérifiez votre email.");
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
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 flex items-center gap-3">
        <MdEco size={32} className="text-primary-600" />
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">Créer un compte</h2>
          <p className="text-gray-500 mt-1 text-sm">Rejoignez la communauté EcoTrack gratuitement</p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <Input
          label="Nom complet *"
          placeholder="Marie Ngo"
          leftIcon={<MdPerson size={18} className="text-gray-400" />}
          {...formik.getFieldProps("name")}
          error={formik.touched.name ? formik.errors.name : ""}
        />

        <Input
          label="Email *"
          type="email"
          placeholder="vous@exemple.cm"
          leftIcon={<MdEmail size={18} className="text-gray-400" />}
          {...formik.getFieldProps("email")}
          error={formik.touched.email ? formik.errors.email : ""}
        />

        <Input
          label="Téléphone (optionnel)"
          type="tel"
          placeholder="+237 6XX XXX XXX"
          leftIcon={<MdPhone size={18} className="text-gray-400" />}
          {...formik.getFieldProps("phone")}
          error={formik.touched.phone ? formik.errors.phone : ""}
        />

        <Input
          label="Mot de passe *"
          type={showPwd ? "text" : "password"}
          placeholder="Minimum 8 caractères"
          leftIcon={<MdLock size={18} className="text-gray-400" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
            >
              {showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
            </button>
          }
          {...formik.getFieldProps("password")}
          error={formik.touched.password ? formik.errors.password : ""}
        />

        <Input
          label="Confirmer le mot de passe *"
          type={showPwd ? "text" : "password"}
          placeholder="Répétez le mot de passe"
          leftIcon={<MdLock size={18} className="text-gray-400" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
            >
              {showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
            </button>
          }
          {...formik.getFieldProps("confirm")}
          error={formik.touched.confirm ? formik.errors.confirm : ""}
        />

        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-0.5 accent-primary-600 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
            J'accepte les{" "}
            <Link href="/terms" className="text-primary-600 hover:underline font-medium">
              conditions d'utilisation
            </Link>
            {" "}et la{" "}
            <Link href="/privacy" className="text-primary-600 hover:underline font-medium">
              politique de confidentialité
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={formik.isSubmitting}
          className="mt-2"
        >
          Créer mon compte gratuit
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-primary-600 hover:underline font-semibold transition-colors">
          Se connecter
        </Link>
      </p>
    </motion.div>
  );
}