import { segmentMeta } from "@/lib/segment";
import type { Segment } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SegmentBadge({ segment }: { segment?: Segment }) {
  const m = segmentMeta[segment ?? "fresher"];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", m.classes)}>
      {m.label}
    </span>
  );
}
