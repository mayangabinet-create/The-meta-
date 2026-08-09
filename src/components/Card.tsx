import clsx from "clsx";
import type { ReactNode } from "react";

export default function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border bg-surface p-4",
        className
      )}
    >
      {children}
    </div>
  );
}
