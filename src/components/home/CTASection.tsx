"use client";
import Link from "next/link";
import { MdFavorite } from "react-icons/md";

export default function CTASection() {
  return (
    <section className="section bg-primary-50">
      <div className="container-custom overflow-hidden rounded-[2rem] border border-primary-200 bg-white shadow-lg shadow-slate-900/5">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] items-center py-14 px-6 sm:px-8 lg:px-10">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm">
              <MdFavorite size={20} /> Ensemble pour une ville plus propre
            </div>
            <h2 className="mt-6 text-3xl font-display font-bold tracking-tight text-slate-950 sm:text-4xl">
              Signalez, suivez et gagnez des récompenses durables.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Avec EcoTrack, chaque signalement compte. Rejoignez la communauté, obtenez des points et transformez votre engagement en crédits utiles.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signals" className="btn btn-primary shadow-lg shadow-primary-900/20">
                Signaler un dépôt
              </Link>
              <Link href="/register" className="btn btn-secondary text-primary-700 hover:bg-primary-100">
                Créer un compte
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-gradient-to-br from-primary-600 to-secondary-500 p-6 text-white shadow-xl shadow-slate-950/20 lg:p-8">
            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.32em] text-white/80">EcoTrack Community</p>
              <h3 className="mt-4 text-2xl font-semibold text-white">Votre guide vers des quartiers plus propres</h3>
              <p className="mt-4 text-sm leading-7 text-white/80">
                Découvrez des signalements à proximité, suivez les collectes et gagnez des récompenses tout en aidant votre ville.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-sm text-white/80">Signalements validés</p>
                  <p className="mt-2 text-3xl font-semibold">+1200</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-sm text-white/80">Crédits convertis</p>
                  <p className="mt-2 text-3xl font-semibold">+540</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
