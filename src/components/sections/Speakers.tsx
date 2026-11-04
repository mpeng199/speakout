import Image from "next/image";
import { copy } from "@/content/series";
import { confirmedSpeakers } from "@/lib/content";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Speakers() {
  const list = confirmedSpeakers();

  return (
    <section id="speakers" aria-labelledby="speakers-title" data-nav-theme="paper" className="panel panel-paper on-paper">
      <div className="wrap">
        <h2 id="speakers-title" className="t-label eyebrow">
          {copy.speakers.title}
        </h2>

        {list.length === 0 ? (
          <div className="grid-12 mt-[clamp(2.5rem,6vw,5rem)] gap-y-8">
            <p className="t-hero col-span-12 lg:col-span-11" data-reveal="lines">
              {copy.speakers.empty}
            </p>
            <div className="col-span-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:col-span-11">
              <p className="t-lead max-w-[36ch] text-[color:var(--night-2)]" data-reveal="fade">
                {copy.speakers.emptyNote}
              </p>
              <a href="#researchers" className="t-label link self-start sm:self-auto">
                Are you a researcher? Give a talk →
              </a>
            </div>
          </div>
        ) : (
          <ul className="mt-[clamp(2.5rem,6vw,5rem)] grid gap-[var(--gutter)] sm:grid-cols-2 lg:grid-cols-3" data-reveal="stagger">
            {list.map((s) => (
              <li key={s.id} className="speaker">
                <div className="speaker-portrait" aria-hidden={s.photo ? undefined : true}>
                  {s.photo ? (
                    <Image src={s.photo} alt={`Portrait of ${s.name}`} fill sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 90vw" className="object-cover" />
                  ) : (
                    <span className="t-d1">{initials(s.name)}</span>
                  )}
                </div>
                <h3 className="t-d3 mt-5">{s.name}</h3>
                <p className="t-small mt-1 text-[color:var(--night-2)]">
                  {s.role}, {s.affiliation}
                </p>
                <p className="t-small mt-4">{s.bio}</p>
                {s.links?.length ? (
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {s.links.map((l) => (
                      <li key={l.url}>
                        <a href={l.url} className="t-label link" target="_blank" rel="noopener noreferrer">
                          {l.label} ↗<span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
