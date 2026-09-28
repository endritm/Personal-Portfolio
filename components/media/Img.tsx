import { Image as SanityImage } from "next-sanity/image";
import type { ImageRef } from "@/lib/content";

type Props = {
  image: ImageRef;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

/** Images from the Sanity CDN go through its image pipeline; anything else renders as is. */
export function Img({ image, sizes = "100vw", className, priority }: Props) {
  const width = image.width ?? 1600;
  const height = image.height ?? 1000;
  if (image.url.includes("cdn.sanity.io")) {
    return (
      <SanityImage
        src={image.url}
        alt={image.alt}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        priority={priority}
        placeholder={image.lqip ? "blur" : "empty"}
        blurDataURL={image.lqip}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.url}
      alt={image.alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

/** A lightweight moving preview for indexes: Mux's animated thumbnail, no player needed. */
export function muxPreview(playbackId: string, width = 640) {
  return `https://image.mux.com/${playbackId}/animated.webp?width=${width}&fps=15`;
}
