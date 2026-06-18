"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MdDashboard, MdReportProblem, MdHelp, MdEco, MdPerson } from "react-icons/md";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: <MdDashboard size={24} /> },
  { href: "/signals", label: "Signaler", icon: <MdReportProblem size={24} /> },
  { href: "/faq", label: "FAQ", icon: <MdHelp size={24} /> },
  { href: "/activities", label: "Activités", icon: <MdEco size={24} /> },
  { href: "/profile", label: "Profil", icon: <MdPerson size={24} /> },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-pb">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 flex-1 py-2">
              <motion.div
                animate={{ scale: active ? 1.2 : 1 }}
                className={active ? "text-primary-600" : "text-gray-400"}
              >
                {item.icon}
              </motion.div>
              <span className={`text-[10px] font-medium ${active ? "text-primary-600" : "text-gray-400"}`}>
                {item.label}
              </span>
              {active && (
                <motion.div layoutId="mobile-dot" className="w-1 h-1 bg-primary-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}