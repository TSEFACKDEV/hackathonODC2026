"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { MdEmail, MdArrowBack, MdCheckCircle } from "react-icons/md";
import api from "@/utils/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const schema = Yup.object({
  email: Yup.string().email("Email invalide").required("Email requis"),
});

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: schema,
    onSubmit: async (values: { email: string }) => {
      try {
        await api.post("/auth/forgot-password", values);
        setSentTo(values.email);
        setEmailSent(true);
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Une erreur est survenue");
      }
    },
  });

  if (emailSent) {
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
          Email envoyé !
        </h2>
        <p className="text-gray-500 text-sm mb-1">
          Un lien de réinitialisation a été envoyé à
        </p>
        <p className="text-primary-700 font-semibold text-sm mb-6">{sentTo}</p>
        <p className="text-gray-400 text-xs mb-8">
          Vérifiez également votre dossier spam. Le lien expire dans 30 minutes.
        </p>
        <Link href="/login">
          <Button variant="secondary" fullWidth>
            Retour à la connexion
          </Button>
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
          Mot de passe oublié ? 🔑
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          Entrez votre email et nous vous enverrons un lien de réinitialisation.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <Input
          label="Adresse email"
          type="email"
          placeholder="vous@exemple.cm"
          icon={<MdEmail size={18} />}
          {...formik.getFieldProps("email")}
          error={formik.touched.email ? formik.errors.email : ""}
        />

        <Button type="submit" fullWidth isLoading={formik.isSubmitting} size="lg">
          Envoyer le lien
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors font-medium"
        >
          <MdArrowBack size={16} />
          Retour à la connexion
        </Link>
      </div>
    </motion.div>
  );
}
