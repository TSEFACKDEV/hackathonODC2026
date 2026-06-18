"use client";
import { useState } from "react";
import Link from "next/link";
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

export default function RegisterPage() {
  const dispatch = useDispatch();
  const [showPwd, setShowPwd] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", email: "", phone: "", password: "", confirm: "" },
    validationSchema: Yup.object({
      name: Yup.string().min(2, "Min 2 caractères").required("Nom requis"),
      email: Yup.string().email("Email invalide").required("Email requis"),
      phone: Yup.string()
        .transform((value) => (typeof value === "string" && value.trim() === "" ? undefined : value))
        .matches(/^[0-9+\s\-]{8,15}$/, "Numéro invalide")
        .notRequired(),
      password: Yup.string()
        .min(8, "Min 8 caractères")
        .required("Requis"),
      confirm: Yup.string()
        .oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas")
        .required("Requis"),
    }),
    onSubmit: async (values) => {
      try {
        const { confirm, ...data } = values;
        const res = await api.post("/auth/register", data);
        const { user, token } = res.data.data;

        dispatch(setCredentials({ user, token }));
        toast.success("Compte créé ! Bienvenue 🌿");

        // Rechargement complet pour activer le cookie middleware
        window.location.href = "/";
      } catch (err: any) {
        toast.error(
          err.response?.data?.error || "Erreur lors de l'inscription"
        );
      }
    },
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold text-gray-900">
          Créer un compte 🌱
        </h2>
        <p className="text-gray-500 mt-1">
          Rejoignez la communauté EcoTrack gratuitement
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <Input
          label="Nom complet *"
          placeholder="Marie Ngo"
          leftIcon={<MdPerson size={18} />}
          {...formik.getFieldProps("name")}
          error={formik.touched.name ? formik.errors.name : ""}
        />
        <Input
          label="Email *"
          type="email"
          placeholder="vous@exemple.cm"
          leftIcon={<MdEmail size={18} />}
          {...formik.getFieldProps("email")}
          error={formik.touched.email ? formik.errors.email : ""}
        />
        <Input
          label="Téléphone (optionnel)"
          type="tel"
          placeholder="+237 6XX XXX XXX"
          leftIcon={<MdPhone size={18} />}
          {...formik.getFieldProps("phone")}
          error={formik.touched.phone ? formik.errors.phone : ""}
        />
        <Input
          label="Mot de passe *"
          type={showPwd ? "text" : "password"}
          placeholder="Minimum 8 caractères"
          leftIcon={<MdLock size={18} />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              {showPwd ? (
                <MdVisibilityOff size={18} />
              ) : (
                <MdVisibility size={18} />
              )}
            </button>
          }
          {...formik.getFieldProps("password")}
          error={formik.touched.password ? formik.errors.password : ""}
        />
        <Input
          label="Confirmer *"
          type={showPwd ? "text" : "password"}
          placeholder="Répétez le mot de passe"
          leftIcon={<MdLock size={18} />}
          {...formik.getFieldProps("confirm")}
          error={formik.touched.confirm ? formik.errors.confirm : ""}
        />

        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-0.5 accent-primary-600"
          />
          <label htmlFor="terms" className="text-xs text-gray-500">
            J'accepte les{" "}
            <Link href="/terms" className="text-primary-600 hover:underline">
              conditions
            </Link>{" "}
            et la{" "}
            <Link href="/privacy" className="text-primary-600 hover:underline">
              politique de confidentialité
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={formik.isSubmitting}
        >
          Créer mon compte gratuit
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Déjà un compte ?{" "}
        <Link
          href="/login"
          className="text-primary-600 hover:underline font-semibold"
        >
          Se connecter
        </Link>
      </p>
    </motion.div>
  );
}