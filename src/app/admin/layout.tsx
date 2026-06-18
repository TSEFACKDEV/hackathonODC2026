"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/store";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import {
  MdDashboard, MdPeople, MdTipsAndUpdates, MdCalendarToday,
  MdReportProblem, MdEco, MdLogout, MdMenu, MdClose, MdChevronRight,
} from "react-icons/md";

const navItems = [
  { href:"/admin", label:"Dashboard", icon:<MdDashboard size={20}/>, exact:true },
  { href:"/admin/users", label:"Utilisateurs", icon:<MdPeople size={20}/> },
  { href:"/admin/signals", label:"Signalements", icon:<MdReportProblem size={20}/> },
  { href:"/admin/tips", label:"Astuces", icon:<MdTipsAndUpdates size={20}/> },
  { href:"/admin/planning", label:"Planning", icon:<MdCalendarToday size={20}/> },
  { href:"/admin/activities", label:"Activités", icon:<MdEco size={20}/> },
];

function Sidebar({ mobile=false, onClose }: { mobile?: boolean; onClose?: ()=>void }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((s: RootState) => s.auth);

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== "/admin";

  return (
    <div className={`flex flex-col h-full bg-primary-900 text-white ${mobile?"":"w-64"}`}>
      {/* Logo */}
      <div className="p-5 border-b border-primary-800 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-lg">🌿</span>
          </div>
          <div>
            <p className="font-display font-bold text-white">EcoTrack</p>
            <p className="text-primary-300 text-xs">Administration</p>
          </div>
        </Link>
        {mobile && (
          <button onClick={onClose} className="text-primary-300 hover:text-white p-1"><MdClose size={22}/></button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item);
          return (
            <Link key={item.href} href={item.href} onClick={onClose}>
              <motion.div whileHover={{ x:3 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active ? "bg-primary-600 text-white shadow-lg" : "text-primary-200 hover:bg-primary-800 hover:text-white"
                }`}>
                <span className={active?"text-white":"text-primary-400"}>{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
                {active && <MdChevronRight className="ml-auto" size={16}/>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer sidebar */}
      <div className="p-4 border-t border-primary-800">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-primary-400">Administrateur</p>
          </div>
        </div>
        <button
          onClick={() => { dispatch(logout()); router.push("/"); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-900/30 rounded-xl transition-colors text-sm font-medium">
          <MdLogout size={18}/> Déconnexion
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "ADMIN") router.replace("/");
  }, [user, router]);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col">
        <Sidebar/>
      </aside>

      {/* Sidebar mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }}
              transition={{ type:"spring", damping:25, stiffness:300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col"
            >
              <Sidebar mobile onClose={() => setSidebarOpen(false)}/>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 h-16 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100">
              <MdMenu size={22}/>
            </button>
            <h1 className="font-display font-bold text-gray-900 text-lg">Tableau de bord Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xs text-gray-500 hover:text-primary-600 transition-colors font-medium">← Voir le site</Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}