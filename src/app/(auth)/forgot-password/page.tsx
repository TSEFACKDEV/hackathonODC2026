"use client";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { MdEmail, MdArrowBack, MdLock } from "react-icons/md";
import api from "@/utils/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const formik = useFormik({
    initialValues: { email:"" },
    validationSchema: Yup.object({ email: Yup.string().email("Email invalide").required("Email requis") }),
    onSubmit: async (values) => {
      try {
        await api.post("/auth/forgot-password", values);
        setSent(true);
      } catch { toast.error("Erreur serveur. Réessayez."); }
    },
  });

  if (sent) return (
    <motion.div initial={{ opacity:0,scale:0.97 }} animate={{ opacity:1,scale:1 }} className="text-center py-8">
      <div className="text-6xl mb-4 text-primary-600"><MdEmail size={48} /></div>
      <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Email envoyé !</h2>
      <p className="text-gray-500 mb-6">Si un compte existe avec cet email, vous recevrez un lien de réinitialisation. Vérifiez aussi vos spams.</p>
      <Link href="/login"><Button variant="secondary">Retour à la connexion</Button></Link>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
      <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-8 transition-colors">
        <MdArrowBack size={18}/> Retour à la connexion
      </Link>
      <div className="mb-8">
        <div className="text-primary-600 mb-3"><MdLock size={40} /></div>
        <h2 className="text-3xl font-display font-bold text-gray-900">Mot de passe oublié ?</h2>
        <p className="text-gray-500 mt-1">Saisissez votre email, nous vous enverrons un lien de réinitialisation.</p>
      </div>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <Input label="Adresse email" type="email" placeholder="vous@exemple.cm" leftIcon={<MdEmail size={18}/>} {...formik.getFieldProps("email")} error={formik.touched.email?formik.errors.email:""}/>
        <Button type="submit" fullWidth size="lg" loading={formik.isSubmitting}>Envoyer le lien de réinitialisation</Button>
      </form>
    </motion.div>
  );
}