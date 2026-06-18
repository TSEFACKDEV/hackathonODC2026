"use client";
import { motion } from "framer-motion";
import { MdPhoneAndroid, MdLocationOn, MdEmojiEvents, MdRocketLaunch } from "react-icons/md";

const steps = [
  { n:"01", icon:<MdPhoneAndroid/>, title:"Créez votre compte", desc:"Inscription gratuite en moins de 2 minutes. Renseignez votre quartier pour des infos personnalisées.", color:"bg-primary-600" },
  { n:"02", icon:<MdLocationOn/>, title:"Signalez ou explorez", desc:"Photographiez un dépôt sauvage, consultez le planning de collecte ou lisez des astuces de recyclage.", color:"bg-secondary-600" },
  { n:"03", icon:<MdEmojiEvents/>, title:"Gagnez des points", desc:"Chaque action écologique (signalement, activité publiée, astuce consultée) vous rapporte des points.", color:"bg-teal-600" },
  { n:"04", icon:<MdPhoneAndroid/>, title:"Convertissez en crédits", desc:"100 points = 1 crédit télécom. Rechargez votre téléphone grâce à votre engagement écologique.", color:"bg-earth-500" },
];

export default function HowItWorksSection() {
  return (
    <section className="section bg-white">
      <div className="container-custom">
        <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} className="text-center mb-14">
          <span className="badge-green text-sm px-4 py-1.5 mb-4 inline-block"><MdRocketLaunch className="inline mr-2"/>Comment ça marche</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Simple, rapide, récompensé</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Démarrez en quelques minutes et contribuez immédiatement à la propreté de votre ville.</p>
        </motion.div>

        <div className="relative">
          {/* Ligne de connexion desktop */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-secondary-300 to-earth-200"/>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, y:30 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className={`w-24 h-24 ${s.color} rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg relative z-10`}>
                  {s.icon}
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-base font-display font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed px-2">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}