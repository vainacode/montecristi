import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import { sanitizeInput } from "@/lib/security";

const { newsletter } = siteConfig;

export async function POST(req: NextRequest) {
  let email: string;
  try {
    const body = await req.json();
    email = sanitizeInput(body.email ?? "").toLowerCase();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ error: "Correo electrónico inválido." }, { status: 400 });
  }

  // ── Mailchimp ───────────────────────────────────────────────────────────────
  if (newsletter.provider === "mailchimp") {
    if (!newsletter.mailchimpApiKey || !newsletter.mailchimpListId) {
      console.error("[Newsletter] Mailchimp API key o List ID no configurado.");
      return NextResponse.json({ error: "Newsletter no configurado en el servidor." }, { status: 500 });
    }

    const datacenter = newsletter.mailchimpApiKey.split("-").pop();
    const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${newsletter.mailchimpListId}/members`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${newsletter.mailchimpApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email, status: "subscribed" }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.title === "Member Exists") {
        return NextResponse.json({ message: "¡Ya estás suscrito! Revisa tu bandeja de entrada." });
      }
      console.error("[Newsletter] Mailchimp error:", data);
      return NextResponse.json({ error: "No se pudo completar la suscripción." }, { status: 500 });
    }

    return NextResponse.json({ message: "¡Suscrito exitosamente! Revisa tu correo para confirmar." });
  }

  // ── Brevo (Sendinblue) ──────────────────────────────────────────────────────
  if (newsletter.provider === "brevo") {
    if (!newsletter.brevoApiKey) {
      console.error("[Newsletter] Falta BREVO_API_KEY en .env.local (debe ser una clave REST que empiece con xkeysib-).");
      return NextResponse.json({ error: "Newsletter no configurado en el servidor." }, { status: 500 });
    }
    if (!newsletter.brevoListId) {
      console.error("[Newsletter] Falta BREVO_LIST_ID en .env.local.");
      return NextResponse.json({ error: "Newsletter no configurado en el servidor." }, { status: 500 });
    }
    if (newsletter.brevoApiKey.startsWith("xsmtpsib-")) {
      console.error("[Newsletter] La clave BREVO_API_KEY es de tipo SMTP, no REST. Genera una clave REST (xkeysib-) en Brevo → Mi cuenta → SMTP & API → API Keys.");
      return NextResponse.json({ error: "Newsletter no configurado en el servidor." }, { status: 500 });
    }

    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": newsletter.brevoApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [parseInt(newsletter.brevoListId, 10)],
        updateEnabled: true,
      }),
    });

    // Brevo devuelve 201 para nuevo contacto, 204 si ya existe
    if (!res.ok && res.status !== 204) {
      const text = await res.text().catch(() => "");
      console.error("[Newsletter] Brevo error:", res.status, text);
      return NextResponse.json({ error: "No se pudo completar la suscripción." }, { status: 500 });
    }

    return NextResponse.json({ message: "¡Suscrito exitosamente! Revisa tu correo." });
  }

  // ── Sin proveedor (modo demo) ────────────────────────────────────────────────
  // En producción: cambia `provider` en site.ts a "mailchimp" o "brevo".
  console.log(`[Newsletter] Nueva suscripción (demo): ${email}`);
  return NextResponse.json({
    message: "¡Suscripción recibida! Configura el proveedor de email en site.ts para activar el envío.",
  });
}
