"use client";

import { ReactNode, useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Props = {
  children: ReactNode;
};

export function SmoothScrollProvider({ children }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReduce.matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true
    });

    lenis.on("scroll", ScrollTrigger.update);
    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateLenis);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      ScrollTrigger.killAll();
    };
  }, []);

  return <>{children}</>;
}
