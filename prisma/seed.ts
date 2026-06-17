
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";



async function main() {
  console.log("🌱 Seeding EcoTrack...");

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "tsefackcalvin@gmail.com" },
    update: {},
    create: {
      name: "Calvin TSEFACK",
      email: "tsefackcalvin@gmail.com",
      password: await bcrypt.hash("Admin@2025!", 12),
      role: "ADMIN",
      isVerified: true,
      points: 5000,
      credits: 50,
      totalPoints: 5000,
    },
  });

  // Agent
  const agent = await prisma.user.upsert({
    where: { email: "agent@ecotrack.cm" },
    update: {},
    create: {
      name: "Jean-Pierre Mbida",
      email: "agent@ecotrack.cm",
      password: await bcrypt.hash("Agent@2025!", 12),
      role: "AGENT",
      isVerified: true,
      phone: "+237 677 000 001",
    },
  });

  // Utilisateur test
  const user = await prisma.user.upsert({
    where: { email: "user@ecotrack.cm" },
    update: {},
    create: {
      name: "Marie Ngo",
      email: "user@ecotrack.cm",
      password: await bcrypt.hash("User@2025!", 12),
      role: "USER",
      isVerified: true,
      points: 250,
      totalPoints: 250,
      phone: "+237 699 000 002",
    },
  });

  // Astuces
  await prisma.tip.createMany({
    skipDuplicates: true,
    data: [
      {
        adminId: admin.id,
        title: "Faire du compost maison facilement",
        content: "Le compostage transforme vos déchets organiques (épluchures, restes de repas, feuilles) en engrais naturel riche pour votre jardin...",
        type: "COMPOSTING",
        isPublished: true,
      },
      {
        adminId: admin.id,
        title: "Recycler les bouteilles plastiques en pot de fleurs",
        content: "Récupérez vos bouteilles en plastique PET, coupez-les en deux, percez le fond pour le drainage et transformez-les en jolis pots de fleurs...",
        type: "UPCYCLING",
        isPublished: true,
      },
      {
        adminId: admin.id,
        title: "Trier ses déchets : le guide complet",
        content: "Un bon tri des déchets commence à la maison. Séparez : organiques (cuisine/jardin), plastiques, papiers/cartons, verre, métaux...",
        type: "RECYCLING",
        isPublished: true,
      },
    ],
  });

  // Planning de collecte
  await prisma.schedule.createMany({
    skipDuplicates: true,
    data: [
      { title: "Collecte Akwa", zone: "Akwa", frequency: "WEEKLY", dayOfWeek: 1, timeSlot: "07:00-12:00", isActive: true },
      { title: "Collecte Bonanjo", zone: "Bonanjo", frequency: "WEEKLY", dayOfWeek: 2, timeSlot: "07:00-12:00", isActive: true },
      { title: "Collecte Bonapriso", zone: "Bonapriso", frequency: "WEEKLY", dayOfWeek: 3, timeSlot: "08:00-13:00", isActive: true },
      { title: "Collecte Deido", zone: "Deido", frequency: "WEEKLY", dayOfWeek: 4, timeSlot: "07:00-12:00", isActive: true },
      { title: "Collecte Makepe", zone: "Makepe", frequency: "BIWEEKLY", dayOfWeek: 5, timeSlot: "08:00-14:00", isActive: true },
    ],
  });

  console.log("✅ Seed terminé !");
  console.log("📧 Admin: tsefackcalvin@gmail.com / Admin@2025!");
  console.log("📧 Agent: agent@ecotrack.cm / Agent@2025!");
  console.log("📧 User:  user@ecotrack.cm  / User@2025!");
}

main().catch(console.error).finally(() => prisma.$disconnect());