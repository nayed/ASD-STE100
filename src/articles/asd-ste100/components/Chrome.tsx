import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/** shared entrance motion — machined, no bounce, off when reduced motion is set */
export function useReveal() {
  const rm = useReducedMotion();
  if (rm) return {};
  return {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.55, ease: "easeOut" as const },
  };
}

export function Section({
  id,
  code,
  title,
  children,
}: {
  id: string;
  code: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-ink/80">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-x-12 px-5 lg:grid-cols-[168px_minmax(0,1fr)] lg:px-10">
        <div className="pt-8 lg:sticky lg:top-[5.5rem] lg:h-max lg:pt-14">
          <div className="flex items-baseline gap-3 lg:block">
            <div className="font-mono text-[26px] font-medium leading-none text-hazard tnum">§{code}</div>
            <div className="micro mt-0 max-w-[150px] text-ash lg:mt-3">{title}</div>
          </div>
          <div className="mt-4 hidden h-24 w-px rail-rule lg:block" />
        </div>
        <div className="py-8 lg:py-14">{children}</div>
      </div>
    </section>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="micro text-hazard">{children}</p>;
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-3 max-w-[20ch] text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-[0.95] tracking-[-0.03em]">
      {children}
    </h2>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 max-w-[62ch] font-serif text-[clamp(1.1rem,1.7vw,1.35rem)] leading-[1.55] text-ink/85">
      {children}
    </p>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 max-w-[68ch] text-[16.5px] leading-[1.65] text-ink/90">{children}</p>;
}

/** the standard's own example format: ordinary prose against STE */
export function Example({ non, ste }: { non: string; ste: string }) {
  return (
    <figure className="my-7 border border-ink/25 bg-paper2/70">
      <div className="flex items-center justify-between border-b border-ink/15 px-4 py-2">
        <span className="micro text-hazard">✗ Not allowed</span>
        <span className="micro text-ash">Non-STE</span>
      </div>
      <p className="px-4 py-4 font-serif text-[17px] italic leading-[1.5] text-ash line-through decoration-hazard decoration-[1.5px]">
        {non}
      </p>
      <div className="flex items-center justify-between border-t border-ink/15 px-4 py-2">
        <span className="micro text-blueprint">✓ Allowed</span>
        <span className="micro text-ash">STE</span>
      </div>
      <div className="flex gap-3 px-4 py-4">
        <span aria-hidden className="mt-[3px] block h-3.5 w-3.5 shrink-0 border border-blueprint bg-blueprint/15" />
        <p className="text-[16.5px] font-semibold leading-[1.5]">{ste}</p>
      </div>
    </figure>
  );
}

export function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 border-t border-hair pt-2 font-mono text-[11px] leading-[1.6] text-ash">{children}</p>
  );
}

/** a rule clause: number in the margin, statement in the text column */
export function Clause({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="mt-9 grid grid-cols-[52px_minmax(0,1fr)] gap-x-4 border-t border-hair pt-4">
      <div className="font-mono text-[12px] leading-[1.6] text-hazard tnum">{n}</div>
      <div className="text-[16.5px] leading-[1.6]">{children}</div>
    </div>
  );
}
