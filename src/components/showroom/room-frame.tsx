import { cn } from "@/lib/utils";

/**
 * Contêiner padrão de uma sala: ocupa 100dvh, rola internamente quando o conteúdo
 * excede a tela (a navegação por roda/swipe só troca de sala no limite).
 */
export function RoomFrame({
  children,
  className,
  background,
  scroll = true,
}: {
  children: React.ReactNode;
  className?: string;
  background?: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <div className="absolute inset-0">
      {background ? <div className="absolute inset-0">{background}</div> : null}
      <div
        data-room-scroll={scroll ? "" : undefined}
        className={cn("absolute inset-0 overscroll-contain", scroll ? "overflow-y-auto" : "overflow-hidden")}
        style={{
          // o conteúdo some sob o header (que não tem fundo) ao rolar
          maskImage: "linear-gradient(180deg, transparent 0, #000 76px)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0, #000 76px)",
        }}
      >
        <div
          className={cn(
            "relative min-h-full px-[var(--gutter)] pt-[84px] pb-[128px] lg:pr-[var(--gutter)] lg:pl-[max(var(--gutter),210px)]",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
