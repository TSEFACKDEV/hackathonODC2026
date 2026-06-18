"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MdExpandMore, MdSearch, MdHelpOutline, MdMap, 
  MdAutorenew, MdEmojiEvents, MdPerson, MdPhoneAndroid, MdChat 
} from "react-icons/md";

const faqs = [
  {
    category: "Signalements",
    icon: <MdMap size={20} />,
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
    icon: <MdAutorenew size={20} />,
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
    icon: <MdEmojiEvents size={20} />,
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
    icon: <MdPerson size={20} />,
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
    icon: <MdPhoneAndroid size={20} />,
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
    <div className="container-custom max-w-5xl py-8 space-y-8 font-sans">
      
      {/* Header avec gradient global et structure responsive */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-primary rounded-2xl p-8 text-white relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="relative z-10 space-y-2 max-w-xl">
          <span className="bg-white/20 text-white text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full backdrop-blur-sm">
            Centre d'aide
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-emerald-100/90 text-sm md:text-base font-medium">
            Trouvez rapidement des réponses à vos questions sur l'écosystème EcoTrack.
          </p>
        </div>
        <div className="absolute -bottom-6 -right-6 text-white/5 pointer-events-none hidden md:block">
          <MdHelpOutline size={220} />
        </div>
      </motion.div>

      {/* Barre de Recherche épurée */}
      <div className="relative shadow-sm rounded-xl overflow-hidden group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-600 transition-colors">
          <MdSearch size={22} />
        </div>
        <input
          type="text"
          placeholder="Rechercher un mot-clé, une fonctionnalité, une règle..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setActiveCategory(null);
          }}
          className="input pl-12 pr-4 py-4 border-gray-200 bg-white font-medium text-gray-800 placeholder-gray-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
        />
      </div>

      {/* Layout Principal : Split Screen sur Desktop (Filtres à gauche, FAQ à droite) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Navigation par catégories (Sidebar sur grand écran) */}
        {!search && (
          <div className="lg:col-span-1 lg:sticky lg:top-6 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-3 lg:pb-0 scrollbar-none snap-x">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap shrink-0 snap-center flex items-center justify-center lg:justify-start gap-3 border ${
                !activeCategory
                  ? "bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-200"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="w-5 h-5 rounded-lg bg-current/10 flex items-center justify-center">🚀</span>
              Tout voir
            </button>
            {faqs.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                className={`px-4 py-3 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap shrink-0 snap-center flex items-center lg:justify-start gap-3 border ${
                  activeCategory === cat.category
                    ? "bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-200"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="shrink-0">{cat.icon}</span>
                {cat.category}
              </button>
            ))}
          </div>
        )}

        {/* Section des questions-réponses */}
        <div className={`space-y-8 ${search ? "lg:col-span-4" : "lg:col-span-3"}`}>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8"
            >
              <div className="inline-flex p-4 rounded-full bg-gray-50 text-gray-400 mb-4">
                <MdSearch size={40} />
              </div>
              <p className="font-display font-bold text-gray-700 text-lg">Aucun résultat trouvé</p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                Nous n'avons trouvé aucune réponse pour « <span className="font-semibold text-gray-600">{search}</span> ».
              </p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {filtered.map((cat) => (
                <div key={cat.category} className="space-y-4">
                  <h2 className="text-sm font-display font-bold tracking-wider text-gray-400 uppercase flex items-center gap-2 pl-1">
                    {cat.icon} {cat.category}
                  </h2>
                  <div className="space-y-3">
                    {cat.questions.map((item, i) => {
                      const key = `${cat.category}-${i}`;
                      const isOpen = openIndex === key;
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="card card-hover overflow-hidden border-gray-100"
                        >
                          <button
                            onClick={() => toggle(key)}
                            className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-gray-50/50"
                          >
                            <span className="font-semibold text-gray-800 text-sm md:text-base">
                              {item.q}
                            </span>
                            <motion.span
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className={`shrink-0 p-1.5 rounded-lg ${
                                isOpen ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              <MdExpandMore size={20} />
                            </motion.span>
                          </button>
                          
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                key="content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className="overflow-hidden bg-gray-50/50"
                              >
                                <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
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
        </div>
      </div>

      {/* Footer Support d'aide call-to-action */}
      <div className="card bg-gradient-to-br from-primary-50 to-secondary-50/60 border-primary-100 p-8 text-center space-y-4 max-w-2xl mx-auto mt-12 relative overflow-hidden">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-primary-100 flex items-center justify-center mx-auto text-primary-600">
          <MdChat size={24} />
        </div>
        <div className="space-y-1 relative z-10">
          <h3 className="font-display font-bold text-gray-800 text-lg">
            Toujours bloqué ? Une question spécifique ?
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Pas d'inquiétude, l'équipe de support EcoTrack est à vos côtés et vous répond en moins de 24 heures.
          </p>
        </div>
        <div className="pt-2">
          <a href="mailto:support@ecotrack.cm" className="inline-block">
            <button className="btn btn-primary btn-md shadow-sm">
              Contacter l'équipe support
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}