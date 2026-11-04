import { copy, faq, site } from "@/content/series";
import { isPlaceholder, stripBrackets } from "@/lib/content";

const EMAIL = /^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/;

/**
 * Turns placeholder tokens inside a sentence, like [hello@…], into dashed-underline spans,
 * and real email addresses into links that never break across lines.
 */
function withPlaceholders(text: string) {
  const parts = text.split(/(\[[^\]]+\]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g);
  return parts.map((part, i) =>
    isPlaceholder(part) ? (
      <span key={i} className="ph" title="Placeholder: edit src/content/series.ts">
        {stripBrackets(part)}
      </span>
    ) : EMAIL.test(part) ? (
      <a key={i} href={`mailto:${part}`} className="link whitespace-nowrap text-[color:var(--color-night)]">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

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
                      <span className="t-d3">{item.question}</span>
                      <span className="faq-icon mt-1" aria-hidden="true" />
                    </summary>
                    <div className="pb-8 pr-12">
                      <p className="t-body max-w-[52ch] text-[color:var(--night-2)]">{withPlaceholders(item.answer)}</p>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
            <p className="t-body mt-8 text-[color:var(--night-2)]">
              Something else?{" "}
              Write to {withPlaceholders(site.contactEmail)}
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
