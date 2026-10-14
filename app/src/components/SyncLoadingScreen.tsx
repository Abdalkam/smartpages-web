import { useEffect, useState } from "react";

/* Total load time — tweak here (in ms) */
const DURATION_MS = 2000;
const STEP_MS = 40;
const STEPS = Math.ceil(DURATION_MS / STEP_MS);

export default function SyncLoadingScreen({ onSyncComplete }: { onSyncComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let step = 0;

    // Replace this timer with your real sync logic:
    // call setProgress(value) as work completes, then onSyncComplete() when done.
    const tick = setInterval(() => {
      step += 1;
      if (!isMounted) return;

      setProgress(Math.min(100, Math.round((step / STEPS) * 100)));

      if (step >= STEPS) {
        clearInterval(tick);
        setTimeout(() => {
          if (isMounted) onSyncComplete();
        }, 250); // brief pause at 100%
      }
    }, STEP_MS);

    return () => {
      isMounted = false;
      clearInterval(tick);
    };
  }, [onSyncComplete]);

  /* Color shifts from blue (210°) → violet (300°) as the bar fills */
  const hue = 210 + progress * 0.9;
  const color = `hsl(${hue}, 100%, 55%)`;
  const glow = `hsla(${hue}, 100%, 60%, 0.45)`;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFFFFF",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Progress Bar */}
      <div
        style={{
          width: "200px",
          height: "4px",
          backgroundColor: "#E5E5EA",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: `linear-gradient(90deg, #007AFF, ${color})`,
            borderRadius: "4px",
            transition: "width 0.1s linear, background 0.2s ease-out",
            boxShadow: `0 0 6px ${glow}`,
          }}
        />
      </div>
    </div>
  );
}