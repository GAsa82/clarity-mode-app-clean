import { Bookmark, Play, FileText, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const categories = [
  "All",
  "Mental Clarity",
  "Confidence",
  "Discipline",
  "Emotional Intelligence",
  "Focus",
  "Dopamine Detox",
  "Masculine Energy",
  "Calmness",
];

const content = [
  {
    type: "article",
    cat: "Mental Clarity",
    title: "Stop rehearsing the past. Start designing the next move.",
    read: "4 min read",
  },
  {
    type: "audio",
    cat: "Calmness",
    title: "10-minute reset for a noisy mind",
    read: "10 min audio",
  },
  {
    type: "video",
    cat: "Dopamine Detox",
    title: "The 72-hour reset that rewires your focus",
    read: "8 min watch",
  },
  {
    type: "article",
    cat: "Confidence",
    title: "Confidence is a byproduct of kept promises to yourself",
    read: "5 min read",
  },
  {
    type: "audio",
    cat: "Focus",
    title: "Ambient deep work — Stratus session",
    read: "45 min audio",
  },
  {
    type: "article",
    cat: "Emotional Intelligence",
    title: "Name the feeling. Reduce the grip.",
    read: "3 min read",
  },
];

const iconFor = (t: string) =>
  t === "video" ? Play : t === "audio" ? Headphones : FileText;

export const Library = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? content : content.filter((c) => c.cat === active);

  return (
    <section id="library" className="py-24 md:py-32 relative">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">
              The Library
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light leading-tight">
              Sharp ideas. <span className="text-silver italic">Short doses.</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Browse articles, audio sessions, and videos by what your mind needs today.
          </p>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-10 -mx-6 px-6 md:mx-0 md:px-0 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 border ${
                active === c
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => {
            const Icon = iconFor(item.type);
            return (
              <article
                key={i}
                className="group bg-card-elevated border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 cursor-pointer animate-scale-in"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="uppercase tracking-wider">{item.cat}</span>
                  </div>
                  <button className="text-muted-foreground hover:text-primary transition-colors" aria-label="Save">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-display text-xl leading-snug mb-6 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground">{item.read}</p>
              </article>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button variant="glass" size="lg">Browse all content</Button>
        </div>
      </div>
    </section>
  );
};
