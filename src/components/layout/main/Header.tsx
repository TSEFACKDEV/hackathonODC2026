"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { logout } from "@/store/slices/authSlice";
import { MdMenu, MdClose, MdLogout, MdPerson, MdDashboard } from "react-icons/md";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/tips", label: "Astuces" },
  { href: "/planning", label: "Planning" },
  { href: "/signals", label: "Signalement" },
  { href: "/activities", label: "Activités" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((s: RootState) => s.auth);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); setProfileMenu(false); }, [pathname]);

  const initials = user?.name ? user.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase() : "";

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-white"}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-lg">🌿</span>
            </div>
            <span className="font-display font-bold text-xl text-primary-700">EcoTrack</span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${pathname === l.href ? "bg-primary-50 text-primary-700 font-semibold" : "text-gray-600 hover:text-primary-700 hover:bg-primary-50"}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileMenu(!profileMenu)}
                  className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm hover:shadow-md transition-shadow"
                >
                  {initials}
                </motion.button>

                <AnimatePresence>
                  {profileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      className="absolute right-0 top-13 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-sm text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="badge-green text-xs">🏆 {user.points} pts</span>
                        </div>
                      </div>
                      {[
                        { href: user.role === "ADMIN" ? "/admin" : "/profile", icon: <MdPerson size={16}/>, label: user.role === "ADMIN" ? "Dashboard Admin" : "Mon profil" },
                      ].map(item => (
                        <Link key={item.href} href={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors">
                          <span className="text-gray-400">{item.icon}</span>{item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => { dispatch(logout()); router.push("/"); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-500 transition-colors w-full border-t border-gray-100 mt-1">
                        <MdLogout size={16}/> Déconnexion
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login"><button className="btn-sm btn-ghost text-gray-600">Connexion</button></Link>
                <Link href="/register"><button className="btn-sm btn-primary">S'inscrire</button></Link>
              </div>
            )}

            {/* Burger */}
            <button onClick={() => setOpen(!open)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
              {open ? <MdClose size={22}/> : <MdMenu size={22}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-100">
            <div className="container-custom py-4 space-y-1">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors
                    ${pathname === l.href ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50"}`}>
                  {l.label}
                </Link>
              ))}
              {!user && (
                <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 mt-3">
                  <Link href="/login"><button className="btn-md btn-secondary w-full">Connexion</button></Link>
                  <Link href="/register"><button className="btn-md btn-primary w-full">S'inscrire gratuitement</button></Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}