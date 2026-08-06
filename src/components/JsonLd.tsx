// Renders a JSON-LD structured data block. Escapes "<" so a value containing "</script>" (or
// anything else that looks like a tag) can't break out of the script element — all current data
// is our own translated strings, not user input, but this is cheap insurance either way.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
