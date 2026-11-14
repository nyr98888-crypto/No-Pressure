"use client";

import type { ReactNode } from "react";

type Network = {
  id: string;
  label: string;
  color: string;
  text?: string;
  href: (url: string, caption: string) => string;
  icon: ReactNode;
};

const iconClass = "h-3.5 w-3.5 shrink-0";

const NETWORKS: Network[] = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "from-[#25D366] to-[#128C7E]",
    href: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t}\n${u}`)}`,
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.84c0 1.92.52 3.72 1.43 5.28L2 22l5.05-1.52a9.9 9.9 0 0 0 4.99 1.34h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2zm5.76 14.05c-.24.68-1.4 1.24-1.93 1.32-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.26-4.79-4.18-4.93-4.37-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.08.99-2.36.26-.28.57-.35.76-.35h.55c.17 0 .41-.07.64.49.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.14.31-.28.48-.14.17-.3.37-.42.5-.14.14-.28.29-.12.56.16.28.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.26.14.42.12.57-.07.16-.19.67-.78.85-1.05.17-.26.35-.22.59-.13.24.1 1.54.73 1.8.86.26.14.44.2.5.31.07.1.07.6-.17 1.28z" />
      </svg>
    ),
  },
  {
    id: "telegram",
    label: "Telegram",
    color: "from-[#37AEE2] to-[#1E96C8]",
    href: (u, t) =>
      `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21.94 4.3 18.5 20.07c-.26.99-.93 1.23-1.88.77l-5.2-3.84-2.51 2.42c-.28.28-.51.51-1.05.51l.37-5.33 9.7-8.76c.42-.38-.09-.59-.65-.21l-12 7.55-5.17-1.61c-1.12-.35-1.14-1.12.23-1.66L20.53 3.4c.93-.35 1.74.21 1.41.9z" />
      </svg>
    ),
  },
  {
    id: "snapchat",
    label: "Snapchat",
    color: "from-[#FFFC00] to-[#F7E600]",
    text: "text-black",
    href: () => "https://www.snapchat.com/",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.04 2.05c-2.2 0-3.9 1.55-3.9 3.9v1.12c0 .2-.04.6-.62.74-.38.1-.72.2-.97.35-.15.1-.18.23-.1.37.2.35.8.55 1.42.7.12.03.16.1.14.2-.1.55-.62 2.6-3.28 3.05-.22.04-.3.16-.24.34.25.72 1.2 1.3 2.05 1.64.18.07.26.2.2.37-.2.55-.6 1.35-1.05 1.72-.18.14-.1.35.16.35.48 0 1.05-.2 1.62-.42.22-.08.35-.05.46.1.5.65 1.5 1.5 3.11 1.5s2.61-.85 3.11-1.5c.1-.15.24-.18.46-.1.57.22 1.14.42 1.62.42.26 0 .34-.21.16-.35-.45-.37-.85-1.17-1.05-1.72-.06-.17.02-.3.2-.37.85-.34 1.8-.92 2.05-1.64.06-.18-.02-.3-.24-.34-2.66-.45-3.18-2.5-3.28-3.05-.02-.1.02-.17.14-.2.62-.15 1.22-.35 1.42-.7.08-.14.05-.27-.1-.37-.25-.15-.59-.25-.97-.35-.58-.14-.62-.54-.62-.74V5.95c0-2.35-1.7-3.9-3.9-3.9z" />
      </svg>
    ),
  },
  {
    id: "tiktok",
    label: "TikTok",
    color: "from-[#111] to-[#000]",
    href: () => "https://www.tiktok.com/",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.6 5.82A5.2 5.2 0 0 1 14.9 2h-3.1v13.1a2.6 2.6 0 1 1-1.85-2.48V9.4a5.7 5.7 0 1 0 4.55 5.55V9.5a8.3 8.3 0 0 0 4.8 1.52V8a5.2 5.2 0 0 1-2.7-2.18z" />
      </svg>
    ),
  },
  {
    id: "ig",
    label: "Instagram Reels",
    color: "from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    href: () => "https://www.instagram.com/",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      </svg>
    ),
  },
  {
    id: "yt",
    label: "YouTube Shorts",
    color: "from-[#FF0000] to-[#C40000]",
    href: () => "https://www.youtube.com/shorts",
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
      </svg>
    ),
  },
  {
    id: "fb",
    label: "Facebook",
    color: "from-[#1877F2] to-[#0C63D4]",
    href: (u) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
      </svg>
    ),
  },
  {
    id: "x",
    label: "",
    color: "from-[#111] to-[#000]",
    href: (u, t) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${t} ${u}`)}`,
    icon: (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.9-6.4L6.3 22H3.2l7.3-8.3L1 2h6.4l4.4 5.8L18.9 2zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20z" />
      </svg>
    ),
  },
];

const CopyIcon = (
  <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

export function SharePills({
  url,
  caption,
}: {
  url: string;
  caption: string;
}) {
  const copy = async () => {
    const text = `${caption}\n${url}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: "No Pressure", text: caption, url });
      } catch {
        /* ignore cancel */
      }
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold tracking-[0.18em] text-[#9aa3b8]">SHARE</p>
      <div className="flex flex-wrap gap-2">
        {NETWORKS.map((n) => (
          <a
            key={n.id}
            href={n.href(url, caption)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={n.id === "x" ? "Share on X" : n.label}
            className={`pill-3d bg-gradient-to-b ${n.color} px-3 py-2 text-[11px] ${n.text ?? "text-white"}`}
            onClick={async (e) => {
              try {
                await navigator.clipboard.writeText(`${caption}\n${url}`);
              } catch {
                /* ignore */
              }
              if (n.id === "snapchat" || n.id === "tiktok" || n.id === "ig" || n.id === "yt") {
                e.preventDefault();
                window.open(n.href(url, caption), "_blank", "noopener,noreferrer");
              }
            }}
          >
            {n.icon}
            {n.label ? <span>{n.label}</span> : null}
          </a>
        ))}
        <button
          type="button"
          className="pill-3d bg-gradient-to-b from-white/20 to-white/5 px-3 py-2 text-[11px] text-white"
          onClick={copy}
        >
          {CopyIcon}
          Copy Link
        </button>
      </div>
    </div>
  );
}
