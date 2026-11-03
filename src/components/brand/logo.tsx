import { cn } from "@/lib/utils";

/** Wordmark "Spike." + MOTORS. Escala contida: o nome do site, não a assinatura da agência. */
export function Logo({
  variant = "full",
  className,
  size = 22,
}: {
  variant?: "full" | "compact" | "mark";
  className?: string;
  /** Altura de referência do wordmark em px. */
  size?: number;
}) {
  const dot = (
    <span
      aria-hidden
      className="inline-block bg-signal"
      style={{ width: size * 0.2, height: size * 0.2, marginLeft: size * 0.06, marginBottom: size * 0.1 }}
    />
  );

  const word = (text: string) => (
    <span
      className="inline-flex items-end leading-none text-text"
      style={{ fontFamily: "var(--font-logo)", fontWeight: 800, letterSpacing: "-0.03em", fontSize: size }}
    >
      {text}
      {dot}
    </span>
  );

  if (variant === "mark") {
    return (
      <span className={cn("inline-flex", className)} role="img" aria-label="Spike Motors">
        {word("S")}
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span className={cn("inline-flex", className)} role="img" aria-label="Spike Motors">
        {word("Spike")}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex w-max flex-col items-stretch", className)} role="img" aria-label="Spike Motors">
      {word("Spike")}
      <span
        aria-hidden
        className="mt-[0.35em] flex justify-between font-mono font-medium text-accent uppercase"
        style={{ fontSize: Math.max(7, size * 0.34), lineHeight: 1 }}
      >
        {"MOTORS".split("").map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </span>
    </span>
  );
}
