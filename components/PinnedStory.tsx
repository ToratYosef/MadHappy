"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

type StoryState = {
  id: string;
  title: string;
  caption: string;
  body: string;
  tone: string;
  accent?: string;
};

const storyStates: StoryState[] = [
  {
    id: "low",
    title: "low",
    caption: "(key)",
    body: "Precision made for the ones who keep their circle small and their standards high.",
    tone: "bg-taupe text-ink",
    accent: "Muted taupe base with soft glow."
  },
  {
    id: "key",
    title: "key icon",
    caption: "signal",
    body: "A single gold key threaded through every stitch — a reminder to protect what matters.",
    tone: "bg-gold text-ink",
    accent: "Muted gold accent"
  },
  {
    id: "high",
    title: "high",
    caption: "altitude",
    body: "Deep forest cores, structured silhouettes, ready for the quiet climb.",
    tone: "bg-forest text-background",
    accent: "Deep forest primary"
  },
  {
    id: "drop",
    title: "new drop",
    caption: "featured",
    body: "Limited run pieces land here first. Pair the Crest hoodie with the Signal tee.",
    tone: "bg-ink text-background",
    accent: "Launch mode"
  }
];

export function PinnedStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(prefersReduce.matches);
    const handler = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    prefersReduce.addEventListener("change", handler);
    return () => prefersReduce.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const panels = gsap.utils.toArray<HTMLElement>(".story-panel");
    if (!panels.length) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: true,
        start: "top center",
        end: "+=250%"
      }
    });

    gsap.set(panels, { opacity: 0, y: 60, filter: "blur(12px)" });
    gsap.set(panels[0], { opacity: 1, y: 0, filter: "blur(0px)" });

    panels.forEach((panel, index) => {
      if (index === 0) return;
      const label = `panel-${index}`;
      timeline.to(
        panels[index - 1],
        { opacity: 0, y: -40, filter: "blur(10px)" },
        label
      );
      timeline.to(panel, { opacity: 1, y: 0, filter: "blur(0px)" }, label);
    });

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, [reduceMotion]);

  const stateList = useMemo(() => storyStates, []);

  return (
    <section className="relative">
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden rounded-[32px] bg-white/60 p-6 shadow-soft",
          reduceMotion ? "space-y-4" : "min-h-[540px]"
        )}
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-white/60 via-transparent to-white/60" />
        {stateList.map((state) => (
          <article
            key={state.id}
            className={cn(
              "story-panel relative z-10 flex h-full flex-col justify-between gap-6 rounded-[28px] p-8",
              reduceMotion ? "static opacity-100" : "absolute inset-4",
              state.tone
            )}
          >
            <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em]">
              <span>{state.title}</span>
              <span className="rounded-full bg-background/10 px-3 py-1">
                {state.caption}
              </span>
            </div>
            <div className="space-y-3">
              <p className="text-lg leading-relaxed">{state.body}</p>
              {state.accent ? (
                <p className="text-sm uppercase tracking-wide text-background/70">
                  {state.accent}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
