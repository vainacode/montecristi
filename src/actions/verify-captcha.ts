"use server";

/**
 * Server Action para verificar el token de Cloudflare Turnstile.
 * Esta función se ejecuta en el servidor para proteger la clave secreta.
 */
export async function verifyCaptcha(token: string | null) {
    if (!token) {
        return { success: false, message: "Token de verificación no proporcionado." };
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
        console.error("ERROR: TURNSTILE_SECRET_KEY no configurada en variables de entorno.");
        return { success: false, message: "Error interno de configuración de seguridad." };
    }

    try {
        const response = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
            }
        );

        const data = await response.json();

        if (data.success) {
            return { success: true };
        } else {
            console.error("Error en validación Turnstile:", data["error-codes"]);
            return {
                success: false,
                message: "La validación de seguridad falló. Inténtalo de nuevo.",
                errors: data["error-codes"]
            };
        }
    } catch (error) {
        console.error("Error al verificar Turnstile:", error);
        return { success: false, message: "Error de conexión con el servicio de validación." };
    }
}
