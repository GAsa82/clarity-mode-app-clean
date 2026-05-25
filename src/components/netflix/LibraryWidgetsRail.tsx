import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Headphones, Pause, Play, Sparkles, TrendingUp } from "lucide-react";
import type { ClaritySession } from "@/lib/clarity-content";

const DEFAULT_TRACK = {
  title: "Stratus Deep Work",
  subtitle: "Ambient focus field",
  duration: "45:00",
  url: "https://gauravdata.gumroad.com/l/stratus-deep-work",
};

type LibraryWidgetsRailProps = {
  trendingSessions: ClaritySession[];
  onSelect: (session: ClaritySession) => void;
};

const widgetVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const LibraryWidgetsRail = ({ trendingSessions, onSelect }: LibraryWidgetsRailProps) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0.32);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => (p >= 0.98 ? 0.08 : p + 0.004));
    }, 400);
    return () => clearInterval(id);
  }, [playing]);

  const topTrending = trendingSessions.slice(0, 4);
  const totalSeconds = 45 * 60;
  const currentSeconds = Math.floor(progress * totalSeconds);
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
      {/* Trending Sessions */}
      <motion.div
        custom={0}
        variants={widgetVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative rounded-2xl glass border border-white/10 p-4 overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/20 blur-3xl pointer-events-none animate-glow-pulse" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-medium">
              Trending Now
            </p>
          </div>
          <ul className="space-y-2">
            {topTrending.map((session, i) => (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => onSelect(session)}
                  className="w-full flex items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-primary/10 transition-all group"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {session.title}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">{session.duration}</span>
                  </span>
                  {session.premium && (
                    <Sparkles className="w-3 h-3 text-primary/70 shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Mini audio player */}
      <motion.div
        custom={1}
        variants={widgetVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative rounded-2xl bg-card-elevated border border-border p-4 overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(215_90%_62%/0.2),transparent_70%)]"
          animate={{ opacity: playing ? [0.4, 0.7, 0.4] : 0.25 }}
          transition={{ duration: 2.5, repeat: playing ? Infinity : 0 }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Headphones className="w-3.5 h-3.5 text-primary" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Now Playing
            </p>
          </div>
          <p className="text-sm font-medium text-foreground truncate">{DEFAULT_TRACK.title}</p>
          <p className="text-[10px] text-muted-foreground mb-3">{DEFAULT_TRACK.subtitle}</p>

          <div className="h-1 rounded-full bg-secondary overflow-hidden mb-3">
            <motion.div
              className="h-full rounded-full bg-primary-gradient shadow-glow"
              style={{ width: `${progress * 100}%` }}
              layout
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {formatTime(currentSeconds)} / {DEFAULT_TRACK.duration}
            </span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setPlaying((p) => !p)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-gradient text-primary-foreground shadow-glow"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </aside>
  );
};
