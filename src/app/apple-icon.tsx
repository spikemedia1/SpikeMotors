import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";
import { SpikeMarkIcon } from "@/lib/og-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(<SpikeMarkIcon px={180} />, { ...size, fonts: await loadOgFonts() });
}
