import type { Segment, StudentProfile } from "./types";

export function calcSegment(p: Partial<StudentProfile>): Segment {
  const year = new Date().getFullYear();
  const cgpa = Number(p.cgpa ?? 0);
  const skills = p.skills ?? [];
  const interests = p.career_interests ?? [];
  const grad = Number(p.graduation_year ?? year + 5);

  const skilled = cgpa >= 6.5 && skills.length >= 3 && grad <= year;
  if (skilled && interests.length > 0 && p.resume_url) return "placement_ready";
  if (skilled) return "skilled";
  return "fresher";
}

export const segmentMeta: Record<Segment, { label: string; classes: string }> = {
  fresher: { label: "Fresher", classes: "bg-info/15 text-info border-info/30" },
  skilled: { label: "Skilled", classes: "bg-warning/15 text-warning border-warning/30" },
  placement_ready: {
    label: "Placement Ready",
    classes: "bg-success/15 text-success border-success/30",
  },
};
