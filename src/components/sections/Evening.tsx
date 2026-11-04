import { copy } from "@/content/series";
import { AmberField } from "@/components/visuals/AmberField";

export function Evening() {
  const steps = copy.evening.steps;
  const total = String(steps.length).padStart(2, "0");

  return (
    <section id="format" aria-labelledby="format-title" data-evening data-nav-theme="night" className="panel panel-dark evening">
      <div data-evening-stage className="evening-stage">
        <div className="evening-light" aria-hidden="true">
          <AmberField variant="evening" id="evening" />
          <div className="evening-shade" />
        </div>

        <div className="wrap evening-inner">
          <div className="evening-head">
            <h2 id="format-title" className="t-label eyebrow">
              {copy.evening.label}
            </h2>
            <p className="t-label tabular evening-counter" aria-hidden="true">
              <span data-step-counter>01</span> / {total}
            </p>
          </div>

          <ol className="evening-steps" aria-label="The three parts of an evening">
            {steps.map((s, i) => (
              <li key={s.title} data-step className="evening-step">
                <p className="t-label tabular text-[color:var(--color-amber)]" data-step-line>
                  {String(i + 1).padStart(2, "0")} / {total}
                </p>
                <h3 className="t-d1 mt-5" data-step-line>
                  {s.title}
                </h3>
                <p className="t-lead mt-6 max-w-[34ch] text-[color:var(--paper-2)]" data-step-line>
                  {s.text}
                </p>
                <ul className="mt-8 flex flex-wrap gap-2" data-step-line aria-label="Details">
                  {s.facts.map((f) => (
                    <li key={f} className="fact t-label">
                      {f}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <ol className="evening-progress" aria-hidden="true">
            {steps.map((s, i) => (
              <li key={s.title} data-progress-item className={i === 0 ? "is-active" : undefined}>
                <span className="t-label tabular">
                  {String(i + 1).padStart(2, "0")}
                  <span className="evening-progress-title"> {s.title}</span>
                </span>
                <span className="evening-track">
                  <span data-progress-bar />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
