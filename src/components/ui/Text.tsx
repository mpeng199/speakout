import { isPlaceholder, stripBrackets } from "@/lib/content";

/** Renders a content value. Placeholders get a dashed underline so they stand out. */
export function Ph({ value }: { value: string }) {
  if (isPlaceholder(value)) {
    return (
      <span className="ph" title="Placeholder: edit src/content/series.ts">
        {stripBrackets(value)}
      </span>
    );
  }
  return <>{value}</>;
}
