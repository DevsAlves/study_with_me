import { useState, useRef, useEffect, useCallback } from "react";
import "../style/Sleep.css";

// Dados de cada nível do gauge (1 = alerta total, 5 = apagando)
const LEVELS = {
  1: {
    label: "alerta total",
    title: "Segue o plano",
    text: "Nenhuma ação especial necessária — aproveita o pico de foco pro conteúdo mais pesado.",
    color: "#00ff8c",
    glow: "none",
  },
  2: {
    label: "atenção leve",
    title: "Fica de olho",
    text: "Ainda dá pra continuar, mas evita ler passivamente por muito tempo. Intercala com questões.",
    color: "#8fd98c",
    glow: "none",
  },
  3: {
    label: "preguiça leve",
    title: "Troca de atividade",
    text: "Você ainda está no controle. Sai da leitura passiva: resume, responde questões ou explica o conteúdo em voz alta.",
    color: "#ffb020",
    glow: "none",
  },
  4: {
    label: "sono chegando",
    title: "Levanta agora",
    text: "Isso já é sinal físico. Usa o timer de 2-3 min abaixo antes de continuar — não adianta forçar sentado.",
    color: "#ff8a4c",
    glow: "none",
  },
  5: {
    label: "apagando",
    title: "Pausa de verdade",
    text: "Nesse ponto, estudar rende quase zero. Pausa de 10-15 min longe da tela, ou remarca esse bloco pra outro horário.",
    color: "#ff0051",
    glow: "0 0 10px #ff0055, 0 0 20px #ff0055",
  },
};

const SUGGESTIONS = [
  "→ Levanta e caminha pela casa",
  "→ Água gelada no rosto e nos pulsos",
  "→ 10 polichinelos ou agachamentos",
  "→ Abre a janela, respira ar fresco",
  "→ Alonga pescoço e ombros de pé",
];

const PREVENTION_DATA = [
  {
    tag: "Ritmo",
    title: "Mapeia teu horário fraco",
    text: "Se o sono sempre bate no mesmo período do dia, é ritmo circadiano. Reserva esse horário pra revisão leve ou Anki, e estuda conteúdo pesado em outro momento.",
  },
  {
    tag: "Postura",
    title: "Luz e postura de pé",
    text: "Estudar deitado ou no escuro manda sinal de 'hora de dormir' pro cérebro. Luz clara e postura ereta mantêm o corpo em modo ativo.",
  },
  {
    tag: "Alimentação",
    title: "Cuidado com refeição pesada",
    text: "Comer muito antes de estudar desvia sangue pro sistema digestivo e derruba o foco. Prefere algo leve, e hidrata bem ao longo do dia.",
  },
  {
    tag: "Estrutura",
    title: "Pomodoro com pausa real",
    text: "25-30 min de foco, 5 min de pausa longe da tela — sem celular. Isso evita o acúmulo de fadiga mental que vira sono no meio do bloco.",
  },
];

const MICRO_TEMPLATES = [
  (s) => `→ Abre o material de ${s} e lê só 1 página.`,
  (s) => `→ Abre o Anki e revisa 5 cards de ${s}.`,
  (s) => `→ Escreve num papel 3 coisas que você já sabe sobre ${s}.`,
  (s) => `→ Assiste só os primeiros 5 min de uma aula de ${s}.`,
  (s) => `→ Abre o caderno de ${s} e copia o último tópico que parou.`,
];

const TIMER_DURATION = 120; // 2 minutos
const RING_CIRC = 326.7; // 2 * pi * 52

export default function SleepPanelPage() {
  // ---------- Gauge ----------
  const [level, setLevel] = useState(3);
  const data = LEVELS[level];
  const needleAngle = -90 + (level - 1) * 45;

  // ---------- Timer de emergência ----------
  const [remaining, setRemaining] = useState(TIMER_DURATION);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const startTimer = useCallback(() => {
    if (running) return;
    setDone(false);
    setRemaining(TIMER_DURATION);
    setRunning(true);
  }, [running]);

  const nextSuggestion = useCallback(() => {
    setSuggestionIndex((i) => (i + 1) % SUGGESTIONS.length);
  }, []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const ringOffset = RING_CIRC * (1 - remaining / TIMER_DURATION);

  // ---------- Toggle passivo / ativo ----------
  const [mode, setMode] = useState("passive");

  const toggleItems = [
    { text: "Reler o slide/PDF de novo", risk: "alto", mode: "passive" },
    { text: "Assistir aula em velocidade normal, sem pausar", risk: "alto", mode: "passive" },
    { text: "Grifar o texto sem parar pra pensar", risk: "médio", mode: "passive" },
    { text: "Explicar o conteúdo em voz alta (Feynman)", risk: "acordado", mode: "active" },
    { text: "Responder questões sobre o assunto", risk: "acordado", mode: "active" },
    { text: "Fazer flashcard novo no Anki", risk: "acordado", mode: "active" },
  ];

  const riskClass = { alto: "high", médio: "medium", acordado: "low" };

  // ---------- Cards de prevenção ----------
  const [openCard, setOpenCard] = useState(null);

  // ---------- Gerador de micro-passo ----------
  const [subject, setSubject] = useState("");
  const [microOutput, setMicroOutput] = useState("→ o resultado aparece aqui");

  const generateStep = useCallback(() => {
    const s = subject.trim() || "hoje";
    const template = MICRO_TEMPLATES[Math.floor(Math.random() * MICRO_TEMPLATES.length)];
    setMicroOutput(template(s));
  }, [subject]);

  return (
    <div className="sleep-page" id="sleep">
      <h1 className="title">
        Painel <span className="highlight">Anti-Sono</span>
      </h1>
      <p className="subtitle">
        Pra quando o sono ou a preguiça batem no meio do estudo. Ajusta o nível abaixo e o painel te diz o que fazer agora.
      </p>

      <div className="sleep-grid">
        {/* GAUGE */}
        <div className="sleep-card">
          <div className="sleep-card-label">
            <span>Nível de sono</span>
            <span>Agora</span>
          </div>

          <div className="gauge-area">
            <svg className="sleep-gauge" viewBox="0 0 260 160">
              <path
                d="M 20 140 A 110 110 0 0 1 240 140"
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 20 140 A 110 110 0 0 1 240 140"
                fill="none"
                stroke="url(#sleepArcGrad)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="sleepArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00ff8c" />
                  <stop offset="50%" stopColor="#ffb020" />
                  <stop offset="100%" stopColor="#ff0051" />
                </linearGradient>
              </defs>
              <g className="sleep-needle" transform={`rotate(${needleAngle} 130 140)`}>
                <line x1="130" y1="140" x2="130" y2="45" stroke="#f4f9ff" strokeWidth="3" strokeLinecap="round" />
                <circle cx="130" cy="140" r="7" fill="#f4f9ff" />
              </g>
            </svg>

            <div className="gauge-readout">
              <div className="big" style={{ color: data.color, textShadow: data.glow }}>
                {level}
              </div>
              <div className="label">{data.label}</div>
            </div>
          </div>

          <div className="slider-row">
            <input
              type="range"
              min="1"
              max="5"
              value={level}
              className="sleep-slider"
              onChange={(e) => setLevel(Number(e.target.value))}
            />
            <div className="slider-ticks">
              <span>1 — alerta</span>
              <span>3 — meio</span>
              <span>5 — apagando</span>
            </div>
          </div>

          <div className="sleep-verdict" style={{ borderLeftColor: data.color }}>
            <h3>{data.title}</h3>
            <p>{data.text}</p>
          </div>
        </div>

        {/* TIMER DE EMERGÊNCIA */}
        <div className="sleep-card">
          <div className="sleep-card-label">
            <span>Ação de emergência</span>
            <span>2 a 3 min</span>
          </div>
          <p className="sleep-section-sub" style={{ marginBottom: "1.4rem" }}>
            Sono de verdade é queda de oxigenação no cérebro. Mexer o corpo resolve mais rápido que café.
          </p>

          <div className="sleep-timer-card">
            <div className="sleep-ring-wrap">
              <svg className="sleep-ring">
                <circle className="sleep-ring-bg" cx="60" cy="60" r="52" />
                <circle
                  className="sleep-ring-fill"
                  cx="60"
                  cy="60"
                  r="52"
                  strokeDasharray={RING_CIRC}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <div className="sleep-ring-time">
                {done ? "Feito ✓" : `${minutes}:${String(seconds).padStart(2, "0")}`}
              </div>
            </div>

            <div className="sleep-timer-controls">
              <p>Escolhe uma ação, aperta em começar, e volta pro material só quando o tempo zerar.</p>
              <div className="sleep-move-suggestion">{SUGGESTIONS[suggestionIndex]}</div>
              <button className="sleep-btn" onClick={startTimer} disabled={running}>
                {running ? "Em andamento..." : done ? "Começar de novo" : "Começar (2 min)"}
              </button>
              <button className="sleep-btn ghost" onClick={nextSuggestion}>
                Outra ação
              </button>
            </div>
          </div>
        </div>

        {/* PASSIVO VS ATIVO */}
        <div className="sleep-card">
          <div className="sleep-section-title">Passivo puxa sono. Ativo mantém acordado</div>
          <div className="sleep-section-sub">Clica pra comparar os dois jeitos de estudar o mesmo conteúdo.</div>

          <div className="sleep-toggle-bar">
            <button className={mode === "passive" ? "active" : ""} onClick={() => setMode("passive")}>
              Modo passivo
            </button>
            <button className={mode === "active" ? "active" : ""} onClick={() => setMode("active")}>
              Modo ativo
            </button>
          </div>

          <div>
            {toggleItems
              .filter((item) => item.mode === mode)
              .map((item, i) => (
                <div className="sleep-toggle-item" key={i}>
                  <span>{item.text}</span>
                  <span className={`sleep-risk-tag ${riskClass[item.risk]}`}>sono {item.risk}</span>
                </div>
              ))}
          </div>
        </div>

        {/* CARDS DE PREVENÇÃO */}
        <div className="sleep-card">
          <div className="sleep-section-title">Prevenção — antes de sentar pra estudar</div>
          <div className="sleep-section-sub">Clica em cada card pra abrir o detalhe.</div>

          <div className="sleep-prevention-grid">
            {PREVENTION_DATA.map((item, i) => (
              <div
                key={i}
                className={`sleep-prevention-card ${openCard === i ? "open" : ""}`}
                onClick={() => setOpenCard(openCard === i ? null : i)}
              >
                <span className="chevron">⌄</span>
                <div className="sleep-prevention-tag">{item.tag}</div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* GERADOR DE MICRO-PASSO */}
        <div className="sleep-card">
          <div className="sleep-section-title">Se for preguiça, não sono</div>
          <div className="sleep-section-sub">
            Digita a matéria e o painel gera o menor passo possível pra você começar.
          </div>

          <div className="sleep-micro-row">
            <input
              type="text"
              placeholder="ex: Estrutura de Dados, React, Paradigmas..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateStep()}
            />
            <button className="sleep-btn" onClick={generateStep}>
              Gerar próximo passo
            </button>
          </div>
          <div className="sleep-micro-output">{microOutput}</div>
        </div>
      </div>
    </div>
  );
}