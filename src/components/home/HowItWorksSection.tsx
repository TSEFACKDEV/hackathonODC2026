"use client";
import { motion } from "framer-motion";
import { MdPhoneAndroid, MdLocationOn, MdEmojiEvents, MdRocketLaunch } from "react-icons/md";

const steps = [
  {
    n: "01",
    icon: <MdPhoneAndroid />,
    title: "Créez votre compte",
    desc: "Inscription gratuite en moins de 2 minutes. Renseignez votre quartier pour des infos personnalisées.",
    accent: "bg-primary-600/10 text-primary-700 ring-primary-200",
  },
  {
    n: "02",
    icon: <MdLocationOn />,
    title: "Signalez ou explorez",
    desc: "Photographiez un dépôt sauvage, consultez le planning de collecte ou lisez des astuces de recyclage.",
    accent: "bg-secondary-600/10 text-secondary-700 ring-secondary-200",
  },
  {
    n: "03",
    icon: <MdEmojiEvents />,
    title: "Gagnez des points",
    desc: "Chaque action écologique (signalement, activité publiée, astuce consultée) vous rapporte des points.",
    accent: "bg-teal-600/10 text-teal-700 ring-teal-200",
  },
  {
    n: "04",
    icon: <MdRocketLaunch />,
    title: "Convertissez en crédits",
    desc: "100 points = 1 crédit télécom. Rechargez votre téléphone grâce à votre engagement écologique.",
    accent: "bg-earth-500/10 text-earth-700 ring-earth-200",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="section overflow-hidden bg-slate-50">
      <div className="container-custom relative py-16 sm:py-20">
        <div className="pointer-events-none absolute -left-16 top-8 h-72 w-72 rounded-full bg-primary-300/20 blur-3xl" />
        <div className="pointer-events-none absolute right-8 top-28 h-64 w-64 rounded-full bg-secondary-300/20 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mb-14 text-center lg:text-left"
        >
          <span className="badge-green inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tracking-wide shadow-sm">
            <MdRocketLaunch size={18} /> Comment ça marche
          </span>
          <h2 className="mt-6 text-3xl font-display font-bold text-slate-900 sm:text-4xl md:text-5xl">
            Un parcours clair pour agir localement et gagner plus.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 lg:mx-0 sm:text-lg">
            De l’inscription au signalement, chaque étape est simple, immersive et conçue pour faire de votre engagement un vrai levier écologique.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-slate-200 via-transparent to-earth-200" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {steps.map((step, index) => (
              <motion.article
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-white via-slate-50 to-white opacity-80" />
                <div className="relative flex gap-4 sm:gap-5">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-3xl border ${step.accent} ring-1 ring-inset`}>
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Étape {step.n}</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{step.title}</h3>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-slate-600">{step.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
