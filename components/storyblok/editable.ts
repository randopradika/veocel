import { storyblokEditable, type SbBlokData } from "@storyblok/react/rsc";

import type { SbBlock } from "@/lib/types";

/**
 * Spread onto a block's outermost element:
 *
 *   <Section {...editable(blok)}>
 *
 * Emits the `data-blok-c` / `data-blok-uid` attributes the Visual Editor uses for
 * click-to-edit. Draft-only — in published content `_editable` is absent and this
 * returns nothing.
 *
 * The cast exists because `SbBlokData` carries an index signature that our
 * precise blok types deliberately don't.
 */
export function editable(blok: SbBlock) {
  return storyblokEditable(blok as unknown as SbBlokData);
}
