"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

export default function LoginPage() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [showPwd, setShowPwd] = useState(false);

  // Page de destination après connexion
  const redirectTo = searchParams.get("redirect") || null;

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Email invalide").required("Email requis"),
      password: Yup.string()
        .min(6, "Minimum 6 caractères")
        .required("Mot de passe requis"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await api.post("/auth/login", values);
        const { user, token } = res.data.data;

        // 1. Sauvegarder dans Redux + localStorage + cookie client
        dispatch(setCredentials({ user, token }));

        toast.success(`Bienvenue, ${user.name.split(" ")[0]} ! 🌿`);

        // 2. Déterminer la destination
        let destination: string;
        if (redirectTo && redirectTo !== "/login" && redirectTo !== "/register") {
          // Retourner là où l'utilisateur voulait aller
          destination = redirectTo;
        } else {
          // Défaut selon le rôle
          if (user.role === "ADMIN") destination = "/admin";
          else if (user.role === "AGENT") destination = "/agent";
          else destination = "/";
        }

        // 3. Rechargement complet pour que le middleware lise le cookie
        window.location.href = destination;
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Identifiants incorrects");
      }
    },
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-gray-900">
          Bon retour ! 👋
        </h2>
        <p className="text-gray-500 mt-1">
          Connectez-vous à votre compte EcoTrack
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <Input
          label="Adresse email"
          type="email"
          placeholder="vous@exemple.cm"
          leftIcon={<MdEmail size={18} />}
          {...formik.getFieldProps("email")}
          error={formik.touched.email ? formik.errors.email : ""}
        />
        <Input
          label="Mot de passe"
          type={showPwd ? "text" : "password"}
          placeholder="••••••••"
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

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-primary-600 hover:underline font-medium"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={formik.isSubmitting}
        >
          Se connecter
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-50 px-4 text-xs text-gray-400">
            Nouveau sur EcoTrack ?
          </span>
        </div>
      </div>

      <Link href="/register">
        <Button variant="secondary" fullWidth>
          Créer un compte gratuit 🌱
        </Button>
      </Link>
    </motion.div>
  );
}