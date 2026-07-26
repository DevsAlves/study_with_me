import { useState, useEffect, useRef, useCallback } from "react";
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

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatClock(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
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

  return (
    <section id="clock" className="clock-page">
      <h1 className="title">
        Relógio <span className="highlight">& Foco</span>
      </h1>

      <div className="clock-grid">
        {/* Card do relógio digital */}
        <div className="clock-card">
          <span className="digital-clock">{formatClock(now)}</span>
          <span className="clock-date">{formatDate(now)}</span>
          <span className="clock-tz">Horário de Brasília</span>
        </div>

        {/* Card do Pomodoro */}
        <div className="pomodoro-card">
          <div className={`pomodoro-mode-tag ${mode}`}>
            {mode === "work" ? "Foco" : "Descanso"}
          </div>

          <div className="progress-ring-wrapper">
            <svg className="progress-ring" viewBox="0 0 200 200">
              <circle
                className="progress-ring-bg"
                cx="100"
                cy="100"
                r={RADIUS}
              />
              <circle
                className={`progress-ring-fill ${mode}`}
                cx="100"
                cy="100"
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

          <span className="cycles-count">
            Ciclos concluídos hoje: <strong>{cyclesCompleted}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}

export default Clock;
