// Vee's bag-size photos (2026-11-09, from her "neww" folder): the 1, 2 and
// 4 lb bags cut from her size comparison photo, kept at the same scale so
// the bags look bigger as the size goes up. Stored in public/bags/.
// There's no 0.5 lb photo yet: "half-lb" is the 1 lb photo shown smaller,
// to swap for a real one when Vee has it.
// These are used on Build Your Stash ahead of any Studio size photo.
const byLabel: Record<string, string> = {
  "0.5 lb": "/bags/half-lb.webp",
  "1 lb": "/bags/1lb.webp",
  "2 lb": "/bags/2lb.webp",
  "4 lb": "/bags/4lb.webp",
};

export const bagPhoto = (label: string) => byLabel[label.trim().toLowerCase().replace(/\s+/g, " ")] ?? null;
