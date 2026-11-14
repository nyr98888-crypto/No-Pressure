"use client";

import type { ReactNode } from "react";

export function SlideDrawer({
  open,
  title,
  titleIcon,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  titleIcon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="drawer-sheet glass-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
        <div className="flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl font-black tracking-tight">
            {titleIcon}
            {title}
          </h2>
          <button
            type="button"
            className="pill-3d bg-white/10 px-3 py-1.5 text-xs text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
