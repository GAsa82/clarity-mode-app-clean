import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#library", label: "Library" },
  { href: "#store", label: "Store" },
  { href: "#dashboard", label: "Dashboard" },
  { href: "#pricing", label: "Pricing" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="container">
        <nav
          className={`flex items-center justify-between rounded-full px-5 py-3 transition-all duration-500 ${
            scrolled ? "glass shadow-card-soft" : ""
          }`}
        >
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-full bg-primary-gradient shadow-glow animate-glow-pulse" />
            <span className="font-display text-lg font-medium tracking-tight">
              Clarity Mode
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">Sign in</Button>
            <Button asChild variant="hero" size="sm">
              <a
                href="https://gauravdata.gumroad.com/l/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => window.open("https://gauravdata.gumroad.com/l/", "_blank", "noopener,noreferrer")}
              >
                Start Free
              </a>
            </Button>
          </div>

          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {open && (
          <div className="md:hidden mt-2 glass rounded-2xl p-5 animate-fade-in">
            <div className="flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base text-foreground/90 hover:text-primary"
                >
                  {l.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm">Sign in</Button>
                <Button asChild variant="hero" size="sm">
                  <a
                    href="https://gauravdata.gumroad.com/l/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => window.open("https://gauravdata.gumroad.com/l/", "_blank", "noopener,noreferrer")}
                  >
                    Start Free
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
