import { useState, useEffect, useRef, useCallback } from "react";
import "../style/Timer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

const RADIUS = 140;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PRESETS = [5, 10, 15, 25, 45]; // minutos

function pad(n) {
  return String(n).padStart(2, "0");
}

function Timer() {
  // ===== Campos editáveis (HH / MM / SS) =====
  const [hh, setHh] = useState("00");
  const [mm, setMm] = useState("10");
  const [ss, setSs] = useState("00");

  const [totalSeconds, setTotalSeconds] = useState(600);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [justFinished, setJustFinished] = useState(false);
  const intervalRef = useRef(null);

  // Recalcula o total sempre que os campos mudam (só quando parado)
  useEffect(() => {
    if (isRunning) return;
    const total =
      (parseInt(hh || "0", 10) * 3600) +
      (parseInt(mm || "0", 10) * 60) +
      parseInt(ss || "0", 10);
    setTotalSeconds(total);
    setSecondsLeft(total);
  }, [hh, mm, ss, isRunning]);

  // Contagem regressiva
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setSessionsCompleted((c) => c + 1);
          setJustFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Some com o aviso de "concluído" depois de um tempinho
  useEffect(() => {
    if (!justFinished) return;
    const t = setTimeout(() => setJustFinished(false), 3000);
    return () => clearTimeout(t);
  }, [justFinished]);

  const handleFieldChange = (setter) => (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 2);
    setter(digits);
  };

  const handleFieldBlur = (value, setter, max) => () => {
    let n = parseInt(value || "0", 10);
    if (Number.isNaN(n)) n = 0;
    if (n > max) n = max;
    setter(pad(n));
  };

  function handleStartPause() {
    if (!isRunning && totalSeconds === 0) return; // nada pra rodar
    setJustFinished(false);
    setIsRunning((prev) => !prev);
  }

  function handleReset() {
    setIsRunning(false);
    setJustFinished(false);
    setSecondsLeft(totalSeconds);
  }

  const applyPreset = useCallback(
    (minutes) => {
      if (isRunning) return;
      setHh("00");
      setMm(pad(minutes));
      setSs("00");
    },
    [isRunning]
  );

  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <section id="timer" className="timer-page">
      <div className="timer-focus">
        <div className={`timer-status-tag ${isRunning ? "running" : ""} ${justFinished ? "done" : ""}`}>
          {justFinished ? "Concluído" : isRunning ? "Em andamento" : "Pronto"}
        </div>

        <div className={`progress-ring-wrapper ${isRunning ? "running" : ""}`}>
          <svg className="progress-ring" viewBox="0 0 300 300">
            <circle className="progress-ring-bg" cx="150" cy="150" r={RADIUS} />
            <circle
              className="progress-ring-fill"
              cx="150"
              cy="150"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>

          <div className="timer-input-group">
            <input
              className="timer-input"
              type="text"
              inputMode="numeric"
              value={hh}
              disabled={isRunning}
              onFocus={(e) => e.target.select()}
              onChange={handleFieldChange(setHh)}
              onBlur={handleFieldBlur(hh, setHh, 99)}
              aria-label="Horas"
            />
            <span className="timer-colon">:</span>
            <input
              className="timer-input"
              type="text"
              inputMode="numeric"
              value={mm}
              disabled={isRunning}
              onFocus={(e) => e.target.select()}
              onChange={handleFieldChange(setMm)}
              onBlur={handleFieldBlur(mm, setMm, 59)}
              aria-label="Minutos"
            />
            <span className="timer-colon">:</span>
            <input
              className="timer-input"
              type="text"
              inputMode="numeric"
              value={ss}
              disabled={isRunning}
              onFocus={(e) => e.target.select()}
              onChange={handleFieldChange(setSs)}
              onBlur={handleFieldBlur(ss, setSs, 59)}
              aria-label="Segundos"
            />
          </div>
        </div>

        {!isRunning && (
          <div className="timer-presets">
            {PRESETS.map((min) => (
              <button key={min} className="preset-chip" onClick={() => applyPreset(min)}>
                {min} min
              </button>
            ))}
          </div>
        )}

        <div className="timer-controls">
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
        </div>

        <span className="sessions-count">
          Sessões concluídas hoje: <strong>{sessionsCompleted}</strong>
        </span>
      </div>
    </section>
  );
}

export default Timer;