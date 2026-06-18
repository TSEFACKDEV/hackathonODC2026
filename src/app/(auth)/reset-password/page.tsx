"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { MdLock, MdVisibility, MdVisibilityOff, MdWarningAmber, MdVpnKey } from "react-icons/md";
import api from "@/utils/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [showPwd, setShowPwd] = useState(false);

  const formik = useFormik({
    initialValues: { password:"", confirm:"" },
    validationSchema: Yup.object({
      password: Yup.string().min(8,"Min 8 caractères").required("Requis"),
      confirm: Yup.string().oneOf([Yup.ref("password")],"Les mots de passe ne correspondent pas").required("Requis"),
    }),
    onSubmit: async (values) => {
      try {
        await api.post("/auth/reset-password", { token, password: values.password });
        toast.success("Mot de passe réinitialisé !");
        router.push("/login");
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Lien invalide ou expiré");
      }
    },
  });

  if (!token) return (
    <div className="text-center py-12">
      <div className="text-primary-600 mb-4"><MdWarningAmber size={48} /></div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Lien invalide</h2>
      <p className="text-gray-500 mb-4">Ce lien de réinitialisation est invalide ou expiré.</p>
      <Link href="/forgot-password"><Button>Demander un nouveau lien</Button></Link>
    </div>
  );

  return (
    <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
      <div className="mb-8 flex items-center gap-3">
        <MdVpnKey size={34} className="text-primary-600" />
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-900">Nouveau mot de passe</h2>
          <p className="text-gray-500 mt-1">Choisissez un nouveau mot de passe sécurisé.</p>
        </div>
      </div>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <Input
          label="Nouveau mot de passe *" type={showPwd?"text":"password"} placeholder="Minimum 8 caractères"
          leftIcon={<MdLock size={18}/>}
          rightElement={<button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-gray-600 p-1">{showPwd?<MdVisibilityOff size={18}/>:<MdVisibility size={18}/>}</button>}
          {...formik.getFieldProps("password")} error={formik.touched.password?formik.errors.password:""}
        />
        <Input label="Confirmer *" type={showPwd?"text":"password"} placeholder="Répétez" leftIcon={<MdLock size={18}/>} {...formik.getFieldProps("confirm")} error={formik.touched.confirm?formik.errors.confirm:""}/>
        <Button type="submit" fullWidth size="lg" loading={formik.isSubmitting}>Réinitialiser mon mot de passe</Button>
      </form>
    </motion.div>
  );
}