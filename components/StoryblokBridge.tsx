"use client";

import { registerStoryblokBridge } from "@storyblok/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Live preview inside the Storyblok Visual Editor.
 *
 * Rendered only in draft mode (see `app/layout.tsx`), so no bridge script is
 * shipped to visitors. On a content change it calls `router.refresh()`, which
 * re-runs the server components — draft requests are `no-store`, so the editor
 * sees the new content immediately.
 *
 * It listens for `change` and `published` rather than `input`: `input` fires on
 * every keystroke and would trigger a server round-trip per character.
 */
export function StoryblokBridge({ storyId }: { storyId: number }) {
  const router = useRouter();

  useEffect(() => {
    if (!storyId) return;
    registerStoryblokBridge(storyId, () => router.refresh());
  }, [storyId, router]);

  return null;
}
