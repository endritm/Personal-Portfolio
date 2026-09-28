"use client";

import MuxPlayer from "@mux/mux-player-react/lazy";
import type { CSSProperties } from "react";
import type { VideoRef } from "@/lib/content";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * A living image: muted, looping, no controls. Loads when it nears the viewport,
 * and doesn't autoplay for people who asked for reduced motion.
 */
export function MuxVideo({ video, title, className }: { video: VideoRef; title?: string; className?: string }) {
  const reduced = useReducedMotion();
  const [w, h] = (video.aspectRatio ?? "16:9").split(":").map(Number);
  const style: CSSProperties & { [key: `--${string}`]: string | undefined } = {
    aspectRatio: `${w || 16} / ${h || 9}`,
    width: "100%",
    "--controls": reduced ? undefined : "none",
    "--media-object-fit": "cover",
  };
  return (
    <MuxPlayer
      className={className}
      playbackId={video.playbackId}
      streamType="on-demand"
      metadataVideoTitle={title}
      muted
      loop
      playsInline
      autoPlay={reduced ? false : "muted"}
      disableTracking
      style={style}
    />
  );
}
