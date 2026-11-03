"use client";

import { Counter } from "@/components/motion/counter";
import { HeadlightReveal } from "@/components/motion/headlight-reveal";
import { Reveal, SplitReveal } from "@/components/motion/split-reveal";
import { RoomFrame } from "@/components/showroom/room-frame";
import { useRoom } from "@/components/showroom/showroom-context";
import { DEMO_MODE } from "@/data/config";
import { manifestoCopy } from "@/data/content";
import { quotes } from "@/data/quotes";

export function Manifesto() {
  const { active, mounted } = useRoom();

  return (
    <RoomFrame className="flex flex-col gap-14">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px] lg:max-h-[62vh] lg:w-auto">
            {mounted ? (
              <HeadlightReveal
                src="/cars/atmosfera/farol.jpg"
                alt="Farol de um coupé escuro aceso no breu"
                sizes="(max-width: 1023px) 90vw, 36vw"
                trigger={active}
                eager
                angle={120}
                className="absolute inset-0"
                imgClassName="object-[72%_50%]"
              />
            ) : null}
            <span aria-hidden className="absolute inset-0 border border-line" />
            <span className="t-mono absolute -bottom-6 left-0 text-[9px] text-text-muted">Detalhe · farol</span>
          </div>
        </div>

        <div className="lg:col-span-7 lg:pl-6">
          <Reveal i={0}>
            <p className="t-mono text-accent">05 · Manifesto</p>
          </Reveal>
          <SplitReveal id="manifesto-title" lines={manifestoCopy.title} italic={[1]} className="t-room mt-4" />
          <Reveal i={3}>
            <p className="mt-8 max-w-[52ch] text-[clamp(16px,1.25vw,19px)] leading-relaxed text-text/85">{manifestoCopy.body}</p>
          </Reveal>
          <Reveal i={4}>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
              {manifestoCopy.stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse border-t border-line pt-4">
                  <dt className="t-mono mt-3 text-[10px] text-text-muted">
                    {s.label}
                    {DEMO_MODE && s.demo ? <span className="block text-[9px] opacity-70">· ilustrativo</span> : null}
                  </dt>
                  <dd className="t-num text-[clamp(32px,3vw,46px)] leading-none text-text">
                    {s.prefix}
                    <Counter value={s.value} countUpWhen={active} duration={1.6} />
                    {s.suffix}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      <Reveal i={6}>
        <figure className="border-y border-line py-12 text-center md:py-16">
          <blockquote className="t-display mx-auto max-w-[22ch] text-[clamp(32px,4.4vw,72px)] leading-[1.02] italic">
            “{quotes.manifesto.text}”
          </blockquote>
          <figcaption className="t-mono mt-6 text-[10px] text-text-muted">— {quotes.manifesto.attribution}</figcaption>
        </figure>
      </Reveal>

      <Reveal i={7}>
        <ol className="flex flex-col gap-4 md:flex-row md:items-center md:gap-0" aria-label="Linha do tempo">
          {manifestoCopy.timeline.map((item, i) => (
            <li key={item} className="flex items-center gap-4 md:flex-1">
              <span className="h-2 w-2 shrink-0 border border-accent" aria-hidden />
              <span className="t-mono text-[10px] whitespace-nowrap text-text">{item}</span>
              {i < manifestoCopy.timeline.length - 1 ? (
                <span aria-hidden className="hidden h-px flex-1 bg-line-strong md:mx-4 md:block" />
              ) : null}
            </li>
          ))}
        </ol>
      </Reveal>
    </RoomFrame>
  );
}
