import { useState, useEffect, useCallback } from 'react';
import { quizQuestions, calculateScore, departmentQuickWins, departmentNames } from '../data/quiz';

type Answers = Record<number, string>;

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<'A' | 'B' | 'C' | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const root = document.getElementById('quiz-root');
    if (!root) return;

    const handlePreselect = (e: Event) => {
      const { question, value } = (e as CustomEvent).detail;
      setAnswers((prev) => ({ ...prev, [question]: value }));
      setCurrentStep(question);
    };

    root.addEventListener('quiz:preselect', handlePreselect as EventListener);
    return () => root.removeEventListener('quiz:preselect', handlePreselect as EventListener);
  }, []);

  const totalSteps = quizQuestions.length;
  const currentQuestion = quizQuestions[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setDirection('forward');
      setCurrentStep((s) => s + 1);
    } else {
      const score = calculateScore(answers);
      setResult(score);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection('back');
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    const data = { ...answers, name: contactName, email: contactEmail, result, timestamp: new Date().toISOString() };
    try {
      await fetch('https://hook.make.com/YOUR_WEBHOOK_URL', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      localStorage.setItem('quiz_result', JSON.stringify(data));
    }
  };

  const selectedValue = answers[currentQuestion?.id];
  const department = answers[4] ? departmentNames[answers[4]] : '';
  const quickWins = answers[4] ? departmentQuickWins[answers[4]] : [];

  if (result) {
    return (
      <div className="text-center">
        {result === 'A' && (
          <>
            <h3 className="font-display text-2xl font-semibold text-ink mb-4">
              Tu perfil indica que puedes recuperar horas al mes
            </h3>
            <p className="text-body text-body mb-6">
              Con base en tus respuestas, tu empresa {department ? `en {department}` : ''} tiene un alto potencial de automatización.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/56XXXXXXXXX?text=Hola%2C%20acabo%20de%20hacer%20el%20quiz%20y%20quiero%20agendar%20un%20assessment"
                target="_blank"
                rel="noopener"
                className="bg-primary text-white px-6 py-3 rounded-md font-semibold text-sm hover:bg-primary-active transition-all"
              >
                Agendar por WhatsApp
              </a>
              <a
                href="https://calendly.com/proeficiencia/assessment"
                target="_blank"
                rel="noopener"
                className="bg-surface-dark-elevated text-white px-6 py-3 rounded-md font-semibold text-sm hover:bg-surface-dark-soft transition-all"
              >
                Agendar por Calendly
              </a>
            </div>
          </>
        )}
        {result === 'B' && (
          <>
            <h3 className="font-display text-2xl font-semibold text-ink mb-4">
              3 acciones inmediatas{department ? ` para ${department}` : ''}
            </h3>
            <ul className="text-left space-y-2 mb-6">
              {quickWins.map((win, i) => (
                <li key={i} className="text-body-sm text-body flex items-center gap-2">
                  <span className="text-accent-green">&#10003;</span>
                  {win}
                </li>
              ))}
            </ul>
            <a
              href="https://calendly.com/proeficiencia/assessment"
              target="_blank"
              rel="noopener"
              className="inline-block bg-primary text-white px-6 py-3 rounded-md font-semibold text-sm hover:bg-primary-active transition-all"
            >
              Agendar assessment
            </a>
          </>
        )}
        {result === 'C' && (
          <>
            <h3 className="font-display text-2xl font-semibold text-ink mb-4">
              Aquí están 3 acciones{department ? ` para ${department}` : ''}
            </h3>
            <ul className="text-left space-y-2 mb-6">
              {quickWins.map((win, i) => (
                <li key={i} className="text-body-sm text-body flex items-center gap-2">
                  <span className="text-accent-teal">&#10003;</span>
                  {win}
                </li>
              ))}
            </ul>
            <a
              href="https://calendly.com/proeficiencia/assessment"
              target="_blank"
              rel="noopener"
              className="inline-block bg-surface-dark-elevated text-white px-6 py-3 rounded-md font-semibold text-sm hover:bg-surface-dark-soft transition-all"
            >
              Agendar assessment
            </a>
          </>
        )}

        {!submitted && (
          <div className="mt-8 pt-6 border-t border-hairline">
            <p className="text-body-sm text-muted mb-4">Déjanos tu email para recibir tu plan de acción personalizado:</p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tu nombre"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas text-ink text-sm font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <input
                type="email"
                placeholder="Tu email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas text-ink text-sm font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button
                onClick={handleSubmit}
                disabled={!contactName || !contactEmail}
                className="w-full bg-primary text-white px-6 py-3 rounded-md font-semibold text-sm hover:bg-primary-active transition-all disabled:bg-primary-disabled disabled:cursor-not-allowed"
              >
                Recibir mi plan de acción
              </button>
            </div>
          </div>
        )}

        {submitted && (
          <p className="mt-6 text-accent-green font-semibold">
            ¡Listo! Revisa tu email para tu plan de acción personalizado.
          </p>
        )}
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted">Pregunta {currentStep + 1} de {totalSteps}</span>
          <span className="text-xs font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-surface-card rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h3 className="font-display text-xl font-semibold text-ink mb-6">{currentQuestion.question}</h3>

      {'type' in currentQuestion && currentQuestion.type === 'contact' ? (
        <div className="space-y-3">
          {('fields' in currentQuestion ? currentQuestion.fields : []).map((field: { name: string; label: string; type: string; required: boolean }) => (
            <input
              key={field.name}
              type={field.type}
              placeholder={field.label}
              required={field.required}
              className="w-full px-4 py-2.5 rounded-md border border-hairline bg-canvas text-ink text-sm font-body focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {'options' in currentQuestion && (currentQuestion.options as { value: string; label: string }[]).map((option: { value: string; label: string }) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm font-body ${
                selectedValue === option.value
                  ? 'border-primary bg-primary/5 text-ink'
                  : 'border-hairline bg-surface-card text-body hover:bg-surface-cream-strong'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        {currentStep > 0 ? (
          <button
            onClick={handleBack}
            className="text-sm font-medium text-muted hover:text-ink transition-colors"
          >
            &larr; Atrás
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={handleNext}
          disabled={!selectedValue && !('type' in currentQuestion && currentQuestion.type === 'contact')}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-primary-active transition-all disabled:bg-primary-disabled disabled:cursor-not-allowed"
        >
          {currentStep === totalSteps - 1 ? 'Ver mi resultado' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
}