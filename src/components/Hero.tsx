import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroOrb from "@/assets/hero-orb.jpg";

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden">
      {/* Glow background */}
      <div className="absolute inset-0 bg-hero pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] opacity-40 pointer-events-none">
        <img
          src={heroOrb}
          alt=""
          className="w-full h-full object-cover rounded-full animate-float"
          style={{ filter: "blur(20px)" }}
        />
      </div>

      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs tracking-wide text-muted-foreground">
              The mental clarity platform for modern minds
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light leading-[1.05] mb-8 animate-fade-up">
            <span className="text-gradient">Clear mind.</span>
            <br />
            <span className="text-silver italic font-normal">Strong self.</span>
            <br />
            <span className="text-gradient">Focused life.</span>
          </h1>

          <p
            className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up"
            style={{ animationDelay: "0.15s", opacity: 0 }}
          >
            Escape overthinking, dopamine overload, and emotional noise.
            Build the calm, confident, focused version of yourself — one day at a time.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up"
            style={{ animationDelay: "0.3s", opacity: 0 }}
          >
            <Button variant="hero" size="xl" className="group">
              Start Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="glass" size="xl">
              Explore Clarity Library
            </Button>
          </div>

          <div
            className="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-3 text-xs uppercase tracking-[0.2em] text-muted-foreground/70 animate-fade-in"
            style={{ animationDelay: "0.6s", opacity: 0 }}
          >
            <span>50k+ minds</span>
            <span className="opacity-30">·</span>
            <span>4.9 rating</span>
            <span className="opacity-30">·</span>
            <span>Featured creator brand</span>
          </div>
        </div>
      </div>
    </section>
  );
};
