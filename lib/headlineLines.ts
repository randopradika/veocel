/**
 * Where a two-line heading breaks.
 *
 * The design draws its two-line headings with the break put in, not wrapped:
 * the text nodes carry `whitespace-nowrap` and one `<p>` per line. That holds
 * for every section hero (2053:1127, 2053:989, 2053:854, 2053:385, 2053:260;
 * the fibers page goes further and uses two nodes, 2053:780 and 2053:782) and
 * for the fibers page's portfolio headings (2053:718, 2053:730). Left to wrap,
 * the browser fills the first line and puts "explore VEOCEL™ / fibers" where
 * the design has "explore / VEOCEL™ fibers".
 *
 * So the break is chosen here rather than by the box: take the split that makes
 * the longer of the two lines as short as it can be, and prefer the evener one
 * where two splits tie. That reproduces the design on all seven section pages
 * and both portfolio headings.
 *
 * A newline in the field wins outright — that is the escape hatch for a heading
 * whose break an editor wants to pin, and for translations, where balancing the
 * two halves is not going to land where a designer would put it.
 */
export function headlineLines(headline: string): string[] {
  if (/\r?\n/.test(headline)) {
    return headline
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  const words = headline.trim().split(/\s+/);
  if (words.length < 2) return [headline.trim()];

  let best: { longest: number; spread: number; lines: string[] } | null = null;
  for (let i = 1; i < words.length; i++) {
    const first = words.slice(0, i).join(" ");
    const second = words.slice(i).join(" ");
    const longest = Math.max(first.length, second.length);
    const spread = Math.abs(first.length - second.length);
    if (!best || longest < best.longest || (longest === best.longest && spread < best.spread)) {
      best = { longest, spread, lines: [first, second] };
    }
  }

  return best!.lines;
}
