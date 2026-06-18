"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { MdLocationOn, MdGroup, MdPublic, MdStar } from "react-icons/md";

const stats = [
  { value: 2400, suffix: "+", label: "Signalements traités", icon: <MdLocationOn/>, color: "text-primary-600" },
  { value: 1200, suffix: "+", label: "Utilisateurs actifs", icon: <MdGroup/>, color: "text-blue-600" },
  { value: 850, suffix: "kg", label: "CO₂ économisés", icon: <MdPublic/>, color: "text-teal-600" },
  { value: 98, suffix: "%", label: "Taux de satisfaction", icon: <MdStar/>, color: "text-yellow-500" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const dur = 1800, fps = 60;
    const step = to / (dur / (1000 / fps));
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + step, to);
      setVal(Math.round(cur));
      if (cur >= to) clearInterval(t);
    }, 1000 / fps);
    return () => clearInterval(t);
  }, [inView, to]);

  return <span ref={ref}>{val.toLocaleString("fr")}{suffix}</span>;
}

export default function StatsSection() {
  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container-custom">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl hover:bg-primary-50 transition-colors"
            >
              <div className="text-4xl mb-2">{s.icon}</div>
              <div className={`text-3xl md:text-4xl font-display font-bold mb-1 ${s.color}`}>
                <Counter to={s.value} suffix={s.suffix}/>
              </div>
              <p className="text-sm text-gray-500 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}