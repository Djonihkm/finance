import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT ?? "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(
  to: string,
  prenom: string,
  token: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? `"Système" <${process.env.SMTP_USER}>`,
    to,
    subject: "Activation de votre compte — Système de gestion financière",
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- En-tête -->
          <tr>
            <td style="background:#11355b;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                Ministère — Système de Gestion Financière
              </p>
              <h1 style="margin:12px 0 0;color:#ffffff;font-size:22px;font-weight:700;">
                Bienvenue, ${prenom} !
              </h1>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="background:#ffffff;padding:40px;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
                Un compte a été créé pour vous sur le système de gestion financière du Ministère.
              </p>
              <p style="margin:0 0 28px;color:#374151;font-size:15px;line-height:1.6;">
                Pour activer votre compte et définir votre mot de passe, cliquez sur le bouton ci-dessous.
                Ce lien est valable <strong>24 heures</strong>.
              </p>

              <!-- Bouton -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;background:#11355b;color:#ffffff;text-decoration:none;
                              padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;
                              letter-spacing:0.5px;">
                      Activer mon compte
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Lien texte -->
              <p style="margin:0 0 8px;color:#6b7280;font-size:12px;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
              </p>
              <p style="margin:0 0 28px;word-break:break-all;">
                <a href="${resetUrl}" style="color:#11355b;font-size:12px;">${resetUrl}</a>
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
                Votre compte restera inactif tant que vous n'aurez pas défini de mot de passe.
              </p>
            </td>
          </tr>

          <!-- Pied -->
          <tr>
            <td style="background:#f3f4f6;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                © ${new Date().getFullYear()} Ministère — Système de Gestion Financière
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
