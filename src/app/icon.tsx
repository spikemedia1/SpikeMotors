import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";
import { SpikeMarkIcon } from "@/lib/og-mark";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(<SpikeMarkIcon px={512} />, { ...size, fonts: await loadOgFonts() });
}
