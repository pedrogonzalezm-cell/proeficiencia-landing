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
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111827;">
        <h2 style="color:#4f46e5;">Tu diagnóstico de automatización — ProeficiencIA</h2>
        <p>Hola ${name || ''},</p>
        <p>Gracias por completar el quiz. Aquí está tu diagnóstico:</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
          <strong>Perfil:</strong> ${result ? `${result} — ${resultLabels[result]}` : '—'}
        </div>
        ${wins.length > 0 ? `
        <h3>Acciones inmediatas para ti:</h3>
        <ul style="padding-left:20px;">${winsHtml}</ul>
        ` : ''}
        <p style="margin-top:24px;">¿Quieres profundizar? Agenda un assessment de 45 min con nuestro equipo:</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
          <a href="https://wa.me/56977489336?text=Hola%2C%20acab%C3%A9%20el%20quiz%20y%20quiero%20agendar%20un%20assessment"
             style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            Agendar por WhatsApp
          </a>
          <a href="https://cal.com/pedro/assessment"
             style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">
            Agendar por Calendario
          </a>
        </div>
        <p style="margin-top:32px;color:#6b7280;font-size:13px;">ProeficiencIA — automatización con IA para PYMEs</p>
      </div>
    `;

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
