"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdExpandMore, MdSearch } from "react-icons/md";
import Input from "@/components/ui/Input";

const faqs = [
  {
    category: "Signalements",
    icon: "🗺️",
    questions: [
      {
        q: "Comment signaler un dépôt sauvage ?",
        a: "Rendez-vous dans la section Signalements depuis le menu principal. Cliquez sur Nouveau signalement, prenez une photo du dépôt, ajoutez une description et confirmez votre position GPS. Votre signalement sera immédiatement visible sur la carte par les agents de collecte.",
      },
      {
        q: "Mon signalement a-t-il été pris en compte ?",
        a: "Oui. Dès la soumission, votre signalement apparaît sur la carte avec le statut En attente. Il passe ensuite à En cours lorsqu'un agent est assigné, puis à Résolu une fois la collecte effectuée. Vous recevez une notification à chaque changement de statut.",
      },
      {
        q: "Puis-je modifier ou supprimer un signalement ?",
        a: "Vous pouvez modifier un signalement tant qu'il est encore En attente. Une fois qu'un agent l'a pris en charge, la modification n'est plus possible. Pour signaler une erreur, contactez le support depuis votre profil.",
      },
    ],
  },
  {
    category: "Activités & Recyclage",
    icon: "♻️",
    questions: [
      {
        q: "Quelles activités écologiques peuvent rapporter des points ?",
        a: "Plusieurs types d'activités sont récompensées : le compostage, le nettoyage communautaire, le tri sélectif, l'upcycling et la sensibilisation au recyclage. Chaque type d'activité a un coefficient d'impact différent qui détermine le nombre de points attribués.",
      },
      {
        q: "Comment publier une activité éco-responsable ?",
        a: "Depuis le menu principal, accédez à la section Activités puis cliquez sur Publier une activité. Ajoutez une photo, décrivez votre action, sélectionnez la catégorie correspondante et soumettez. Votre activité sera examinée par la communauté avant validation.",
      },
      {
        q: "Qui valide mes activités ?",
        a: "Les activités sont validées par les administrateurs EcoTrack. Une fois soumise, votre activité est examinée sous 24 à 48 heures. En cas de validation, les points sont automatiquement crédités sur votre compte.",
      },
    ],
  },
  {
    category: "Points & Récompenses",
    icon: "🏆",
    questions: [
      {
        q: "Comment sont calculés mes points ?",
        a: "Les points sont calculés selon la formule suivante : Points = (Note × Coefficient d'impact) + Bonus d'engagement. Par exemple, un nettoyage communautaire a un coefficient de 2.0 tandis que le compostage a un coefficient de 1.5. Plus votre action a d'impact, plus vous gagnez de points.",
      },
      {
        q: "Comment convertir mes points en crédits téléphoniques ?",
        a: "Depuis votre tableau de bord ou votre profil, cliquez sur Convertir mes points. Le seuil minimum est de 500 points, ce qui équivaut à 500 FCFA de crédit. Sélectionnez votre opérateur, entrez votre numéro et confirmez. Le crédit est transféré sous quelques minutes.",
      },
      {
        q: "Quels opérateurs sont supportés ?",
        a: "EcoTrack supporte actuellement MTN Cameroun, Orange Cameroun et Camtel. D'autres opérateurs pourraient être ajoutés prochainement. Assurez-vous que votre numéro est bien enregistré dans votre profil avant toute conversion.",
      },
    ],
  },
  {
    category: "Compte & Sécurité",
    icon: "👤",
    questions: [
      {
        q: "Comment modifier mon profil ?",
        a: "Accédez à votre profil en cliquant sur votre avatar en haut à droite. Vous pouvez modifier votre nom, votre photo de profil et votre numéro de téléphone. Les modifications sont sauvegardées instantanément.",
      },
      {
        q: "J'ai oublié mon mot de passe, que faire ?",
        a: "Sur la page de connexion, cliquez sur Mot de passe oublié. Entrez votre adresse email et vous recevrez un lien de réinitialisation valable 30 minutes. Vérifiez également votre dossier spam si vous ne recevez pas l'email.",
      },
      {
        q: "Comment supprimer mon compte ?",
        a: "La suppression de compte est définitive et entraîne la perte de tous vos points et historique. Pour initier cette démarche, contactez notre support via la section Aide de votre profil. Un administrateur traitera votre demande sous 72 heures.",
      },
    ],
  },
  {
    category: "Application",
    icon: "📱",
    questions: [
      {
        q: "EcoTrack est-il disponible hors ligne ?",
        a: "EcoTrack nécessite une connexion internet pour la plupart de ses fonctionnalités, notamment la cartographie en temps réel et l'envoi de signalements. Cependant, vous pouvez consulter les astuces de recyclage déjà chargées sans connexion.",
      },
      {
        q: "Comment contacter le support ?",
        a: "Vous pouvez contacter notre équipe support depuis la section Aide de votre profil, ou en envoyant un email à support@ecotrack.cm. Nous répondons sous 24 heures en jours ouvrés. Pour les urgences liées à un signalement, utilisez directement la fonctionnalité de signalement.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  const filtered = faqs
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(search.toLowerCase()) ||
          q.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) => {
      if (activeCategory && cat.category !== activeCategory) return false;
      return cat.questions.length > 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-green rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 opacity-10 text-[10rem] leading-none">❓</div>
        <h1 className="text-2xl font-display font-bold">Foire aux Questions</h1>
        <p className="text-white/80 mt-1">
          Trouvez rapidement des réponses à vos questions sur EcoTrack.
        </p>
      </motion.div>

      {/* Recherche */}
      <Input
        placeholder="Rechercher une question..."
        icon={<MdSearch size={18} />}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setActiveCategory(null);
        }}
      />

      {/* Filtres par catégorie */}
      {!search && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border-2 ${
              !activeCategory
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"
            }`}
          >
            Tout
          </button>
          {faqs.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border-2 ${
                activeCategory === cat.category
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"
              }`}
            >
              {cat.icon} {cat.category}
            </button>
          ))}
        </div>
      )}

      {/* Questions */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-gray-400"
        >
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-semibold text-gray-500">Aucune question trouvée</p>
          <p className="text-sm mt-1">Essayez avec d'autres mots-clés</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {filtered.map((cat) => (
            <div key={cat.category}>
              <h2 className="text-base font-display font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span>{cat.icon}</span> {cat.category}
              </h2>
              <div className="space-y-2">
                {cat.questions.map((item, i) => {
                  const key = `${cat.category}-${i}`;
                  const isOpen = openIndex === key;
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="card p-0 overflow-hidden"
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between gap-4 p-4 text-left"
                      >
                        <span className="font-semibold text-gray-800 text-sm">{item.q}</span>
                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-primary-600 shrink-0"
                        >
                          <MdExpandMore size={22} />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact support */}
      <div className="card bg-gradient-to-r from-primary-50 to-emerald-50 border-primary-200 text-center">
        <p className="text-2xl mb-2">💬</p>
        <h3 className="font-display font-bold text-gray-800">Vous n'avez pas trouvé votre réponse ?</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Notre équipe est disponible pour vous aider.
        </p>
        <a href="mailto:support@ecotrack.cm">
          <button className="btn-primary px-6 py-2 text-sm">Contacter le support</button>
        </a>
      </div>
    </div>
  );
}