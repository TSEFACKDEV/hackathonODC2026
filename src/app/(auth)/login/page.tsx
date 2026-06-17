"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { setCredentials } from "@/store/slices/authSlice";
import api from "@/utils/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const schema = Yup.object({
  email: Yup.string().email("Email invalide").required("Email requis"),
  password: Yup.string().min(6, "Minimum 6 caractères").required("Mot de passe requis"),
});

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPwd, setShowPwd] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async (values: { email: string; password: string }) => {
      try {
        const res = await api.post("/auth/login", values);
        dispatch(setCredentials(res.data.data));
        toast.success("Bienvenue sur EcoTrack ! 🌿");
        const role = res.data.data.user.role;
        if (role === "ADMIN") router.push("/admin/dashboard");
        else if (role === "AGENT") router.push("/agent/dashboard");
        else router.push("/dashboard");
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Erreur de connexion");
      }
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-card p-8"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-gray-900">Bon retour ! 👋</h2>
        <p className="text-gray-500 mt-1 text-sm">Connectez-vous à votre compte EcoTrack</p>
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
        <Input
          label="Mot de passe"
          type={showPwd ? "text" : "password"}
          placeholder="••••••••"
          icon={<MdLock size={18} />}
          rightIcon={
            <span onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
            </span>
          }
          {...formik.getFieldProps("password")}
          error={formik.touched.password ? formik.errors.password : ""}
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline font-medium">
            Mot de passe oublié ?
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={formik.isSubmitting} size="lg">
          Se connecter
        </Button>
      </form>

      {/* Séparateur */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-400 bg-white px-4">
          Nouveau sur EcoTrack ?
        </div>
      </div>

      <Link href="/register">
        <Button variant="secondary" fullWidth>
          Créer un compte gratuit
        </Button>
      </Link>
    </motion.div>
  );
}