"use client";

import { useEffect, useRef, useState } from "react";

/**
 * An iframe that takes the height of the page inside it, with no scrollbar.
 *
 * For pages that carry iframe-resizer's v4 child script — Lenzing's newsletter
 * form ships v4.2.11. That script stays silent until the host sends it an init
 * message, then reports the page's height on every change: as its own scripts
 * finish laying it out, and as validation messages come and go. Speaking that
 * protocol takes the few lines below; the library's parent script would add 14KB
 * for the same, and its last v4 release logs an upgrade banner on every load.
 *
 * Until the first report the frame keeps the height `className` gives it, so
 * size that to fit the finished page: it never scrolls.
 */

const PREFIX = "[iFrameSizer]";
const ID = "frame";

/**
 * The init message, fields in the v4 parent's order: id, body margin (v1), size
 * width, log, poll interval, public methods, auto resize, body margin, height
 * method, body background, body padding, tolerance, in-page links, resize from,
 * width method, mouse events. The height method is `documentElementOffset`, not
 * the default `bodyOffset`: the form's body holds nothing but floats, so its own
 * offset height is 0.
 */
const INIT = `${PREFIX}${ID}:8:false:false:32:true:true:null:documentElementOffset:null:null:0:false:parent:scroll:false`;

/** Reply types whose numbers are something other than the page's size. */
const NOT_SIZE = new Set([
  "close",
  "message",
  "autoResize",
  "scrollTo",
  "scrollToOffset",
  "pageInfo",
  "pageInfoStop",
  "inPageLink",
]);

export function ResizingIframe({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className: string;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const origin = new URL(src).origin;

    // Sent on every load (a submit loads the provider's next page in the frame)
    // and once now, for a frame that finished loading before hydration. A
    // message to a frame still on about:blank is dropped by the origin check.
    const init = () => frame.contentWindow?.postMessage(INIT, origin);

    function onMessage(event: MessageEvent) {
      if (event.source !== frame?.contentWindow || event.origin !== origin) return;
      if (typeof event.data !== "string") return;
      // The child's own hello, when it loads after the init went out.
      if (event.data === "[iFrameResizerChild]Ready") return init();
      if (!event.data.startsWith(`${PREFIX}${ID}:`)) return;

      const [, reported, , type] = event.data.slice(PREFIX.length).split(":");
      const next = Math.ceil(Number(reported));
      if (!NOT_SIZE.has(type) && next > 0) setHeight(next);
    }

    window.addEventListener("message", onMessage);
    frame.addEventListener("load", init);
    init();
    return () => {
      window.removeEventListener("message", onMessage);
      frame.removeEventListener("load", init);
    };
  }, [src]);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      // Deprecated, but still the only way to hide a frame's own scrollbars.
      scrolling="no"
      style={height ? { height } : undefined}
      className={className}
    />
  );
}
