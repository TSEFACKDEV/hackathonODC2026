"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { MdLocationOn, MdMap, MdAutorenew, MdEmojiEvents, MdNature, MdBarChart } from "react-icons/md";

const features = [
  {
    icon: <MdLocationOn />,
    title: "Signalement en temps réel",
    description: "Signalez et géolocalisez les dépôts sauvages avec photo. Gagnez 10 points par signalement validé.",
    href: "/signals",
    cta: "Signaler",
    color: "from-red-50 to-orange-50",
    border: "border-red-100",
    iconBg: "bg-red-100",
  },
  {
    icon: <MdMap />,
    title: "Itinéraires optimisés",
    description: "Les agents de collecte utilisent des algorithmes pour calculer le chemin le plus court et réduire le CO₂.",
    href: "/planning",
    cta: "Voir le planning",
    color: "from-blue-50 to-indigo-50",
    border: "border-blue-100",
    iconBg: "bg-blue-100",
  },
  {
    icon: <MdAutorenew />,
    title: "Astuces & Recyclage",
    description: "Compostage, upcycling, tri sélectif… Apprenez à transformer vos déchets en ressources utiles.",
    href: "/tips",
    cta: "Voir les astuces",
    color: "from-primary-50 to-emerald-50",
    border: "border-primary-100",
    iconBg: "bg-primary-100",
  },
  {
    icon: <MdEmojiEvents />,
    title: "Points & Récompenses",
    description: "Chaque action écologique vous rapporte des points convertibles en crédits de communication téléphonique.",
    href: "/register",
    cta: "Commencer",
    color: "from-yellow-50 to-amber-50",
    border: "border-yellow-100",
    iconBg: "bg-yellow-100",
  },
  {
    icon: <MdNature />,
    title: "Activités écologiques",
    description: "Partagez vos actions vertes, inspirez votre communauté et montez dans le classement éco-citoyen.",
    href: "/activities",
    cta: "Explorer",
    color: "from-teal-50 to-cyan-50",
    border: "border-teal-100",
    iconBg: "bg-teal-100",
  },
  {
    icon: <MdBarChart />,
    title: "Tableau de bord admin",
    description: "Les administrateurs et agents disposent d'outils complets pour gérer les collectes et analyser les données.",
    href: "/admin",
    cta: "Dashboard",
    color: "from-purple-50 to-violet-50",
    border: "border-purple-100",
    iconBg: "bg-purple-100",
  },
];

export default function FeaturesSection() {
  return (
    <section className="section bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="badge-green text-sm px-4 py-1.5 mb-4 inline-block">
            <MdNature className="inline mr-2" /> Fonctionnalités
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3">Tout ce dont vous avez besoin</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">EcoTrack réunit citoyens, agents et administrateurs autour d'une mission commune : des villes plus propres.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="card card-hover p-6"
            >
              <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center text-2xl mb-4 text-primary-700`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-display font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{feature.description}</p>
              <Link href={feature.href} className="btn btn-sm btn-ghost text-primary-700 hover:bg-primary-50 px-0 font-semibold">{feature.cta} →</Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
