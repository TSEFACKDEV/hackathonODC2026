"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { MdDashboard, MdMap, MdRoute, MdLogout, MdMenu, MdClose, MdChevronRight, MdEco } from "react-icons/md";

const navItems = [
  { href: "/agent", label: "Dashboard", icon: <MdDashboard size={20}/>, exact: true },
  { href: "/agent/map", label: "Carte signalements", icon: <MdMap size={20}/> },
  { href: "/agent/collections", label: "Mes itinéraires", icon: <MdRoute size={20}/> },
];

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    if (!["AGENT", "ADMIN"].includes(user.role)) router.replace("/");
  }, [user, router]);

  if (!user || !["AGENT", "ADMIN"].includes(user.role)) return null;

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== "/agent";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-primary-900 text-white">
        <div className="p-5 border-b border-primary-800">
          <Link href="/agent" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <MdEco size={20} />
            </div>
            <div>
              <p className="font-display font-bold text-white">EcoTrack</p>
              <p className="text-primary-400 text-xs">Espace Agent</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}>
              <motion.div whileHover={{ x: 3 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive(item) ? "bg-primary-600 text-white" : "text-primary-200 hover:bg-primary-800"
                }`}>
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
                {isActive(item) && <MdChevronRight className="ml-auto" size={16}/>}
              </motion.div>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-primary-800">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-primary-400">Agent de collecte</p>
            </div>
          </div>
          <button onClick={() => { dispatch(logout()); router.push("/"); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-900/30 rounded-xl transition-colors text-sm">
            <MdLogout size={18}/> Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)}/>
            <motion.aside initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }}
              transition={{ type:"spring", damping:25, stiffness:300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 bg-primary-900 text-white flex flex-col">
              <div className="p-5 border-b border-primary-800 flex items-center justify-between">
                <span className="font-display font-bold text-white">EcoTrack Agent</span>
                <button onClick={() => setOpen(false)} className="text-primary-300 hover:text-white"><MdClose size={22}/></button>
              </div>
              <nav className="flex-1 p-3 space-y-0.5">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isActive(item)?"bg-primary-600":"text-primary-200 hover:bg-primary-800"}`}>
                      {item.icon}<span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 h-16 flex items-center gap-3 px-4 md:px-6 shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <MdMenu size={22}/>
          </button>
          <h1 className="font-display font-bold text-gray-900">Agent de collecte</h1>
          <div className="ml-auto">
            <Link href="/" className="text-xs text-gray-500 hover:text-primary-600 font-medium transition-colors">← Site public</Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}