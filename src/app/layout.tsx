import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400","500","600","700","800"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: { template: "%s | EcoTrack", default: "EcoTrack — Des villes plus propres" },
  description: "Plateforme collaborative de gestion des déchets urbains au Cameroun. Signalez, suivez, recyclez et gagnez des récompenses.",
  keywords: ["déchets", "recyclage", "environnement", "Cameroun", "Douala", "Yaoundé", "EcoTrack"],
  authors: [{ name: "EcoTrack" }],
  openGraph: { title: "EcoTrack", description: "Ensemble pour des villes plus propres", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}