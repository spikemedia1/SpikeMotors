import { ImageResponse } from "next/og";
import { cars } from "@/data/cars";
import { site } from "@/data/config";
import { formatDec } from "@/lib/format";
import { loadOgFonts } from "@/lib/og-fonts";

export const alt = "Spike Motors — Automóveis de exceção";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const corner = (pos: { top?: number; bottom?: number; left?: number; right?: number }) => ({
  position: "absolute" as const,
  width: 18,
  height: 18,
  borderColor: "#C8B78B",
  borderStyle: "solid" as const,
  borderTopWidth: pos.top !== undefined ? 1 : 0,
  borderBottomWidth: pos.bottom !== undefined ? 1 : 0,
  borderLeftWidth: pos.left !== undefined ? 1 : 0,
  borderRightWidth: pos.right !== undefined ? 1 : 0,
  ...pos,
});

/* Velocímetro em linha fina (arco de 270°) como SVG. */
function gaugeSvg() {
  const cx = 110;
  const cy = 110;
  const r = 92;
  const ticks: string[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = ((135 + (270 * i) / 12) * Math.PI) / 180;
    const r1 = i % 3 === 0 ? r - 14 : r - 7;
    ticks.push(
      `<line x1="${cx + Math.cos(a) * r1}" y1="${cy + Math.sin(a) * r1}" x2="${cx + Math.cos(a) * r}" y2="${cy + Math.sin(a) * r}" stroke="${i > 10 ? "#B54A3C" : "rgba(243,239,230,0.5)"}" stroke-width="1.5"/>`,
    );
  }
  const needle = ((135 + 270 * 0.78) * Math.PI) / 180;
  const arc = (from: number, to: number) => {
    const a0 = (from * Math.PI) / 180;
    const a1 = (to * Math.PI) / 180;
    return `M ${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r}`;
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
    <path d="${arc(135, 405)}" fill="none" stroke="rgba(243,239,230,0.14)" stroke-width="1"/>
    <path d="${arc(135, 135 + 270 * 0.78)}" fill="none" stroke="#C8B78B" stroke-width="2"/>
    ${ticks.join("")}
    <line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(needle) * (r - 18)}" y2="${cy + Math.sin(needle) * (r - 18)}" stroke="#F3EFE6" stroke-width="2"/>
    <circle cx="${cx}" cy="${cy}" r="4" fill="#D7FF3F"/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default async function OpengraphImage() {
  const grid = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><path d="M60 0H0V60" fill="none" stroke="rgba(243,239,230,0.035)" stroke-width="1"/></svg>`,
  ).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#080808",
          backgroundImage: `radial-gradient(circle at 92% 6%, rgba(200,183,139,0.32), rgba(200,183,139,0) 42%), url(${grid})`,
          color: "#F3EFE6",
        }}
      >
        {/* moldura com cantoneiras */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 36,
            right: 36,
            bottom: 36,
            border: "1px solid rgba(243,239,230,0.12)",
            display: "flex",
          }}
        >
          <div style={corner({ top: -1, left: -1 })} />
          <div style={corner({ top: -1, right: -1 })} />
          <div style={corner({ bottom: -1, left: -1 })} />
          <div style={corner({ bottom: -1, right: -1 })} />
        </div>

        {/* rastro de luz horizontal */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 468,
            height: 2,
            backgroundImage: "linear-gradient(90deg, rgba(200,183,139,0), rgba(230,217,181,0.9) 62%, rgba(200,183,139,0))",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", position: "absolute", left: 96, top: 110 }}>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <span style={{ fontFamily: "Epilogue", fontWeight: 800, fontSize: 196, letterSpacing: "-0.03em", lineHeight: 1 }}>
              Spike
            </span>
            <span style={{ width: 38, height: 38, background: "#D7FF3F", marginLeft: 12, marginBottom: 26 }} />
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "JetBrains",
              fontSize: 26,
              letterSpacing: "0.6em",
              color: "#C8B78B",
              marginTop: 14,
            }}
          >
            MOTORS
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Cormorant",
              fontStyle: "italic",
              fontSize: 40,
              color: "rgba(243,239,230,0.82)",
              marginTop: 54,
            }}
          >
            {site.tagline}
          </div>
        </div>

        <div style={{ position: "absolute", right: 110, top: 150, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gaugeSvg()} width={220} height={220} alt="" />
          <div style={{ display: "flex", fontFamily: "JetBrains", fontSize: 15, letterSpacing: "0.24em", color: "#8F999F", marginTop: 8 }}>
            0–100 KM/H · {formatDec(Math.min(...cars.map((c) => c.zeroToHundred)))}s
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
