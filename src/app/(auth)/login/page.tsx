"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdEmojiPeople } from "react-icons/md";
import { setCredentials } from "@/store/slices/authSlice";
import api from "@/utils/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [showPwd, setShowPwd] = useState(false);
  const redirect = searchParams.get("redirect") || "/";

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Email invalide").required("Email requis"),
      password: Yup.string().min(6, "Minimum 6 caractères").required("Mot de passe requis"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await api.post("/auth/login", values);
        dispatch(setCredentials(res.data.data));
        toast.success(`Bienvenue, ${res.data.data.user.name.split(" ")[0]} !`);
        const role = res.data.data.user.role;
        if (role === "ADMIN") router.push("/admin");
        else router.push(redirect);
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Identifiants incorrects");
      }
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8 flex items-center gap-3">
        <MdEmojiPeople size={32} className="text-primary-600" />
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">Bon retour !</h2>
          <p className="text-gray-500 mt-1 text-sm">Connectez-vous à votre compte EcoTrack</p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <Input
          label="Adresse email *"
          type="email"
          placeholder="vous@exemple.cm"
          leftIcon={<MdEmail size={18} className="text-gray-400" />}
          {...formik.getFieldProps("email")}
          error={formik.touched.email ? formik.errors.email : ""}
        />

        <Input
          label="Mot de passe *"
          type={showPwd ? "text" : "password"}
          placeholder="••••••••"
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

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-primary-600 hover:underline font-medium transition-colors"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={formik.isSubmitting}
          className="mt-2"
        >
          Se connecter
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-xs text-gray-400">
            Nouveau sur EcoTrack ?
          </span>
        </div>
      </div>

      <Link href="/register" className="block">
        <Button variant="secondary" fullWidth size="lg">
          Créer un compte gratuit
        </Button>
      </Link>
    </motion.div>
  );
}