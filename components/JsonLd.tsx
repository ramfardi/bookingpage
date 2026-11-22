/*
 * Renders schema.org structured data as <script type="application/ld+json">.
 *
 * Security: the data can contain text typed by business owners. A plain
 * JSON.stringify would let "</script><script>..." in a description break
 * out of the tag (stored XSS), so "<", ">" and "&" are written as JSON
 * unicode escapes, which parse back to the same characters. The two
 * Unicode line separators are escaped too, for older JS parsers.
 */
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), "g");
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), "g");

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEPARATOR, "\\u2028")
    .replace(PARAGRAPH_SEPARATOR, "\\u2029");
}

export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
