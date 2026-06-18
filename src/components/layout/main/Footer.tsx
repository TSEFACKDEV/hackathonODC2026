import Link from "next/link";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import { FaFacebook, FaTwitter, FaWhatsapp, FaInstagram } from "react-icons/fa";

const links = {
  "Navigation": [
    { href: "/", label: "Accueil" },
    { href: "/tips", label: "Astuces" },
    { href: "/planning", label: "Planning" },
    { href: "/signals", label: "Signalement" },
    { href: "/activities", label: "Activités" },
  ],
  "Compte": [
    { href: "/login", label: "Connexion" },
    { href: "/register", label: "Inscription" },
    { href: "/profile", label: "Mon profil" },
  ],
  "Légal": [
    { href: "/terms", label: "Conditions d'utilisation" },
    { href: "/privacy", label: "Confidentialité" },
    { href: "/about", label: "À propos" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-custom pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🌿</span>
              </div>
              <span className="font-display font-bold text-2xl">EcoTrack</span>
            </Link>
            <p className="text-primary-200 text-sm leading-relaxed max-w-xs">
              Plateforme collaborative pour la gestion des déchets urbains au Cameroun. Ensemble, construisons des villes plus propres.
            </p>
            <div className="flex gap-3 mt-5">
              {[FaFacebook, FaTwitter, FaInstagram, FaWhatsapp].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-primary-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                  <Icon size={16}/>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-4 text-white">{title}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-primary-300 hover:text-white text-sm transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="flex flex-wrap gap-4 text-sm text-primary-300 pb-8 border-b border-primary-800">
          <span className="flex items-center gap-2"><MdEmail size={16}/> contact@ecotrack.cm</span>
          <span className="flex items-center gap-2"><MdPhone size={16}/> +237 6 XX XXX XXX</span>
          <span className="flex items-center gap-2"><MdLocationOn size={16}/> Douala, Cameroun</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 text-xs text-primary-400">
          <p>© {new Date().getFullYear()} EcoTrack. Tous droits réservés.</p>
          <p>Fait avec 💚 pour l'environnement camerounais</p>
        </div>
      </div>
    </footer>
  );
}