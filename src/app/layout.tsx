import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    template: "%s | EcoTrack",
    default: "EcoTrack — Gestion des déchets urbains",
  },
  description: "Plateforme collaborative de gestion des déchets urbains pour des villes camerounaises plus propres",
  keywords: ["recyclage", "déchets", "environnement", "Cameroun", "Douala", "écologie"],
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "EcoTrack",
    description: "Ensemble pour des villes plus propres",
    images: ["/images/hero/hero-bg.jpg"],
  },
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