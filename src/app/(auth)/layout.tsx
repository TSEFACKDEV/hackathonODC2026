import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Authentification" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche — Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative gradient-green overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/auth/auth-bg.jpg"
            alt="EcoTrack Nature"
            fill
            className="object-cover opacity-20 mix-blend-multiply"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
              <span className="text-4xl">🌿</span>
            </div>
            <h1 className="text-4xl font-display font-bold mb-3">EcoTrack</h1>
            <p className="text-white/80 text-lg">Ensemble pour des villes plus propres</p>
          </div>
          <div className="space-y-4 text-left w-full max-w-xs">
            {[
              { icon: "📍", text: "Signalez les dépôts d'ordures" },
              { icon: "🗺️", text: "Suivez les collectes en temps réel" },
              { icon: "♻️", text: "Apprenez à recycler mieux" },
              { icon: "🏆", text: "Gagnez des points & crédits" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-white/90 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panneau droit — Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">🌿</span>
            <h1 className="text-2xl font-display font-bold text-primary-700 mt-2">EcoTrack</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}