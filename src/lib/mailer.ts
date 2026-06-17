import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "🌿 Vérifiez votre compte EcoTrack",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f0fdf4;border-radius:12px;">
        <h1 style="color:#16a34a;">🌿 Bienvenue sur EcoTrack, ${name} !</h1>
        <p style="color:#374151;">Merci de rejoindre notre communauté écologique. Vérifiez votre email :</p>
        <a href="${url}" style="display:inline-block;background:#16a34a;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          ✅ Vérifier mon compte
        </a>
        <p style="color:#6b7280;font-size:13px;">Lien valide 24h. Si vous n'avez pas créé de compte, ignorez ce message.</p>
        <hr style="border:1px solid #d1fae5;margin:24px 0;">
        <p style="color:#16a34a;font-weight:bold;">🌍 EcoTrack — Ensemble pour des villes plus propres</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "🔐 Réinitialisation de votre mot de passe EcoTrack",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f0fdf4;border-radius:12px;">
        <h1 style="color:#16a34a;">🔐 Réinitialisation du mot de passe</h1>
        <p style="color:#374151;">Bonjour ${name}, voici votre lien de réinitialisation :</p>
        <a href="${url}" style="display:inline-block;background:#dc2626;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          🔑 Réinitialiser mon mot de passe
        </a>
        <p style="color:#6b7280;font-size:13px;">Lien valide 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>
      </div>
    `,
  });
}