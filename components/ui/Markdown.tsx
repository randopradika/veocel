import type { Element, ElementContent, Root } from "hast";
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

/**
 * The longest pair of closing words worth holding together. Past this the pair
 * could outrun a phone's column, and a line that long is no orphan anyway.
 */
const MAX_TAIL = 30;

/**
 * Splits `text` before its last two words, or returns null when there is no
 * pair to hold together. The trailing whitespace stays with the tail.
 */
function splitLastWords(text: string): [head: string, tail: string] | null {
  const match = /\S+\s+\S+\s*$/.exec(text);
  if (!match || match[0].trim().length > MAX_TAIL) return null;
  return [text.slice(0, match.index), match[0]];
}

const NOWRAP = "whitespace-nowrap";

/**
 * Plain text whose last line always carries at least two words.
 *
 * `text-wrap: pretty` is meant to do this and does not reliably: Chrome leaves a
 * two-line label ending "internal / set-up" as it is, and gives up on some
 * longer paragraphs at phone width. Holding the last two words in one unbreakable
 * run does it in every browser — `nowrap` rather than a no-break space, because
 * a hyphenated closing word would still break at its hyphen.
 */
export function KeepLastWords({ text }: { text: string }) {
  const split = splitLastWords(text);
  if (!split) return text;
  return (
    <>
      {split[0]}
      <span className={NOWRAP}>{split[1]}</span>
    </>
  );
}

/** What Markdown can nest inside a list item that is not inline text. */
const BLOCK = new Set(["p", "ul", "ol", "blockquote", "pre", "table", "hr", "h1", "h2", "h3", "h4", "h5", "h6"]);

function isBlock(node: ElementContent): boolean {
  return node.type === "element" && BLOCK.has(node.tagName);
}

function textOf(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") return node.children.map(textOf).join("");
  return "";
}

/**
 * Wraps the last two words of a run of inline content in a `nowrap` span. The
 * pair can straddle elements — "at [canopyplanet.org](…)." ends on a link and a
 * full stop — so the split is found in the run's text and mapped back to the
 * child it falls in.
 */
function holdTail(element: Element) {
  const texts = element.children.map(textOf);
  const split = splitLastWords(texts.join(""));
  if (!split) return;

  let offset = split[0].length;
  let index = 0;
  while (offset >= texts[index].length) {
    offset -= texts[index].length;
    index += 1;
  }

  const child = element.children[index];
  // Both words inside one link or emphasis: hold them there.
  if (child.type === "element" && offset > 0) {
    holdTail(child);
    return;
  }

  const tail = element.children.splice(index);
  if (child.type === "text" && offset > 0) {
    element.children.push({ type: "text", value: child.value.slice(0, offset) });
    tail[0] = { type: "text", value: child.value.slice(offset) };
  }
  element.children.push({
    type: "element",
    tagName: "span",
    properties: { className: [NOWRAP] },
    children: tail,
  });
}

/** `KeepLastWords` for Markdown: the same hold on every paragraph and list item. */
function rehypeKeepLastWords() {
  const visit = (node: Root | Element) => {
    for (const child of node.children) {
      if (child.type !== "element") continue;
      // A loose list item holds its paragraphs, which are visited in turn.
      if (child.tagName === "p" || (child.tagName === "li" && !child.children.some(isBlock))) {
        holdTail(child);
      } else {
        visit(child);
      }
    }
  };

  return (tree: Root) => visit(tree);
}

export function Markdown({
  children,
  className = "",
  gap = "default",
  keepLastWords = false,
}: {
  children?: string;
  className?: string;
  gap?: keyof typeof GAP;
  /** Never let a paragraph end on a single word — see `KeepLastWords`. */
  keepLastWords?: boolean;
}) {
  if (!children?.trim()) return null;

  return (
    <div className={`${PROSE} ${GAP[gap]} ${className}`}>
      <ReactMarkdown rehypePlugins={keepLastWords ? [rehypeKeepLastWords] : undefined}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
