export const quizQuestions = [
  {
    id: 1,
    question: "¿Cuál es tu rol en la empresa?",
    options: [
      { value: "owner", label: "Dueño/Socio", score: "A" },
      { value: "manager", label: "Gerente de área", score: "B" },
      { value: "director", label: "Director de operaciones", score: "C" },
      { value: "other", label: "Otro", score: "C" },
    ],
  },
  {
    id: 2,
    question: "¿Cuántos empleados tiene tu empresa?",
    options: [
      { value: "1-5", label: "1-5", score: "B" },
      { value: "6-20", label: "6-20", score: "A" },
      { value: "21-50", label: "21-50", score: "A" },
      { value: "50+", label: "50+", score: "C" },
    ],
  },
  {
    id: 3,
    question: "¿Qué quieres mejorar?",
    isForcedChoice: true,
    options: [
      { value: "sales", label: "Generar más ventas y revenue", angle: "sales" },
      { value: "costs", label: "Reducir costos y tiempo perdido", angle: "costs" },
      { value: "both", label: "Ambas por igual", angle: "both" },
    ],
  },
  {
    id: 4,
    question: "¿Qué departamento te da más dolores de cabeza?",
    options: [
      { value: "ventas", label: "Comercial / Ventas", department: "ventas" },
      { value: "finanzas", label: "Finanzas / Contabilidad", department: "finanzas" },
      { value: "marketing", label: "Marketing / Comunicación", department: "marketing" },
    ],
  },
  {
    id: 5,
    question: "¿Cómo vendes principalmente?",
    options: [
      { value: "presencial", label: "Tienda física / presencial" },
      { value: "marketplace", label: "Marketplace (Mercado Libre, Falabella, etc.)" },
      { value: "ecommerce", label: "E-commerce propio (tienda online)" },
      { value: "servicios", label: "Servicios profesionales (consultoría, diseño, legal, etc.)" },
      { value: "b2b", label: "B2B — le vendo a otras empresas" },
      { value: "mixto", label: "Mixto" },
    ],
  },
  {
    id: 6,
    question: "¿Cuántas horas semanales pierdes en tareas repetitivas?",
    options: [
      { value: "less-5", label: "Menos de 5", score: "C" },
      { value: "5-10", label: "5 a 10", score: "B" },
      { value: "10-20", label: "10 a 20", score: "A" },
      { value: "20+", label: "Más de 20", score: "A" },
    ],
  },
  {
    id: 7,
    question: "¿Qué herramientas de IA usas actualmente?",
    options: [
      { value: "none", label: "Ninguna", score: "A" },
      { value: "chatgpt", label: "ChatGPT ocasionalmente", score: "A" },
      { value: "basic", label: "Algo de automatización", score: "B" },
      { value: "several", label: "Varias herramientas", score: "C" },
    ],
  },
] as const;

export const sellTypeLabels: Record<string, string> = {
  presencial: "Tienda física / presencial",
  marketplace: "Marketplace",
  ecommerce: "E-commerce propio",
  servicios: "Servicios profesionales",
  b2b: "B2B",
  mixto: "Mixto",
};

export type QuizOption = (typeof quizQuestions)[number]["options"][number];

export const departmentQuickWins: Record<string, string[]> = {
  ventas: [
    "Implementa respuestas automáticas en menos de 5 minutos",
    "Crea un lead scoring básico con tu CRM actual",
    "Configura plantillas de seguimiento automático",
  ],
  finanzas: [
    "Automatiza tus reportes semanales en 30 minutos",
    "Configura alertas de flujo de caja",
    "Reduce errores manuales en conciliación bancaria",
  ],
  marketing: [
    "Crea un calendario de contenido con IA",
    "Automatiza publicaciones en redes sociales",
    "Genera borradores de contenido en minutos, no horas",
  ],
};

export const departmentNames: Record<string, string> = {
  ventas: "Ventas",
  finanzas: "Finanzas",
  marketing: "Marketing",
};

export const hoursEstimate: Record<string, number> = {
  "1-5": 4,
  "6-20": 12,
  "21-50": 8,
  "50+": 15,
};

export function calculateScore(
  answers: Record<number, string>,
): "A" | "B" | "C" {
  let a = 0,
    b = 0,
    c = 0;
  for (const [qId, answer] of Object.entries(answers)) {
    const q = quizQuestions.find((q) => q.id === Number(qId));
    if (!q || !("options" in q)) continue;
    const opt = (q.options as QuizOption[]).find((o: QuizOption) => o.value === answer);
    if (!opt) continue;
    if ("score" in opt && opt.score === "A") a++;
    if ("score" in opt && opt.score === "B") b++;
    if ("score" in opt && opt.score === "C") c++;
  }
  if (a >= 2) return "A";
  if (b >= 2) return "B";
  return "C";
}