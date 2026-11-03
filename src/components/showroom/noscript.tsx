import { contact, site } from "@/data/config";
import { quotes } from "@/data/quotes";

/** Sem JavaScript: todas as salas ficam empilhadas e legíveis, sem Ignição. */
export function NoScriptFallback() {
  const css = `
    html, body { overflow: auto !important; height: auto !important; }
    .ignition-root { display: none !important; }
    .room-stack { position: static !important; content-visibility: visible !important; }
    .room { position: relative !important; visibility: visible !important; content-visibility: visible !important; opacity: 1 !important; transform: none !important; min-height: 100dvh; }
    .room [style*="opacity"] { opacity: 1 !important; transform: none !important; }
  `;
  return (
    <noscript>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div style={{ padding: "16px 24px", fontFamily: "monospace", fontSize: 12, borderTop: "1px solid rgba(243,239,230,0.16)" }}>
        {site.title}. {quotes.salao.text} — {quotes.salao.attribution}. Contato: {contact.city}, {contact.address}.
        Ative o JavaScript para a experiência completa do showroom.
      </div>
    </noscript>
  );
}
