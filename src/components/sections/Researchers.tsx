import { copy, site } from "@/content/series";
import { mailto } from "@/lib/content";
import { Label } from "@/components/ui/Label";
import { Ph } from "@/components/ui/Text";

export function Researchers() {
  const href = mailto(site.speakerEmail, copy.researchers.emailSubject);

  return (
    <section id="researchers" aria-labelledby="researchers-title" data-nav-theme="night" className="panel panel-dark">
      <div className="wrap">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 lg:col-span-6">
            <p className="t-label eyebrow">{copy.researchers.label}</p>
            <h2 id="researchers-title" className="t-hero mt-6" data-reveal="lines">
              {copy.researchers.title}
            </h2>
            <p className="t-lead mt-8 max-w-[34ch] text-[color:var(--paper-2)]" data-reveal="fade">
              {copy.researchers.pitch}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4" data-reveal="fade">
              {href ? (
                <a href={href} className="btn btn-amber magnetic" data-magnetic="0.3">
                  <span className="magnetic-inner">
                    <span>{copy.researchers.cta}</span>
                    <span className="arrow" aria-hidden="true">
                      ↗
                    </span>
                  </span>
                </a>
              ) : (
                <span className="btn btn-amber" title="Placeholder: add speakerEmail in src/content/series.ts">
                  <span>{copy.researchers.cta}</span>
                  <span aria-hidden="true">↗</span>
                </span>
              )}
              <p className="t-small text-[color:var(--paper-2)]">
                {copy.researchers.orWriteTo}{" "}
                {href ? (
                  <a href={href} className="link whitespace-nowrap">
                    {site.speakerEmail}
                  </a>
                ) : (
                  <Ph value={site.speakerEmail} />
                )}
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-9 lg:col-span-5 lg:col-start-8 lg:pt-3">
            <Label
              left={copy.researchers.termsLeft}
              right={copy.researchers.termsRight}
              rows={copy.researchers.terms.map((t) => ({ term: t.term, detail: t.detail }))}
              footer={copy.researchers.termsFooter}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
