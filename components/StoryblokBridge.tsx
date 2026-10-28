"use client";

import { loadStoryblokBridge, registerStoryblokBridge } from "@storyblok/react";
import { useEffect } from "react";

/**
 * Live preview inside the Storyblok Visual Editor.
 *
 * Rendered only in draft mode (see `StoryView`), so no bridge is shipped to
 * visitors, and it does nothing outside the editor: the editor names the story
 * it is editing in the page's `_storyblok` parameter (carried through by
 * `/api/draft`), and the SDK attaches to that story only.
 *
 * The bridge script is loaded here — nothing else in the app loads it, and
 * `registerStoryblokBridge` quietly does nothing until it is. On a saved change
 * or a publish the SDK reloads the page, and draft requests are `no-store`, so
 * the editor sees the new content at once. Keystrokes (`input`) are left alone:
 * a server round-trip per character is not worth it.
 */
export function StoryblokBridge({ storyId }: { storyId: number }) {
  useEffect(() => {
    if (!storyId || !new URLSearchParams(window.location.search).has("_storyblok")) return;
    loadStoryblokBridge().catch((error: unknown) => {
      console.error("[storyblok] the Visual Editor bridge failed to load", error);
    });
    registerStoryblokBridge(storyId, () => {});
  }, [storyId]);

  return null;
}
