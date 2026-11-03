"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Check, MessageCircle } from "lucide-react";
import { useId, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Reveal, SplitReveal } from "@/components/motion/split-reveal";
import { RoomFrame } from "@/components/showroom/room-frame";
import { useRoom, useShowroom } from "@/components/showroom/showroom-context";
import { ShinyButton } from "@/components/ui/shiny-button";
import Velaris from "@/components/ui/velaris";
import { carName, cars, getCar } from "@/data/cars";
import { contact, DEMO_MODE, demoNotice, site } from "@/data/config";
import { conciergeCopy } from "@/data/content";
import { rooms } from "@/data/rooms";
import { formatBRL } from "@/lib/format";
import { useHydrated, useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const CONCIERGE_COLORS = ["#8F999F", "#2A2F33", "#111418", "#C8B78B"];

/** Máscara de WhatsApp BR: (11) 98765-4321 / (11) 3456-7890 */
export function maskPhoneBR(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

type Fields = {
  nome: string;
  whatsapp: string;
  email: string;
  interesse: string;
  modelo: string;
  data: string;
  mensagem: string;
  consent: boolean;
};
type Errors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields, today: string): Errors {
  const e: Errors = {};
  if (f.nome.trim().length < 2) e.nome = "Informe seu nome.";
  if (f.whatsapp.replace(/\D/g, "").length < 10) e.whatsapp = "WhatsApp com DDD, 10 ou 11 dígitos.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "E-mail inválido.";
  if (!f.interesse) e.interesse = "Escolha um interesse.";
  if (f.data && today && f.data < today) e.data = "Escolha uma data a partir de hoje.";
  if (!f.consent) e.consent = "Necessário para que possamos retornar o contato.";
  return e;
}

function Field({
  id,
  label,
  error,
  children,
  optional,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="t-mono text-[10px] text-text-muted">
        {label}
        {optional ? <span className="ml-2 normal-case opacity-70">(opcional)</span> : null}
      </label>
      {children}
      <p id={`${id}-err`} className="min-h-4 text-[12px] text-[#E0907F]" aria-live="polite">
        {error ?? ""}
      </p>
    </div>
  );
}

const inputCls =
  "min-h-11 w-full border-0 border-b border-line-strong bg-transparent px-0 py-2 text-[16px] text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-accent focus-visible:outline-none aria-[invalid=true]:border-[#E0907F]";

export function Concierge() {
  const { current, active } = useRoom();
  const { atelierSummary, setAtelierSummary, selectedCar, go } = useShowroom();
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  const uid = useId();
  const today = hydrated ? new Date().toISOString().slice(0, 10) : "";

  const [f, setF] = useState<Fields>({
    nome: "",
    whatsapp: "",
    email: "",
    interesse: "",
    modelo: "",
    data: "",
    mensagem: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const interesse = f.interesse || (atelierSummary ? "Ateliê" : "");
  const modelo = f.modelo || selectedCar;
  const set = <K extends keyof Fields>(k: K, v: Fields[K]) => {
    setF((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...f, interesse, modelo };
    const errs = validate(data, today);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    // TODO(integração): enviar `data` + `atelierSummary` para o CRM/e-mail/WhatsApp Business do showroom.
    // Hoje o envio é apenas ilustrativo: nenhum dado sai do navegador.
    setSent(true);
  };

  const id = (k: keyof Fields) => `${uid}-${k}`;
  const err = (k: keyof Fields) => ({
    id: id(k),
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": `${id(k)}-err`,
  });

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0" aria-hidden>
        {current ? <Velaris bg="#080808" colors={CONCIERGE_COLORS} speed={0.5} grain={0.35} active={active} /> : null}
        <div className="absolute inset-0 bg-bg/60" />
      </div>

      <RoomFrame className="flex flex-col gap-12">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Coluna principal */}
          <div className="lg:col-span-7">
            <Reveal i={0}>
              <p className="t-mono text-accent">06 · Concierge</p>
            </Reveal>
            <SplitReveal id="concierge-title" lines={conciergeCopy.titleLines} italic={[1]} className="t-room mt-4" />
            <Reveal i={3}>
              <p className="t-body mt-5">{conciergeCopy.intro}</p>
            </Reveal>

            {atelierSummary ? (
              <Reveal i={4}>
                <div className="corners relative mt-8 border border-line bg-surface/70 p-5">
                  <span className="corners-b" aria-hidden />
                  <div className="flex items-center justify-between gap-3">
                    <p className="t-mono text-[10px] text-accent">Configuração do Ateliê</p>
                    <button
                      type="button"
                      onClick={() => setAtelierSummary(null)}
                      className="t-mono min-h-11 text-[9px] text-text-muted hover:text-text"
                    >
                      Remover
                    </button>
                  </div>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {atelierSummary.lines.map((l) => (
                      <li key={l} className="font-mono text-[12px] tracking-[0.06em] text-text">
                        {l}
                      </li>
                    ))}
                  </ul>
                  <p className="t-num mt-3 border-t border-line pt-3 text-[18px] text-accent">
                    Total estimado {formatBRL(atelierSummary.total)}
                  </p>
                </div>
              </Reveal>
            ) : null}

            <Reveal i={5}>
              <AnimatePresence mode="wait" initial={false}>
                {sent ? (
                  <motion.div
                    key="ok"
                    className="mt-10 flex items-start gap-4 border-t border-line pt-8"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduced ? 0 : 0.6 }}
                    role="status"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent text-accent">
                      <Check className="h-5 w-5" aria-hidden strokeWidth={1.8} />
                    </span>
                    <div>
                      <p className="t-display flex items-center gap-3 text-[clamp(24px,2.4vw,34px)]">
                        {conciergeCopy.success}
                        <span className="live-dot" aria-hidden />
                      </p>
                      <p className="t-mono mt-3 text-[9px] text-text-muted">
                        Envio ilustrativo nesta versão: nenhum dado foi transmitido.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    noValidate
                    onSubmit={onSubmit}
                    className="mt-10 grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2"
                    exit={{ opacity: 0, height: 0, transition: { duration: reduced ? 0 : 0.45 } }}
                    aria-label="Solicitar visita privada"
                  >
                    <Field id={id("nome")} label="Nome" error={errors.nome}>
                      <input
                        {...err("nome")}
                        autoComplete="name"
                        value={f.nome}
                        onChange={(e) => set("nome", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field id={id("whatsapp")} label="WhatsApp" error={errors.whatsapp}>
                      <input
                        {...err("whatsapp")}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        placeholder="(11) 98765-4321"
                        value={f.whatsapp}
                        onChange={(e) => set("whatsapp", maskPhoneBR(e.target.value))}
                        className={inputCls}
                      />
                    </Field>
                    <Field id={id("email")} label="E-mail" error={errors.email}>
                      <input
                        {...err("email")}
                        type="email"
                        autoComplete="email"
                        value={f.email}
                        onChange={(e) => set("email", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field id={id("interesse")} label="Interesse" error={errors.interesse}>
                      <select
                        {...err("interesse")}
                        value={interesse}
                        onChange={(e) => set("interesse", e.target.value)}
                        className={cn(inputCls, !interesse && "text-text-muted")}
                      >
                        <option value="" className="bg-surface">
                          Selecione
                        </option>
                        {conciergeCopy.interests.map((i) => (
                          <option key={i} value={i} className="bg-surface text-text">
                            {i}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {interesse === "Modelo da coleção" ? (
                      <Field id={id("modelo")} label="Modelo">
                        <select
                          {...err("modelo")}
                          value={modelo}
                          onChange={(e) => set("modelo", e.target.value)}
                          className={inputCls}
                        >
                          {cars.map((c) => (
                            <option key={c.slug} value={c.slug} className="bg-surface text-text">
                              {carName(c)}
                            </option>
                          ))}
                        </select>
                      </Field>
                    ) : null}
                    <Field id={id("data")} label="Data preferida" error={errors.data} optional>
                      <input
                        {...err("data")}
                        type="date"
                        min={today || undefined}
                        value={f.data}
                        onChange={(e) => set("data", e.target.value)}
                        className={cn(inputCls, "[color-scheme:dark]")}
                      />
                    </Field>
                    <div className="md:col-span-2">
                      <Field id={id("mensagem")} label="Mensagem" optional>
                        <textarea
                          {...err("mensagem")}
                          rows={3}
                          value={f.mensagem}
                          onChange={(e) => set("mensagem", e.target.value)}
                          placeholder={
                            interesse === "Modelo da coleção" ? `Sobre o ${carName(getCar(modelo))}…` : "Conte o que procura."
                          }
                          className={cn(inputCls, "resize-none")}
                        />
                      </Field>
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[13px] leading-snug text-text-muted">
                        <input
                          {...err("consent")}
                          type="checkbox"
                          checked={f.consent}
                          onChange={(e) => set("consent", e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-[#C8B78B]"
                        />
                        <span>
                          {conciergeCopy.consent}{" "}
                          <span className="text-text-muted/80">[Política de privacidade a definir]</span>
                        </span>
                      </label>
                      <p id={`${id("consent")}-err`} className="min-h-4 text-[12px] text-[#E0907F]" aria-live="polite">
                        {errors.consent ?? ""}
                      </p>
                    </div>
                    <div className="mt-2 md:col-span-2">
                      <ShinyButton type="submit" size="lg" cursor="ENVIAR">
                        {conciergeCopy.submit}
                      </ShinyButton>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </Reveal>
          </div>

          {/* Lateral */}
          <aside className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9 lg:pt-16" aria-label="Atendimento">
            <Reveal i={4}>
              <div className="relative aspect-[3/2] overflow-hidden border border-line">
                {current ? (
                  <Image
                    src="/cars/atmosfera/garagem.jpg"
                    alt="Garagem privada em concreto claro com um esportivo escuro"
                    fill
                    sizes="(max-width: 1023px) 90vw, 30vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
            </Reveal>
            <Reveal i={5}>
              <dl className="grid gap-5">
                <div>
                  <dt className="t-mono text-[10px] text-text-muted">Atendimento</dt>
                  {contact.hours.map((h) => (
                    <dd key={h} className="mt-1 text-[15px] text-text">
                      {h}
                    </dd>
                  ))}
                </div>
                <div>
                  <dt className="t-mono text-[10px] text-text-muted">Showroom</dt>
                  <dd className="mt-1 text-[15px] text-text">{contact.address}</dd>
                  <dd className="text-[15px] text-text">{contact.city}</dd>
                </div>
                <div>
                  <dt className="t-mono text-[10px] text-text-muted">E-mail</dt>
                  <dd className="mt-1 text-[15px] text-text">{contact.email}</dd>
                </div>
              </dl>
            </Reveal>
            <Reveal i={6}>
              {/* TODO(publicar): número real; com ele, vira link https://wa.me/<número>. */}
              <button
                type="button"
                aria-disabled="true"
                title="Número a definir"
                className="flex min-h-12 w-full items-center justify-between gap-3 border border-line-strong px-4 text-left text-text-muted"
              >
                <span className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 text-accent" aria-hidden strokeWidth={1.6} />
                  <span className="text-[14px] text-text">WhatsApp</span>
                </span>
                <span className="font-mono text-[11px] tracking-[0.1em]">{contact.whatsappDisplay}</span>
              </button>
            </Reveal>
          </aside>
        </div>

        {/* Rodapé do site (só nesta sala) */}
        <footer className="mt-auto flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <Logo size={15} />
            <p className="t-mono text-[9px] text-text-muted">© {site.year} Spike Motors</p>
            {DEMO_MODE ? <p className="font-mono text-[10px] tracking-[0.08em] text-text-muted">{demoNotice}</p> : null}
          </div>
          <nav aria-label="Salas (rodapé)">
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {rooms.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => go(r.id)}
                    className="t-mono min-h-11 text-[10px] text-text-muted transition-colors hover:text-text"
                  >
                    {r.num} {r.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </footer>
      </RoomFrame>
    </div>
  );
}
