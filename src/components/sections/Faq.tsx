import { copy, faq, site } from "@/content/series";
import { Ph, withPlaceholders } from "@/components/ui/Text";

/** Email addresses in the answers are links, a shade darker than the text around them. */
const LINK = "text-[color:var(--color-night)]";

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" data-nav-theme="paper" className="panel panel-paper on-paper">
      <div className="wrap">
        <div className="grid-12 gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <p className="t-label eyebrow">{copy.faq.label}</p>
            <h2 id="faq-title" className="t-d1 mt-6" data-reveal="lines">
              {copy.faq.title}
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <ul className="faq-list" data-reveal="stagger">
              {faq.map((item, i) => (
                <li key={item.question}>
                  <details className="faq-item" name="faq" open={i === 0}>
                    <summary className="flex items-start justify-between gap-6 py-6 md:py-7">
                      <span className="t-d3">
                        <Ph value={item.question} linkEmails={false} />
                      </span>
                      <span className="faq-icon mt-1" aria-hidden="true" />
                    </summary>
                    <div className="pb-8 pr-12">
                      <p className="t-body max-w-[52ch] text-[color:var(--night-2)]">{withPlaceholders(item.answer, { linkClassName: LINK })}</p>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
            <p className="t-body mt-8 text-[color:var(--night-2)]">
              <Ph value={copy.faq.more} />{" "}
              <Ph value={copy.faq.writeTo} /> {withPlaceholders(site.contactEmail, { linkClassName: LINK })}
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
