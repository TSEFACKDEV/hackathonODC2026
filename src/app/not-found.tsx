import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Page introuvable — EcoTrack" };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="text-[8rem] leading-none select-none">🌿</div>
          <div className="absolute -top-2 -right-4 text-5xl select-none animate-bounce">♻️</div>
          <div className="text-8xl font-display font-bold text-primary-100 -mt-4 select-none">
            404
          </div>
        </div>

        <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
          Cette page s'est perdue dans la nature
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          La page que vous cherchez n'existe pas ou a été déplacée.
          Retournez à l'accueil pour continuer à agir pour votre ville.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <button className="btn-primary w-full sm:w-auto px-6">
              Retour au tableau de bord
            </button>
          </Link>
          <Link href="/signals">
            <button className="btn-secondary w-full sm:w-auto px-6">
              Voir les signalements
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
