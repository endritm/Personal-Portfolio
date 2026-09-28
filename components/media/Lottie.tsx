"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/lib/useReducedMotion";

const DotLottieReact = dynamic(() => import("@lottiefiles/dotlottie-react").then((m) => m.DotLottieReact), {
  ssr: false,
});

/** Plays a .lottie or .json animation. Holds still for reduced motion. */
export function Lottie({ src, className }: { src: string; className?: string }) {
  const reduced = useReducedMotion();
  return <DotLottieReact className={className} src={src} loop autoplay={!reduced} />;
}
