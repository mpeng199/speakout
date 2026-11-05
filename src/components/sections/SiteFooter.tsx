import { copy, site } from "@/content/series";
import { isPlaceholder, isSet, mailto } from "@/lib/content";
import { SignupForm } from "@/components/SignupForm";
import { FinaleLight } from "@/components/visuals/FinaleLight";
import { Ph } from "@/components/ui/Text";

export function SiteFooter() {
  const formId = isSet(site.signup.formspreeFormId) ? site.signup.formspreeFormId : null;
  const contactHref = mailto(site.contactEmail);
  const social = site.social.filter((s) => s.url.trim() !== "");

  return (
    <footer id="signup" aria-labelledby="signup-title" data-nav-theme="night" className="panel panel-dark site-footer">
      <div className="finale">
        <FinaleLight />
        <div className="wrap">
        <div className="grid-12 gap-y-10">
          <div className="col-span-12 lg:col-span-6">
            <p className="t-label eyebrow">Mailing list</p>
            <h2 id="signup-title" className="t-hero balance mt-6" data-reveal="lines">
              {copy.signup.title}
            </h2>
            <p className="t-lead mt-6 max-w-[30ch] text-[color:var(--paper-2)]" data-reveal="fade">
              {copy.signup.intro}
            </p>
          </div>
          <div className="col-span-12 flex flex-col justify-end lg:col-span-5 lg:col-start-8">
            <SignupForm
              formId={formId}
              privacyLine={site.signup.privacyLine}
              button={copy.signup.button}
              success={copy.signup.success}
              successNote={copy.signup.successNote}
            />
          </div>
        </div>
        </div>
      </div>

      <div className="wrap">
        <div className="grid-12 mt-[clamp(4.5rem,10vw,9rem)] gap-y-10 border-t border-[color:var(--paper-line)] pt-10">
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <h3 className="t-label text-[color:var(--paper-3)]">Contact</h3>
            <p className="t-body mt-3">
              {contactHref ? (
                <a href={contactHref} className="link">
                  {site.contactEmail}
                </a>
              ) : (
                <Ph value={site.contactEmail} />
              )}
            </p>
          </div>
          {social.length ? (
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <h3 className="t-label text-[color:var(--paper-3)]">Follow</h3>
            <ul className="t-body mt-3 grid gap-1.5">
              {social.map((s) => (
                <li key={s.label}>
                  {isPlaceholder(s.url) ? (
                    <span className="ph" title={`Placeholder: add the ${s.label} link in src/content/series.ts`}>
                      {s.label}
                    </span>
                  ) : (
                    <a href={s.url} className="link" target="_blank" rel="noopener noreferrer">
                      {s.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          ) : null}
          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <h3 className="t-label text-[color:var(--paper-3)]">Run by</h3>
            <p className="t-body mt-3">
              <Ph value={site.organizer.name} />
              {site.organizer.bio.trim() ? (
                <>
                  , <Ph value={site.organizer.bio} />
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="footer-mark mt-[clamp(4rem,9vw,8rem)]" aria-hidden="true">
          <span data-fit data-reveal="chars">
            {site.name}
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-[color:var(--paper-line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="t-small text-[color:var(--paper-3)]">
            © {site.name}. Free evening talks on medicine in {site.city}.
            <span className="block sm:inline sm:before:content-['_·_']">Set in Mona Sans and Source Serif 4. The light is drawn live in your browser.</span>
          </p>
          <a href="#top" className="t-label link-draw self-start text-[color:var(--paper-2)] sm:self-auto">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
