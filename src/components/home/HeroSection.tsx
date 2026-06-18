"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MdArrowForward, MdPlayCircle, MdChevronLeft, MdChevronRight, MdLocationOn, MdEmojiEvents } from "react-icons/md";

const slides = [
  {
    id: 1,
    tag: "Signalement citoyen",
    title: "Signalez les dépôts\nd'ordures en un clic",
    description: "Photographiez et géolocalisez les dépôts sauvages. Votre signalement déclenche une intervention rapide des agents de collecte.",
    image: "/images/hero/slide-1.jpg",
    gradient: "from-primary-900/90 via-primary-800/70 to-transparent",
    btnPrimary: { label: "Signaler un dépôt", href: "/signals" },
    btnSecondary: { label: "Voir la carte", href: "/signals" },
    badge: (<><MdLocationOn className="inline mr-1"/>+2 400 signalements traités</>),
  },
  {
    id: 2,
    tag: "Planning de collecte",
    title: "Consultez le planning\nde collecte de votre zone",
    description: "Accédez aux calendriers de collecte par quartier, téléchargez-les en PDF et ne ratez plus jamais le passage des agents.",
    image: "/images/hero/slide-2.jpg",
    gradient: "from-emerald-900/90 via-emerald-800/70 to-transparent",
    btnPrimary: { label: "Voir le planning", href: "/planning" },
    btnSecondary: { label: "Mon quartier", href: "/planning" },
    badge: "📅 Douala & Yaoundé couverts",
  },
  {
    id: 3,
    tag: "Gamification verte",
    title: "Gagnez des points,\nconvertissez en crédits",
    description: "Chaque action écologique vous rapporte des points. Accumulez-les et convertissez-les en crédits de communication téléphonique.",
    image: "/images/hero/slide-3.jpg",
    gradient: "from-teal-900/90 via-teal-800/70 to-transparent",
    btnPrimary: { label: "Rejoindre la communauté", href: "/register" },
    btnSecondary: { label: "Découvrir les astuces", href: "/tips" },
    badge: (<><MdEmojiEvents className="inline mr-1"/>+1 200 utilisateurs actifs</>),
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => { setDirection(1); setCurrent(c => (c + 1) % slides.length); }, []);
  const prev = useCallback(() => { setDirection(-1); setCurrent(c => (c - 1 + slides.length) % slides.length); }, []);
  const goTo = (i: number) => { setDirection(i > current ? 1 : -1); setCurrent(i); };

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next, paused]);

  const slide = slides[current];

  return (
    <section
      className="relative min-h-[92vh] md:min-h-screen flex items-center overflow-hidden bg-primary-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ x: direction * 100 + "%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -100 + "%", opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
        >
          <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={current === 0} />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}/>
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container-custom relative z-10 py-24 md:py-0">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-5"
            >
              {/* Tag */}
              <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.3 }}>
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/30">
                  <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"/>
                  {slide.tag}
                </span>
              </motion.div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight whitespace-pre-line">
                {slide.title}
              </h1>

              {/* Description */}
              <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-lg">
                {slide.description}
              </p>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm font-medium border border-white/20">
                {slide.badge}
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href={slide.btnPrimary.href}>
                  <motion.button whileTap={{ scale: 0.97 }}
                    className="btn-lg btn-primary shadow-lg shadow-primary-900/30">
                    {slide.btnPrimary.label}
                    <MdArrowForward size={18}/>
                  </motion.button>
                </Link>
                <Link href={slide.btnSecondary.href}>
                  <motion.button whileTap={{ scale: 0.97 }}
                    className="btn-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm btn">
                    {slide.btnSecondary.label}
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Contrôles */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
        <button onClick={prev} className="w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors border border-white/30">
          <MdChevronLeft size={20}/>
        </button>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${i === current ? "w-8 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
        <button onClick={next} className="w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors border border-white/30">
          <MdChevronRight size={20}/>
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
        <motion.div
          key={current + "-progress"}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5.5, ease: "linear" }}
          className="h-full bg-primary-400"
        />
      </div>
    </section>
  );
}