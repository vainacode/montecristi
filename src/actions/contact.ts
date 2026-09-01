"use server";

import { verifyCaptcha } from "./verify-captcha";
import { siteConfig } from "@/config/site";
import { sanitizeObject } from "@/lib/security";

/**
 * Server Action para procesar el formulario de contacto.
 * 1. Verifica el token de Cloudflare Turnstile.
 * 2. Si es válido, envía un correo transaccional usando la API de Brevo.
 */
export async function submitContactForm(formData: {
    nombre: string;
    email: string;
    asunto: string;
    mensaje: string;
    captchaToken: string | null;
}) {
    const sanitizedData = sanitizeObject(formData);
    const { nombre, email, asunto, mensaje, captchaToken } = sanitizedData;

    // 1. Verificación de Turnstile
    const captchaResult = await verifyCaptcha(captchaToken);
    if (!captchaResult.success) {
        return {
            success: false,
            message: captchaResult.message || "La validación de seguridad falló. Inténtalo de nuevo."
        };
    }

    // 2. Envío de Email via Brevo API (Transactional Email)
    const brevoApiKey = process.env.BREVO_API_KEY;
    const adminEmail = siteConfig.contact.email;

    if (!brevoApiKey) {
        console.error("ERROR: BREVO_API_KEY no configurada en variables de entorno.");
        return { success: false, message: "Error interno de configuración de correo." };
    }

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "api-key": brevoApiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sender: { name: "Web Contacto", email: adminEmail }, // Usar el correo del admin que suele estar validado
                to: [{ email: adminEmail, name: `Redacción ${siteConfig.name}` }],
                replyTo: { email: email, name: nombre },
                subject: `Nuevo Mensaje Web: ${asunto}`,
                htmlContent: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                        <h2 style="color: #333;">Nuevo contacto desde la web</h2>
                        <p><strong>Nombre:</strong> ${nombre}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Motivo:</strong> ${asunto}</p>
                        <div style="background: #fdfdfd; padding: 15px; border-left: 4px solid #BF1B23; margin-top: 15px;">
                            <p style="white-space: pre-wrap; color: #555;">${mensaje}</p>
                        </div>
                        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
                        <p style="font-size: 11px; color: #999;">Enviado desde el formulario de montecristi.net</p>
                    </div>
                `,
            }),
        });

        if (response.ok) {
            return { success: true, message: "¡Mensaje enviado con éxito! Nos pondremos en contacto pronto." };
        } else {
            const errorText = await response.text();
            console.error("Error de Brevo API:", response.status, errorText);

            // Si el error es 401/403, probablemente es la API Key o el remitente
            if (response.status === 401 || response.status === 403) {
                return { success: false, message: "Error de autenticación con el servicio de correo. Revisa tus claves y remitentes validados en Brevo." };
            }

            return { success: false, message: "No se pudo enviar el mensaje por un error técnico. Por favor, inténtalo más tarde." };
        }
    } catch (error) {
        console.error("Error al enviar email via Brevo:", error);
        return { success: false, message: "Error de conexión al procesar el envío." };
    }
}
