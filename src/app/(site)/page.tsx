import { Logo } from "@/components/brand/logo";
import { ShinyButton } from "@/components/ui/shiny-button";

export default function Page() {
  return (
    <main id="conteudo" className="grid h-dvh place-items-center gap-8">
      <Logo size={40} />
      <h1 className="t-display t-hero">
        Exceção, <em>por definição.</em>
      </h1>
      <ShinyButton>Entrar na coleção</ShinyButton>
    </main>
  );
}
