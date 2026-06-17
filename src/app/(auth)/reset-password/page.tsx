"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { MdLock, MdVisibility, MdVisibilityOff, MdCheckCircle } from "react-icons/md";
import api from "@/utils/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const schema = Yup.object({
  password: Yup.string()
    .min(6, "Minimum 6 caractères")
    .required("Mot de passe requis"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas")
    .required("Confirmation requise"),
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: schema,
    onSubmit: async (values: { password: string; confirmPassword: string }) => {
      if (!token) {
        toast.error("Lien invalide ou expiré");
        return;
      }
      try {
        await api.post("/auth/reset-password", {
          token,
          password: values.password,
        });
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Lien invalide ou expiré");
      }
    },
  });

  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-card p-8 text-center"
      >
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
          Lien invalide
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <Link href="/forgot-password">
          <Button fullWidth>Demander un nouveau lien</Button>
        </Link>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-card p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <MdCheckCircle size={36} className="text-primary-600" />
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
          Mot de passe mis à jour !
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Votre mot de passe a été réinitialisé avec succès. Redirection en cours…
        </p>
        <Link href="/login">
          <Button fullWidth>Se connecter maintenant</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-card p-8"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-gray-900">
          Nouveau mot de passe 🔒
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          Choisissez un mot de passe sécurisé pour votre compte EcoTrack.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <Input
          label="Nouveau mot de passe"
          type={showPwd ? "text" : "password"}
          placeholder="••••••••"
          icon={<MdLock size={18} />}
          rightIcon={
            <span onClick={() => setShowPwd(!showPwd)} className="cursor-pointer">
              {showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
            </span>
          }
          {...formik.getFieldProps("password")}
          error={formik.touched.password ? formik.errors.password : ""}
        />

        <Input
          label="Confirmer le mot de passe"
          type={showConfirm ? "text" : "password"}
          placeholder="••••••••"
          icon={<MdLock size={18} />}
          rightIcon={
            <span onClick={() => setShowConfirm(!showConfirm)} className="cursor-pointer">
              {showConfirm ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
            </span>
          }
          {...formik.getFieldProps("confirmPassword")}
          error={formik.touched.confirmPassword ? formik.errors.confirmPassword : ""}
        />

        <Button type="submit" fullWidth isLoading={formik.isSubmitting} size="lg">
          Réinitialiser le mot de passe
        </Button>
      </form>
    </motion.div>
  );
}
