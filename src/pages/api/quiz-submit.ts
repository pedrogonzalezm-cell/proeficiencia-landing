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

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111827;">
        <h2 style="color:#4f46e5;">Nuevo resultado de quiz — ProeficiencIA</h2>
        <p><strong>Nombre:</strong> ${name || '—'}</p>
        <p><strong>Email:</strong> ${email || '—'}</p>
        <p><strong>Resultado:</strong> ${result ? `${result} — ${resultLabels[result]}` : '—'}</p>
        <p><strong>Fecha:</strong> ${timestamp ? new Date(timestamp).toLocaleString('es-CL') : '—'}</p>
        <h3 style="margin-top:24px;">Respuestas</h3>
        <table style="border-collapse:collapse;width:100%;background:#f9fafb;border-radius:8px;">
          <tbody>${answersHtml}</tbody>
        </table>
      </div>
    `;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'pedrogonzalezm@gmail.com',
      subject: `Quiz completado — ${name || 'Usuario'} (Perfil ${result})`,
      html,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('quiz-submit error:', err);
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
};
