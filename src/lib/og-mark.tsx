/** Favicon: quadrado arredondado #080808, borda champagne 35%, "S" e ponto quadrado signal. */
export function SpikeMarkIcon({ px }: { px: number }) {
  const u = px / 512;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#080808",
        borderRadius: 112 * u,
        border: `${Math.max(2, 10 * u)}px solid rgba(200,183,139,0.35)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        <span
          style={{
            fontFamily: "Epilogue",
            fontWeight: 800,
            fontSize: 330 * u,
            letterSpacing: "-0.03em",
            color: "#F3EFE6",
            lineHeight: 1,
          }}
        >
          S
        </span>
        <span
          style={{
            width: 62 * u,
            height: 62 * u,
            background: "#D7FF3F",
            marginLeft: 14 * u,
            marginBottom: 46 * u,
          }}
        />
      </div>
    </div>
  );
}
