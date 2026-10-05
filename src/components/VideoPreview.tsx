"use client";

import { useState } from "react";

export default function VideoPreview({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  let parsed: URL;
  try { parsed = new URL(url); } catch { return null; }
  const id = parsed.searchParams.get("v") ?? parsed.pathname.split("/").pop() ?? "";
  if (parsed.protocol !== "https:" || parsed.hostname !== "www.youtube.com" || !/^[\w-]{11}$/.test(id)) return null;
  return open ? (
    <iframe className="video-preview" title={title} src={`https://www.youtube-nocookie.com/embed/${id}`}
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
  ) : <button type="button" className="video-preview__button" onClick={() => setOpen(true)}>여기서 영상 보기 ↗</button>;
}
