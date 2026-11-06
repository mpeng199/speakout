import { Fragment, type ReactNode } from "react";
import { isPlaceholder, stripBrackets } from "@/lib/content";

/** A [placeholder] token, or a real email address, anywhere in a line. */
const TOKEN = /(\[[^\]]+\]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;
const EMAIL = /^[\w.+-]+@[\w-]+(?:\.[\w-]+)+$/;

type Options = {
  /** Extra classes for the email links, e.g. a text colour. */
  linkClassName?: string;
  /** false inside a link or button: an email address there stays text, as links can't nest. */
  linkEmails?: boolean;
};

/**
 * Splits a line from the content file for display: each [placeholder] gets a dashed underline (the
 * token only, so one inside a sentence stands out from the words around it), and real email
 * addresses become links that never break across lines.
 */
export function withPlaceholders(text: string, { linkClassName, linkEmails = true }: Options = {}): ReactNode {
  const parts = text.split(TOKEN).filter(Boolean);
  // Most lines have neither: hand them back as they are, so the page carries plain text.
  if (!parts.some((part) => isPlaceholder(part) || (linkEmails && EMAIL.test(part)))) return text;
  return parts.map((part, i) =>
    isPlaceholder(part) ? (
      <span key={i} className="ph" title="Placeholder: edit src/content/series.ts">
        {stripBrackets(part)}
      </span>
    ) : linkEmails && EMAIL.test(part) ? (
      <a key={i} href={`mailto:${part}`} className={linkClassName ? `link whitespace-nowrap ${linkClassName}` : "link whitespace-nowrap"}>
        {part}
      </a>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/**
 * Renders a value from the content file. Placeholders get a dashed underline so they stand out,
 * whether the whole value is one ("[Month Year]") or it sits inside a sentence.
 */
export function Ph({ value, ...options }: { value: string } & Options) {
  return withPlaceholders(value, options);
}
