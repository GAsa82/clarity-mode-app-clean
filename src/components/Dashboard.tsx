import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, Flame, Quote, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";

const prompts = [
  "What thought is renting space in my head today?",
  "What did I do well yesterday that I won't credit myself for?",
  "What would the focused version of me do in the next hour?",
];

const moods = ["Calm", "Sharp", "Heavy", "Restless", "Grateful"];

export const Dashboard = () => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [journal, setJournal] = useState("");

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <section id="dashboard" className="py-24 md:py-32 relative">
      <div className="container">
        <div className="max-w-2xl mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">
            Daily Clarity
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight">
            Your dashboard for the <span className="text-silver italic">focused life.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quote */}
          <div className="lg:col-span-2 bg-card-elevated border border-border rounded-2xl p-8 md:p-10 relative overflow-hidden">
            <Quote className="w-8 h-8 text-primary/30 mb-6" />
            <p className="font-display text-2xl md:text-3xl leading-snug text-gradient">
              "The mind is a powerful place. What you feed it grows. What you starve, fades."
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Today's Clarity Note
            </p>
            <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl" />
          </div>

          {/* Streak */}
          <div className="bg-card-elevated border border-border rounded-2xl p-8 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Current Streak
              </p>
              <Flame className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-display text-6xl md:text-7xl font-light text-silver">12</p>
              <p className="text-sm text-muted-foreground mt-2">days of clarity</p>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-8 flex-1 rounded-sm ${
                    i < 12 ? "bg-primary/70" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="bg-card-elevated border border-border rounded-2xl p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
              How are you arriving?
            </p>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-4 py-2 rounded-full text-sm border transition-all ${
                    mood === m
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {mood && (
              <p className="mt-6 text-sm text-muted-foreground animate-fade-in">
                Logged. Reflection unlocked below.
              </p>
            )}
          </div>

          {/* Focus timer */}
          <div className="bg-card-elevated border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Focus Timer
            </p>
            <div className="font-display text-6xl md:text-7xl font-light tabular-nums text-gradient">
              {mm}:{ss}
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="hero" size="sm" onClick={() => setRunning(!running)}>
                {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {running ? "Pause" : "Start"}
              </Button>
              <Button
                variant="glass"
                size="sm"
                onClick={() => {
                  setRunning(false);
                  setSeconds(25 * 60);
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Breathing */}
          <div className="bg-card-elevated border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <Wind className="w-4 h-4 text-primary mb-4" />
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
              Breathe
            </p>
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-breathe blur-xl" />
              <div className="absolute inset-2 rounded-full bg-primary-gradient animate-breathe shadow-glow" />
              <span className="relative text-xs uppercase tracking-widest text-background font-medium">
                Inhale
              </span>
            </div>
          </div>

          {/* Journal */}
          <div className="lg:col-span-3 bg-card-elevated border border-border rounded-2xl p-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Reflection
              </p>
              <p className="text-xs text-muted-foreground">{journal.length} chars</p>
            </div>
            <p className="font-display text-xl mb-4 text-silver italic">
              {prompts[0]}
            </p>
            <textarea
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="Begin writing..."
              className="w-full bg-transparent resize-none outline-none text-base leading-relaxed min-h-[120px] text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
