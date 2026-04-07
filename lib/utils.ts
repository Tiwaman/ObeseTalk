export function relativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function cardRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return ((hash % 500) / 500) * 4 - 2; // Range: -2 to +2 degrees
}

export const WHO_OPTIONS = [
  "A Family Member",
  "A Stranger",
  "My Doctor",
  "A Coworker",
  "Someone I was Dating",
  "A Friend",
  "An Internet Person",
  "Someone Else",
] as const;

export const WHERE_OPTIONS = [
  "Family Dinner",
  "Doctor's Office",
  "Grocery Store",
  "At Work",
  "On a Date",
  "Online",
  "At the Gym",
  "Just Existing in Public",
  "Somewhere Else",
] as const;

export const WHO_EMOJI: Record<string, string> = {
  "A Family Member": "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67",
  "A Stranger": "\ud83d\ude36",
  "My Doctor": "\ud83d\udc68\u200d\u2695\ufe0f",
  "A Coworker": "\ud83d\udcbc",
  "Someone I was Dating": "\ud83d\udc94",
  "A Friend": "\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1",
  "An Internet Person": "\ud83d\udcbb",
  "Someone Else": "\ud83e\udd37",
};

export const WHERE_EMOJI: Record<string, string> = {
  "Family Dinner": "\ud83c\udf7d\ufe0f",
  "Doctor's Office": "\ud83c\udfe5",
  "Grocery Store": "\ud83d\uded2",
  "At Work": "\ud83c\udfe2",
  "On a Date": "\ud83c\udf39",
  "Online": "\ud83c\udf10",
  "At the Gym": "\ud83c\udfcb\ufe0f",
  "Just Existing in Public": "\ud83d\udeb6",
  "Somewhere Else": "\ud83d\udccd",
};

export type ReactionType = "DID_NOT" | "GOT_THIS_TOO" | "AUDACITY" | "SENDING_LOVE";

export const REACTION_CONFIG: Record<ReactionType, { emoji: string; label: string }> = {
  DID_NOT: { emoji: "\ud83d\ude2d", label: "They did NOT" },
  GOT_THIS_TOO: { emoji: "\ud83e\udd1d", label: "I got this one too" },
  AUDACITY: { emoji: "\ud83d\udc80", label: "The audacity" },
  SENDING_LOVE: { emoji: "\ud83e\udec2", label: "Sending you love" },
};
