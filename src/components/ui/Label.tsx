import type { CSSProperties, ReactNode } from "react";

export type LabelRow = { term: string; detail: ReactNode };

/**
 * The label system, after the printed label on a prescription bottle:
 * a header strip, a title, then term/detail rows with tabular figures.
 *
 * reveal="scroll" prints the rows in when the label scrolls into view;
 * reveal="intro" prints them on page load with CSS (used in the hero).
 */
export function Label({
  left,
  right,
  title,
  titleAs: TitleTag = "p",
  rows,
  footer,
  className = "",
  reveal = "scroll",
  children,
}: {
  left: ReactNode;
  right?: ReactNode;
  title?: ReactNode;
  titleAs?: "p" | "h2" | "h3";
  rows: LabelRow[];
  footer?: ReactNode;
  className?: string;
  reveal?: "scroll" | "intro" | "none";
  children?: ReactNode;
}) {
  let n = 0;
  const p = (): { "data-print": true; className?: string; style?: CSSProperties } =>
    reveal === "intro"
      ? { "data-print": true, className: "intro-print", style: { "--d": 70 * n++ } as CSSProperties }
      : { "data-print": true };
  const cx = (...c: (string | undefined)[]) => c.filter(Boolean).join(" ");

  const head = p();
  const titleProps = p();
  const rowProps = rows.map(() => p());
  const footProps = p();

  return (
    <div className={cx("label-card", className)} data-reveal={reveal === "scroll" ? "print" : undefined}>
      <div {...head} className={cx("flex items-center justify-between gap-4 t-label text-[color:var(--night-3)]", head.className)}>
        <span>{left}</span>
        {right ? <span className="tabular">{right}</span> : null}
      </div>
      {title ? (
        <TitleTag {...titleProps} className={cx("t-d3 mt-2 mb-4", titleProps.className)}>
          {title}
        </TitleTag>
      ) : (
        <div className="h-3" />
      )}
      <dl className="m-0">
        {rows.map((r, i) => (
          <div {...rowProps[i]} className={cx("label-row", rowProps[i].className)} key={r.term}>
            <dt className="t-label">{r.term}</dt>
            <dd>{r.detail}</dd>
          </div>
        ))}
      </dl>
      {footer ? (
        <div {...footProps} className={cx("t-small mt-3 text-[color:var(--night-2)]", footProps.className)}>
          {footer}
        </div>
      ) : null}
      {children}
    </div>
  );
}
