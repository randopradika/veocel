import ReactMarkdown from "react-markdown";

/**
 * Renders a Storyblok plain-text field as Markdown.
 *
 * The prose fields in the block library are Storyblok textareas, so an editor
 * can reach for a link, emphasis or a list without the field becoming
 * rich-text. Blank lines start a new paragraph — the convention these blocks
 * already documented, and what Markdown reads them as anyway, so existing copy
 * renders exactly as it did.
 *
 * Raw HTML in the source is *not* rendered: `react-markdown` drops it unless a
 * rehype plugin puts it back, so content cannot inject markup into a page.
 *
 * Typography stays at the call site — the classes a block used to put on its
 * own `<p>` go on `className` here and inherit into whatever Markdown
 * generates.
 */

/** The inline elements Markdown can newly introduce, styled once. */
const PROSE =
  "[&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:no-underline " +
  "[&_strong]:font-semibold [&_em]:italic " +
  "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li+li]:mt-1";

/**
 * Space between the blocks Markdown generates, each spelled out in full so
 * Tailwind can see the class. `loose` matches the blocks whose paragraphs sat
 * `mt-5` apart.
 */
const GAP = {
  /** Lines set flush, one under the next — a list of sources. */
  none: "",
  tight: "[&>*+*]:mt-3",
  default: "[&>*+*]:mt-4",
  loose: "[&>*+*]:mt-5",
  /** A whole blank line of 32px leading, as the article body is drawn. */
  line: "[&>*+*]:mt-8",
} as const;

export function Markdown({
  children,
  className = "",
  gap = "default",
}: {
  children?: string;
  className?: string;
  gap?: keyof typeof GAP;
}) {
  if (!children?.trim()) return null;

  return (
    <div className={`${PROSE} ${GAP[gap]} ${className}`}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
