"use client";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Marie Ngo", role: "Citoyenne, Douala", text: "Grâce à EcoTrack, j'ai signalé 12 dépôts dans mon quartier. Ils ont tous été collectés en moins de 48h. Mon quartier est méconnaissable !", rating: 5, avatar: "MN" },
  { name: "Paul Essomba", role: "Agent de collecte", text: "Les itinéraires optimisés nous font économiser 30% de carburant. On peut couvrir deux fois plus de zones par jour.", rating: 5, avatar: "PE" },
  { name: "Fatima Oumarou", role: "Citoyenne, Yaoundé", text: "J'ai accumulé 1500 points et converti en crédits téléphoniques. C'est incroyable d'être récompensée pour ses actions écologiques !", rating: 5, avatar: "FO" },
];

export default function TestimonialsSection() {
  return (
    <section className="section bg-white">
      <div className="container-custom">
        <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} className="text-center mb-12">
          <span className="badge-green text-sm px-4 py-1.5 mb-4 inline-block">💬 Témoignages</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Ils parlent d'EcoTrack</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity:0, y:30 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => <span key={j} className="text-yellow-400 text-lg">★</span>)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}