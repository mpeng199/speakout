// Lists every [placeholder] still in the content file: npm run placeholders
import { readFileSync } from "node:fs";

const file = new URL("../src/content/series.ts", import.meta.url);
const lines = readFileSync(file, "utf8").split("\n");
const found = [];
lines.forEach((line, i) => {
  const trimmed = line.trim();
  if (trimmed.startsWith("*") || trimmed.startsWith("//") || trimmed.startsWith("/*")) return;
  for (const m of line.matchAll(/"\[([^\]]+)\]"/g)) found.push({ line: i + 1, value: m[1], text: trimmed });
});
if (!found.length) {
  console.log("No placeholders left in src/content/series.ts");
} else {
  console.log(`${found.length} placeholder(s) left in src/content/series.ts:\n`);
  for (const f of found) console.log(`  line ${String(f.line).padStart(3)}  [${f.value}]    ${f.text}`);
}
