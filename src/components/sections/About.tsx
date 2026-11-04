import { copy, site } from "@/content/series";
import { Ph } from "@/components/ui/Text";

/* Statements step across the grid; the labels stay in the left rail like margin notes. */
const textCols = ["lg:col-start-3 lg:col-span-9", "lg:col-start-4 lg:col-span-9", "lg:col-start-3 lg:col-span-8"];

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" data-nav-theme="paper" className="panel panel-paper on-paper">
      <div className="wrap">
        <h2 id="about-title" className="t-label eyebrow">
          {copy.about.label}
        </h2>
        <div className="mt-[clamp(3rem,7vw,6rem)] flex flex-col gap-[clamp(4rem,9vw,8.5rem)]">
          {copy.about.statements.map((s, i) => (
            <div key={s.label} className="grid-12 gap-y-4">
              <p className="t-label col-span-12 text-[color:var(--night-3)] lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:pt-[1.1em]" data-reveal="fade">
                {s.label}
              </p>
              <p className={`t-d1 balance col-span-12 lg:row-start-1 ${textCols[i] ?? textCols[0]}`} data-reveal="lines">
                {s.text}
              </p>
            </div>
          ))}
        </div>
        <div className="grid-12 mt-[clamp(4rem,8vw,7rem)] gap-y-4 border-t border-[color:var(--night-line)] pt-6">
          <p className="t-label col-span-12 text-[color:var(--night-3)] lg:col-span-2">Run by</p>
          <p className="t-lead col-span-12 lg:col-span-6 lg:col-start-3" data-reveal="fade">
            <Ph value={site.organizer.name} />
            {site.organizer.bio.trim() ? (
              <>
                , <Ph value={site.organizer.bio} />
              </>
            ) : null}
          </p>
        </div>
      </div>
    </section>
  );
}
