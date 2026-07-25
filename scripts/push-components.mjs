#!/usr/bin/env node
/**
 * Pushes `storyblok/components.json` into a Storyblok space.
 *
 *   npm run storyblok:push -- <spaceId>
 *
 * Why this exists: the CLI only reads components from
 * `.storyblok/components/<spaceId>/components.json`. Keeping the canonical schema
 * at `storyblok/components.json` instead means it stays reviewable in git and
 * isn't pinned to one space id — so this copies it into place, then pushes.
 *
 * It also asserts the file is a bare JSON array. The CLI wraps a non-array in
 * `[value]` and then silently skips anything without a `schema` key, so a
 * `{ "components": [...] }` wrapper would report success while importing nothing.
 */
import { spawn } from "node:child_process";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE = join("storyblok", "components.json");

const spaceId = process.argv[2] ?? process.env.STORYBLOK_SPACE_ID;

if (!spaceId || !/^\d+$/.test(spaceId)) {
  console.error(
    "Missing space id.\n\n" +
      "  npm run storyblok:push -- 123456\n\n" +
      "Find it in Storyblok under Settings › General, or set STORYBLOK_SPACE_ID.",
  );
  process.exit(1);
}

const components = JSON.parse(await readFile(SOURCE, "utf8"));

if (!Array.isArray(components)) {
  console.error(
    `${SOURCE} must be a top-level JSON array of components.\n` +
      "The Storyblok CLI skips entries without a `schema` key, so an object wrapper\n" +
      "would push nothing while still reporting success.",
  );
  process.exit(1);
}

const targetDir = join(".storyblok", "components", spaceId);
await mkdir(targetDir, { recursive: true });
await copyFile(SOURCE, join(targetDir, "components.json"));

console.log(`Pushing ${components.length} components to space ${spaceId}…`);

/*
 * The CLI's bin is a plain ESM entrypoint, so run it with this Node binary rather
 * than through `npx` — no shell, so nothing has to be escaped, and it uses the
 * version pinned in devDependencies instead of resolving one at run time.
 *
 * Resolved via `import.meta.resolve` rather than `require.resolve`: the package
 * exposes only an `import` condition, so CJS resolution can't see it.
 */
const cli = fileURLToPath(import.meta.resolve("storyblok"));

const child = spawn(process.execPath, [cli, "components", "push", "--space", spaceId], {
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 1));
