"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Children, useRef, type MouseEvent, type ReactNode } from "react";

/** Page numbers shown at once; the window follows the current page. */
const WINDOW = 5;

/**
 * The hub's list, a page at a time, with page links beneath once there is more
 * than one page.
 *
 * The frames draw no pager, so it follows the reference supplied for it, the
 * Samsung Newsroom's (news.samsung.com/id/latest/page/2): a row of 44px round
 * page numbers 16px apart, 20px regular type in grey, the current page a solid
 * blue disc with white type, thin grey chevrons either side, 30px under the
 * list, five numbers at a time. Set here in the site's own Circular Std and
 * tokens — `ink-faint` for the grey, `brand` for the blue.
 *
 * The page lives in the URL (`?page=2`) through the native History API, which
 * Next keeps in step with `useSearchParams` — so a page can be shared, survives
 * a reload, and Back from an article returns to it, all without a round trip to
 * the server. The hub is prerendered, so the query is only known on the client:
 * the caller wraps this in a `Suspense` boundary whose fallback is page one.
 *
 * Page numbers are real links, so a middle-click still opens that page in a new
 * tab; a plain click switches in place and brings the list's top into view.
 */
export function ArticlePager({
  pageSize,
  listClassName,
  children,
}: {
  pageSize: number;
  listClassName: string;
  /** One `<li>` per row. */
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const listRef = useRef<HTMLUListElement>(null);

  const items = Children.toArray(children);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const requested = Number(searchParams.get("page"));
  // Anything but a page that exists — missing, zero, past the end, not a number — is page one.
  const page = Number.isInteger(requested) && requested >= 1 && requested <= pages ? requested : 1;

  // Centre the current page in the window where there is room, pinned at either end.
  const first = Math.min(Math.max(1, page - Math.floor(WINDOW / 2)), Math.max(1, pages - WINDOW + 1));
  const numbers = Array.from({ length: Math.min(WINDOW, pages) }, (_, index) => first + index);

  const hrefFor = (target: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (target === 1) params.delete("page");
    else params.set("page", String(target));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const goTo = (target: number) => {
    window.history.pushState(null, "", hrefFor(target));
    listRef.current?.scrollIntoView({ block: "start" });
  };

  const onPageClick = (event: MouseEvent<HTMLAnchorElement>, target: number) => {
    // Leave modified clicks to the browser: new tab, new window, download.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (target !== page) goTo(target);
  };

  return (
    <>
      <ul ref={listRef} className={`scroll-mt-10 ${listClassName}`}>
        {items.slice((page - 1) * pageSize, page * pageSize)}
      </ul>

      {pages > 1 ? (
        // 16px between items from `sm`; 4px on phones, where seven 44px items
        // at 16px would run wider than the column.
        <nav aria-label="Article pages" className="mt-7.5 flex items-center justify-center gap-1 sm:gap-4">
          <PageArrow direction="previous" disabled={page === 1} onClick={() => goTo(page - 1)} />

          <ol className="flex items-center gap-1 sm:gap-4">
            {numbers.map((target) => {
              const current = target === page;
              return (
                <li key={target}>
                  <a
                    href={hrefFor(target)}
                    onClick={(event) => onPageClick(event, target)}
                    aria-current={current ? "page" : undefined}
                    aria-label={`Page ${target}`}
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                      current ? "bg-brand text-white" : "text-ink-faint hover:text-brand"
                    }`}
                  >
                    {target}
                  </a>
                </li>
              );
            })}
          </ol>

          <PageArrow direction="next" disabled={page === pages} onClick={() => goTo(page + 1)} />
        </nav>
      ) : null}
    </>
  );
}

/** A thin grey chevron in a 44px target, as the reference draws its arrows. */
function PageArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "previous" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const previous = direction === "previous";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={previous ? "Previous page" : "Next page"}
      className="flex h-11 w-11 items-center justify-center rounded-full text-ink-faint transition-colors enabled:hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-default disabled:opacity-40"
    >
      <svg
        viewBox="0 0 26 30"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[30px] w-[26px]"
        aria-hidden
      >
        <path d={previous ? "M16.5 7 8.5 15l8 8" : "M9.5 7l8 8-8 8"} />
      </svg>
    </button>
  );
}
