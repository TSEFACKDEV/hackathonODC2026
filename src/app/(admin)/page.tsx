"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "ADMIN") { router.replace("/dashboard"); }
  }, [user, router]);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
            <AdminHeader />
                <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
                {children}
                </main>
        </div>
    </div>
  );
}