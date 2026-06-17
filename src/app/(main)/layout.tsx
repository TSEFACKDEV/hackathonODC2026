"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import MainSidebar from "@/components/layout/MainSidebar";
import MainHeader from "@/components/layout/MainHeader";
import MobileNav from "@/components/layout/MobileNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar desktop */}
      <MainSidebar />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <MainHeader />
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Navigation mobile */}
      <MobileNav />
    </div>
  );
}