import { useState, useEffect, useRef, useCallback } from "react";
import "../style/Pomodoro.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faRotateLeft,
  faForward,
} from "@fortawesome/free-solid-svg-icons";

const WORK_DURATION = 25 * 60; // 25 minutos em segundos
const BREAK_DURATION = 5 * 60; // 5 minutos em segundos

const RADIUS = 110; // anel reduzido, tamanho mais equilibrado
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function Pomodoro() {
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
    <section id="pomodoro" className={`pomodoro-page mode-${mode}`}>
      {/* Peça central única: o anel + o timer, sem card, sem borda */}
      <div className="pomodoro-focus">
        <div className={`pomodoro-mode-tag ${mode} ${modeSwitched ? "pop" : ""}`}>
          {mode === "work" ? "Foco" : "Descanso"}
        </div>

        <div className={`progress-ring-wrapper ${isRunning ? "running" : ""} ${modeSwitched ? "pop" : ""}`}>
          <svg className="progress-ring" viewBox="0 0 260 260">
            <circle className="progress-ring-bg" cx="130" cy="130" r={RADIUS} />
            <circle
              className={`progress-ring-fill ${mode}`}
              cx="130"
              cy="130"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span className="timer-display">{formatTimer(secondsLeft)}</span>
        </div>

        <div className="pomodoro-controls">
          <button className="control-btn" onClick={handleReset} aria-label="Reiniciar">
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>

          <button
            className="control-btn main"
            onClick={handleStartPause}
            aria-label={isRunning ? "Pausar" : "Iniciar"}
          >
            <FontAwesomeIcon icon={isRunning ? faPause : faPlay} />
          </button>

          <button className="control-btn" onClick={handleSkip} aria-label="Pular etapa">
            <FontAwesomeIcon icon={faForward} />
          </button>
        </div>

        <span className={`cycles-count ${cyclePop ? "pop" : ""}`}>
          Ciclos concluídos hoje: <strong>{cyclesCompleted}</strong>
        </span>
      </div>
    </section>
  );
}

export default Pomodoro;
