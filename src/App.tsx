// ──────────────────────────────────────────────
// NEON RAIDER — React UI Layer
// Start Screen · HUD · Game Over · Leaderboard
// ──────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { NeonRaiderGame, type GameCallbacks } from "./game";
import {
  loginAnonymously,
  submitScore,
  getTopScores,
  type LeaderboardEntry,
} from "./firebase";
import "./index.css";

type Screen = "start" | "playing" | "gameover";
type PowerUpType = "shield" | "triple" | "rapid" | "bomb";

const POWER_UP_NAMES: Record<PowerUpType, string> = {
  shield: "⛊ Shield",
  triple: "⫸ Triple Shot",
  rapid: "⚡ Rapid Fire",
  bomb: "💥 Mega Bomb",
};

const CANVAS_W = 480;
const CANVAS_H = 700;

export default function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [nickname, setNickname] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [combo, setCombo] = useState(0);
  const [bossHp, setBossHp] = useState<[number, number] | null>(null);
  const [powerUpToast, setPowerUpToast] = useState<PowerUpType | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [finalWave, setFinalWave] = useState(1);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<NeonRaiderGame | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Virtual joystick refs
  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLDivElement>(null);
  const joystickTouchId = useRef<number | null>(null);
  const joystickCenter = useRef({ x: 0, y: 0 });

  // Auth on mount
  useEffect(() => {
    loginAnonymously()
      .then((u) => setUid(u.uid))
      .catch(() => console.warn("Auth failed - leaderboard won't work"));
  }, []);

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    setLbLoading(true);
    const scores = await getTopScores(10);
    setLeaderboard(scores);
    setLbLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Start game
  const handleStart = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    const callbacks: GameCallbacks = {
      onScoreChange: (s) => setScore(s),
      onLivesChange: (l) => setLives(l),
      onWaveChange: (w) => setWave(w),
      onComboChange: (c) => setCombo(c),
      onBossSpawn: (hp, max) => setBossHp([hp, max]),
      onBossHpChange: (hp, max) => setBossHp([hp, max]),
      onBossDefeated: () => setBossHp(null),
      onPowerUp: (type) => {
        setPowerUpToast(type);
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setPowerUpToast(null), 1500);
      },
      onGameOver: async (finalS, finalW) => {
        setFinalScore(finalS);
        setFinalWave(finalW);
        setScreen("gameover");

        // Submit score
        const name = nickname.trim() || "ANON";
        setSaving(true);
        await submitScore({ nickname: name, score: finalS, wave: finalW, uid });
        setSaving(false);
        fetchLeaderboard();
      },
    };

    const game = new NeonRaiderGame(canvas, callbacks);
    gameRef.current = game;
    setScreen("playing");
    setScore(0);
    setLives(3);
    setWave(1);
    setCombo(0);
    setBossHp(null);
    game.start();
  }, [nickname, uid, fetchLeaderboard]);

  // Cleanup
  useEffect(() => {
    return () => {
      gameRef.current?.stop();
    };
  }, []);

  // ── Touch Control Handlers ─────────────────

  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    joystickTouchId.current = touch.identifier;
    const rect = joystickRef.current?.getBoundingClientRect();
    if (rect) {
      joystickCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  }, []);

  const handleJoystickMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        const maxDist = 40;
        let dx = touch.clientX - joystickCenter.current.x;
        let dy = touch.clientY - joystickCenter.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) {
          dx = (dx / dist) * maxDist;
          dy = (dy / dist) * maxDist;
        }
        // Update knob position
        if (joystickKnobRef.current) {
          joystickKnobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
        }
        // Send normalized -1..1 to game
        gameRef.current?.setTouchMove(dx / maxDist, dy / maxDist);
        break;
      }
    }
  }, []);

  const handleJoystickEnd = useCallback((e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        if (joystickKnobRef.current) {
          joystickKnobRef.current.style.transform = 'translate(0px, 0px)';
        }
        gameRef.current?.setTouchMove(0, 0);
        break;
      }
    }
  }, []);

  const handleFireStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    gameRef.current?.setTouchFiring(true);
  }, []);

  const handleFireEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    gameRef.current?.setTouchFiring(false);
  }, []);

  // ── Render ─────────────────────────────────

  return (
    <div className="app-container">
      <div className="crt-overlay" />

      {/* Canvas is always present */}
      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ display: screen === "start" ? "none" : "block" }}
      />

      {/* ── Start Screen ────────────────────── */}
      {screen === "start" && (
        <div className="start-screen">
          <h1 className="game-title">NEON RAIDER</h1>
          <p className="game-subtitle">Synthwave Space Assault</p>

          <div className="nick-section">
            <label className="nick-label">Enter Callsign</label>
            <input
              id="nickname-input"
              className="nick-input"
              type="text"
              maxLength={12}
              placeholder="PILOT"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              autoFocus
            />
          </div>

          <button id="start-btn" className="neon-btn" onClick={handleStart}>
            Launch Mission
          </button>

          <p className="insert-coin">▸ PRESS ENTER OR CLICK TO START ◂</p>

          <div className="controls-info">
            <div className="control-item">
              <span className="control-key">←→↑↓</span>
              <span>Move</span>
            </div>
            <div className="control-item">
              <span className="control-key">SPACE</span>
              <span>Fire</span>
            </div>
            <div className="control-item">
              <span className="control-key">WASD</span>
              <span>Alt Move</span>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="leaderboard-panel">
            <h2 className="leaderboard-title">★ High Scores ★</h2>
            {lbLoading ? (
              <p className="leaderboard-loading">Loading scores…</p>
            ) : leaderboard.length === 0 ? (
              <p className="leaderboard-loading">No scores yet. Be the first!</p>
            ) : (
              <ul className="leaderboard-list">
                {leaderboard.map((entry, i) => (
                  <li key={i} className="leaderboard-entry">
                    <span
                      className={`lb-rank ${
                        i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="lb-name">{entry.nickname}</span>
                    <span className="lb-score">
                      {entry.score.toLocaleString()}
                    </span>
                    <span className="lb-wave">W{entry.wave}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── HUD ─────────────────────────────── */}
      {screen === "playing" && (
        <>
          <div className="hud-container">
            <div className="hud-left">
              <div className="hud-item">
                <span className="hud-label">Score</span>
                <span className="hud-value score">
                  {score.toLocaleString()}
                </span>
              </div>
              <div className="hud-item">
                <span className="hud-label">Wave</span>
                <span className="hud-value">{wave}</span>
              </div>
            </div>
            <div className="hud-right">
              <div className="hud-item">
                <span className="hud-label">Lives</span>
                <span className="hud-value lives">
                  {"♥".repeat(Math.max(0, lives))}
                </span>
              </div>
              {combo > 1 && (
                <div className="hud-item">
                  <span className="hud-label">Combo</span>
                  <span className="hud-value combo">×{combo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Boss HP Bar */}
          {bossHp && (
            <div className="boss-bar-container">
              <span className="boss-name">⚠ Boss ⚠</span>
              <div className="boss-bar-track">
                <div
                  className="boss-bar-fill"
                  style={{ width: `${(bossHp[0] / bossHp[1]) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Power-up Toast */}
          {powerUpToast && (
            <div className={`powerup-toast ${powerUpToast}`}>
              {POWER_UP_NAMES[powerUpToast]}
            </div>
          )}

          {/* ── Mobile Touch Controls ──────── */}
          {isMobile && (
            <div className="touch-controls" id="touch-controls">
              {/* Virtual Joystick */}
              <div
                ref={joystickRef}
                className="joystick-zone"
                id="joystick-zone"
                onTouchStart={handleJoystickStart}
                onTouchMove={handleJoystickMove}
                onTouchEnd={handleJoystickEnd}
                onTouchCancel={handleJoystickEnd}
              >
                <div className="joystick-base">
                  <div ref={joystickKnobRef} className="joystick-knob" />
                </div>
              </div>

              {/* Fire Button */}
              <div
                className="fire-btn-zone"
                id="fire-btn"
                onTouchStart={handleFireStart}
                onTouchEnd={handleFireEnd}
                onTouchCancel={handleFireEnd}
              >
                <div className="fire-btn">
                  <span className="fire-btn-icon">FIRE</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Game Over Screen ────────────────── */}
      {screen === "gameover" && (
        <div className="gameover-screen">
          <h1 className="gameover-title">GAME OVER</h1>
          <p className="gameover-score">{finalScore.toLocaleString()}</p>
          <p className="gameover-wave">Wave {finalWave}</p>

          {saving && (
            <p className="saving-indicator">Uploading score…</p>
          )}

          <div className="gameover-actions">
            <button id="retry-btn" className="neon-btn" onClick={handleStart}>
              Try Again
            </button>
            <button
              id="menu-btn"
              className="neon-btn"
              onClick={() => {
                setScreen("start");
                fetchLeaderboard();
              }}
              style={{ borderColor: "#8866bb", color: "#aa88ee" }}
            >
              Main Menu
            </button>
          </div>

          {/* Leaderboard on game over */}
          <div className="leaderboard-panel">
            <h2 className="leaderboard-title">★ High Scores ★</h2>
            {lbLoading ? (
              <p className="leaderboard-loading">Loading scores…</p>
            ) : leaderboard.length === 0 ? (
              <p className="leaderboard-loading">No scores yet.</p>
            ) : (
              <ul className="leaderboard-list">
                {leaderboard.map((entry, i) => (
                  <li key={i} className="leaderboard-entry">
                    <span
                      className={`lb-rank ${
                        i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="lb-name">{entry.nickname}</span>
                    <span className="lb-score">
                      {entry.score.toLocaleString()}
                    </span>
                    <span className="lb-wave">W{entry.wave}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
