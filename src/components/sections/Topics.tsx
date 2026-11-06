import { copy, site, topics } from "@/content/series";
import { mailto } from "@/lib/content";
import { Ph } from "@/components/ui/Text";

export function Topics() {
  const suggestHref = mailto(site.contactEmail, copy.topics.emailSubject);
  return (
    <section id="topics" aria-labelledby="topics-title" data-nav-theme="paper" className="panel panel-paper on-paper">
      <div className="wrap">
        <div className="grid-12 gap-y-8">
          <div className="col-span-12 lg:col-span-7">
            <p className="t-label eyebrow">{copy.topics.label}</p>
            <h2 id="topics-title" className="t-d1 balance mt-6" data-reveal="lines">
              <Ph value={copy.topics.title} />
            </h2>
          </div>
          <div className="col-span-12 flex flex-col justify-end gap-5 lg:col-span-4 lg:col-start-9">
            <p className="t-lead text-[color:var(--night-2)]" data-reveal="fade">
              <Ph value={copy.topics.intro} />
            </p>
          </div>
        </div>

        <ul className="topic-list mt-[clamp(3rem,7vw,6rem)]" aria-label={copy.topics.label}>
          {topics.map((t) => (
            <li key={t.question} className="topic grid-12 gap-y-3">
              <p className="t-label col-span-12 text-[color:var(--night-3)] md:col-span-3 lg:col-span-3 md:pt-[0.85em]" data-reveal="fade">
                <span className="topic-dot" aria-hidden="true" />
                {t.area}
              </p>
              <p className="t-d2 balance col-span-12 md:col-span-9 lg:col-span-8" data-reveal="lines">
                <Ph value={t.question} />
              </p>
            </li>
          ))}
        </ul>
        <p className="t-body mt-10 text-[color:var(--night-2)]">
          <Ph value={copy.topics.ask} />{" "}
          {suggestHref ? (
            <a href={suggestHref} className="link text-[color:var(--color-night)]">
              {copy.topics.suggest}
            </a>
          ) : (
            <>
              <Ph value={copy.topics.suggestAt} /> <Ph value={site.contactEmail} />
            </>
          )}
          .
        </p>
      </div>
    </section>
  );
}
