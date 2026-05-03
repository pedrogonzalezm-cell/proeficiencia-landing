import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const questionLabels: Record<number, string> = {
  1: 'Rol en la empresa',
  2: 'Número de empleados',
  3: 'Objetivo principal',
  4: 'Departamento con más dolores',
  5: 'Horas semanales en tareas repetitivas',
  6: 'Herramientas de IA actuales',
};

const resultLabels: Record<string, string> = {
  A: 'Alto potencial de automatización',
  B: 'Potencial medio — quick wins disponibles',
  C: 'Base en construcción',
};

const quickWins: Record<string, string[]> = {
  ventas: [
    'Implementa respuestas automáticas en menos de 5 minutos',
    'Crea un lead scoring básico con tu CRM actual',
    'Configura plantillas de seguimiento automático',
  ],
  finanzas: [
    'Automatiza tus reportes semanales en 30 minutos',
    'Configura alertas de flujo de caja',
    'Reduce errores manuales en conciliación bancaria',
  ],
  marketing: [
    'Crea un calendario de contenido con IA',
    'Automatiza publicaciones en redes sociales',
    'Genera borradores de contenido en minutos, no horas',
  ],
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, result, timestamp, ...answers } = body;

    const answersHtml = Object.entries(answers)
      .filter(([key]) => !isNaN(Number(key)))
      .map(([qId, value]) => {
        const label = questionLabels[Number(qId)] ?? `Pregunta ${qId}`;
        return `<tr><td style="padding:6px 12px;color:#6b7280;">${label}</td><td style="padding:6px 12px;font-weight:500;">${value}</td></tr>`;
      })
      .join('');

    // Email para ProeficiencIA — notificación interna con todos los datos del lead
    const notificationHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111827;">
        <h2 style="color:#4f46e5;">Nuevo lead del quiz — ProeficiencIA</h2>
        <p><strong>Nombre:</strong> ${name || '—'}</p>
        <p><strong>Email:</strong> ${email || '—'}</p>
        <p><strong>Perfil:</strong> ${result ? `${result} — ${resultLabels[result]}` : '—'}</p>
        <p><strong>Fecha:</strong> ${timestamp ? new Date(timestamp).toLocaleString('es-CL') : '—'}</p>
        <h3 style="margin-top:24px;">Respuestas</h3>
        <table style="border-collapse:collapse;width:100%;background:#f9fafb;border-radius:8px;">
          <tbody>${answersHtml}</tbody>
        </table>
      </div>
    `;

    // Email para el cliente — su plan de acción personalizado
    const department = answers[4] as string | undefined;
    const wins = department && quickWins[department] ? quickWins[department] : [];
    const winsHtml = wins.map(w => `<li style="margin-bottom:8px;">${w}</li>`).join('');

    const clientHtml = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f0ebe3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0ebe3;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="background-color:#181715;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
            <img src="https://proeficiencia.cl/logo-compact.svg" alt="ProeficiencIA" height="36" style="display:inline-block;" />
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="background-color:#faf9f5;padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.08em;color:#D4922A;text-transform:uppercase;">Tu diagnóstico</p>
            <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#1a1918;line-height:1.2;">Hola ${name || ''}, aquí está tu plan de acción</h1>
            <p style="margin:0;font-size:15px;color:#3d3d3a;line-height:1.6;">Completaste el quiz de ProeficiencIA. Analizamos tus respuestas y preparamos este diagnóstico personalizado.</p>
          </td>
        </tr>

        <!-- Perfil badge -->
        <tr>
          <td style="background-color:#faf9f5;padding:0 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color:#181715;border-radius:8px;padding:20px 24px;">
                  <p style="margin:0 0 4px;font-size:12px;font-weight:600;letter-spacing:0.08em;color:#a09d96;text-transform:uppercase;">Tu perfil</p>
                  <p style="margin:0;font-size:18px;font-weight:700;color:#D4922A;">${result ? resultLabels[result] : '—'}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${wins.length > 0 ? `
        <!-- Quick wins -->
        <tr>
          <td style="background-color:#faf9f5;padding:0 40px 32px;">
            <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1a1918;">3 acciones inmediatas para ti</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${wins.map(w => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e6dfd8;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:1px;">
                        <span style="display:inline-block;width:20px;height:20px;background-color:#D4922A;border-radius:50%;text-align:center;line-height:20px;font-size:12px;font-weight:700;color:#fff;">✓</span>
                      </td>
                      <td style="font-size:14px;color:#3d3d3a;line-height:1.5;">${w}</td>
                    </tr>
                  </table>
                </td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>
        ` : ''}

        <!-- CTA -->
        <tr>
          <td style="background-color:#faf9f5;padding:0 40px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;border-radius:8px;padding:24px;">
              <tr>
                <td style="padding:24px;">
                  <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#1a1918;">¿Quieres profundizar?</p>
                  <p style="margin:0 0 20px;font-size:14px;color:#6c6a64;line-height:1.5;">Agenda una llamada gratuita de 15 min. Sin compromiso, sin costo.</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-right:12px;">
                        <a href="https://wa.me/56977489336?text=Hola%2C%20acab%C3%A9%20el%20quiz%20y%20quiero%20agendar%20una%20llamada"
                           style="display:inline-block;background-color:#25D366;color:#ffffff;font-size:14px;font-weight:600;padding:12px 20px;border-radius:6px;text-decoration:none;">
                          WhatsApp
                        </a>
                      </td>
                      <td>
                        <a href="https://cal.com/proeficiencia/15min"
                           style="display:inline-block;background-color:#D4922A;color:#ffffff;font-size:14px;font-weight:600;padding:12px 20px;border-radius:6px;text-decoration:none;">
                          Agenda aquí
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#181715;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;color:#a09d96;">ProeficiencIA — automatización con IA para PYMEs</p>
            <a href="mailto:contacto@proeficiencia.cl" style="font-size:13px;color:#D4922A;text-decoration:none;">contacto@proeficiencia.cl</a>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await Promise.all([
      resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'pedro@proeficiencia.cl',
        subject: `Nuevo lead: ${name || 'Usuario'} (Perfil ${result})`,
        html: notificationHtml,
      }),
      email ? resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Tu diagnóstico de automatización — ProeficiencIA',
        html: clientHtml,
      }) : Promise.resolve(),
    ]);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('quiz-submit error:', err);
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
};
