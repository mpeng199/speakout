// Lists every [placeholder] still in the content file, whether it is a whole value or sits inside a
// sentence: npm run placeholders
// Only text in quotes or backticks counts; comments (which explain placeholders) are skipped.
import { readFileSync } from "node:fs";
import ts from "typescript";

const file = new URL("../src/content/series.ts", import.meta.url);
const text = readFileSync(file, "utf8");
const lines = text.split("\n");
const source = ts.createSourceFile("series.ts", text, ts.ScriptTarget.Latest, true);
const found = [];

const isText = (node) =>
  ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node);

(function visit(node) {
  if (isText(node)) {
    const start = node.getStart(source);
    for (const m of text.slice(start, node.getEnd()).matchAll(/\[[^\]\n]+\]/g)) {
      const line = source.getLineAndCharacterOfPosition(start + m.index).line;
      found.push({ line: line + 1, value: m[0], text: lines[line].trim() });
    }
  }
  ts.forEachChild(node, visit);
})(source);

if (!found.length) {
  console.log("No placeholders left in src/content/series.ts");
} else {
  console.log(`${found.length} placeholder(s) left in src/content/series.ts:\n`);
  for (const f of found) console.log(`  line ${String(f.line).padStart(3)}  ${f.value}    ${f.text}`);
}
