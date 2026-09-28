import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

export const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  display: "swap",
});

export const sans = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const mono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
});

/** Real family names, for drawing text onto canvas textures in the 3D table. */
export const fontFamilies = {
  serif: serif.style.fontFamily,
  sans: sans.style.fontFamily,
  mono: mono.style.fontFamily,
};
