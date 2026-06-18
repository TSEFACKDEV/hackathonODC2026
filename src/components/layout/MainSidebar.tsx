"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { RootState } from "@/store";
import { logout } from "@/store/slices/authSlice";
import {
  MdDashboard, MdReportProblem, MdCalendarToday, MdTipsAndUpdates,
  MdEco, MdEmojiEvents, MdPerson, MdLogout, MdMap,
} from "react-icons/md";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: <MdDashboard size={22} /> },
  { href: "/signals", label: "Signalements", icon: <MdReportProblem size={22} /> },
  { href: "/schedule", label: "Planning collecte", icon: <MdCalendarToday size={22} /> },
  { href: "/tips", label: "Astuces & Recyclage", icon: <MdTipsAndUpdates size={22} /> },
  { href: "/activities", label: "Activités éco", icon: <MdEco size={22} /> },
  { href: "/profile", label: "Mon profil", icon: <MdPerson size={22} /> },
];

export default function MainSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex-col z-40 shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-green rounded-xl flex items-center justify-center">
            <MdEco size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-primary-700">EcoTrack</h1>
            <p className="text-xs text-gray-400">Villes propres</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200
                  ${active
                    ? "bg-primary-600 text-white shadow-eco"
                    : "text-gray-600 hover:bg-primary-50 hover:text-primary-700"
                  }
                `}
              >
                <span className={active ? "text-white" : "text-primary-500"}>{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="active-dot"
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Profil + Déconnexion */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl mb-3">
          <div className="w-9 h-9 gradient-green rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-primary-600"><MdEmojiEvents className="inline mr-1" size={14}/> {user?.points} pts</p>
          </div>
        </div>
        <button
          onClick={() => dispatch(logout())}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
        >
          <MdLogout size={20} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}