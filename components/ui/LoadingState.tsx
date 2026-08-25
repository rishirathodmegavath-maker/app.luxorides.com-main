import Image from "next/image";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
  compact?: boolean;
};

export default function LoadingState({
  label = "Loading",
  className,
  compact = false,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center",
        compact ? "py-6" : "py-10",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-[24px] border border-black/10 bg-[#f5f1e8] text-black shadow-[0_18px_45px_rgba(0,0,0,0.22)]",
          compact ? "px-4 py-3" : "px-5 py-4",
        )}
      >
        <Image
          src="/loading.gif"
          alt=""
          width={compact ? 30 : 38}
          height={compact ? 30 : 38}
          unoptimized
          aria-hidden
          className="shrink-0"
        />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}
