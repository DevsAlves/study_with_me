import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "../style/Clock.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faRotateLeft,
  faForward,
} from "@fortawesome/free-solid-svg-icons";

const WORK_DURATION = 25 * 60; // 25 minutos em segundos
const BREAK_DURATION = 5 * 60; // 5 minutos em segundos

const RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const STAR_COUNT = 36; // estrelas fixas piscando no fundo
const SHOOTING_STAR_COUNT = 5; // estrelas cadentes cruzando o céu

function formatClockParts(date) {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
  return formatted.split(":"); // [hh, mm, ss]
}

function formatDate(date) {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function Clock() {
  // ===== Relógio em tempo real =====
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const [hh, mm, ss] = formatClockParts(now);

  // ===== Céu estrelado (gerado uma única vez, não a cada segundo) =====
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: `${1 + Math.random() * 1.6}px`,
        delay: `${Math.random() * 5}s`,
        duration: `${2.5 + Math.random() * 3}s`,
      })),
    []
  );

  const shootingStars = useMemo(
    () =>
      Array.from({ length: SHOOTING_STAR_COUNT }).map(() => ({
        top: `${Math.random() * 45}%`,
        left: `${Math.random() * 65}%`,
        delay: `${Math.random() * 10}s`,
        duration: `${5 + Math.random() * 4}s`,
      })),
    []
  );

  // ===== Pomodoro =====
  const [mode, setMode] = useState("work"); // "work" | "break"
  const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const intervalRef = useRef(null);

  const totalForMode = mode === "work" ? WORK_DURATION : BREAK_DURATION;

  const switchMode = useCallback(() => {
    setMode((prevMode) => {
      const nextMode = prevMode === "work" ? "break" : "work";
      setSecondsLeft(nextMode === "work" ? WORK_DURATION : BREAK_DURATION);
      return nextMode;
    });
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (mode === "work") setCyclesCompleted((c) => c + 1);
          switchMode();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, switchMode]);

  function handleStartPause() {
    setIsRunning((prev) => !prev);
  }

  function handleReset() {
    setIsRunning(false);
    setSecondsLeft(totalForMode);
  }

  function handleSkip() {
    setIsRunning(false);
    switchMode();
  }

  const progress = 1 - secondsLeft / totalForMode;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // ===== Micro-animações (pop) =====
  const [modeSwitched, setModeSwitched] = useState(false);
  useEffect(() => {
    setModeSwitched(true);
    const t = setTimeout(() => setModeSwitched(false), 500);
    return () => clearTimeout(t);
  }, [mode]);

  const [cyclePop, setCyclePop] = useState(false);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setCyclePop(true);
    const t = setTimeout(() => setCyclePop(false), 450);
    return () => clearTimeout(t);
  }, [cyclesCompleted]);

  return (
    <section id="clock" className={`clock-page mode-${mode}`}>
      {/* Céu estrelado de fundo */}
      <div className="starfield" aria-hidden="true">
        {stars.map((star, i) => (
          <span
            key={`star-${i}`}
            className="star"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}

        {shootingStars.map((star, i) => (
          <span
            key={`shoot-${i}`}
            className="shooting-star"
            style={{
              top: star.top,
              left: star.left,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <h1 className="title">
        Relógio <span className="highlight">& Foco</span>
      </h1>

      <div className="clock-grid">
        {/* Card do relógio digital */}
        <div className="clock-card animate-in">
          <span className="digital-clock" aria-label={formatClockParts(now).join(":")}>
            <span className="clock-segment">{hh}</span>
            <span className="clock-colon">:</span>
            <span className="clock-segment">{mm}</span>
            <span className="clock-colon">:</span>
            <span className="clock-segment">{ss}</span>
          </span>
          <span className="clock-date">{formatDate(now)}</span>
          <span className="clock-tz">Horário de Brasília</span>
        </div>

        {/* Card do Pomodoro */}
        <div className="pomodoro-card animate-in">
          <div className={`pomodoro-mode-tag ${mode} ${modeSwitched ? "pop" : ""}`}>
            {mode === "work" ? "Foco" : "Descanso"}
          </div>

          <div className={`progress-ring-wrapper ${isRunning ? "running" : ""} ${modeSwitched ? "pop" : ""}`}>
            <svg className="progress-ring" viewBox="0 0 220 220">
              <circle
                className="progress-ring-bg"
                cx="110"
                cy="110"
                r={RADIUS}
              />
              <circle
                className={`progress-ring-fill ${mode}`}
                cx="110"
                cy="110"
                r={RADIUS}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <span className="timer-display">{formatTimer(secondsLeft)}</span>
          </div>

          <div className="pomodoro-controls">
            <button
              className="control-btn"
              onClick={handleReset}
              aria-label="Reiniciar"
            >
              <FontAwesomeIcon icon={faRotateLeft} />
            </button>

            <button
              className="control-btn main"
              onClick={handleStartPause}
              aria-label={isRunning ? "Pausar" : "Iniciar"}
            >
              <FontAwesomeIcon icon={isRunning ? faPause : faPlay} />
            </button>

            <button
              className="control-btn"
              onClick={handleSkip}
              aria-label="Pular etapa"
            >
              <FontAwesomeIcon icon={faForward} />
            </button>
          </div>

          <span className={`cycles-count ${cyclePop ? "pop" : ""}`}>
            Ciclos concluídos hoje: <strong>{cyclesCompleted}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}

export default Clock;