// Vee's themed candy-bag photos (2026-11-09, from her "candy bags" folder),
// shown on the theme choices of occasion and holiday pages. Keyed by the
// theme name exactly as it is in the Studio. Stored in public/themes/.
// The birthday four were cut from one photo of four bags.
const byTheme: Record<string, string> = {
  // Birthdays
  "Superhero red + blue": "/themes/superhero-v2.webp",
  "Pretty in pink": "/themes/pretty-in-pink-v2.webp",
  "Dino green": "/themes/dino-v2.webp",
  "Unicorn pastels": "/themes/unicorn-v2.webp",
  Princess: "/themes/princess-v2.webp",
  // Baby showers, gender reveals, graduations, baptisms
  "Soft pastels": "/themes/soft-pastels-v2.webp",
  "Pink + blue": "/themes/pink-blue-v2.webp",
  "School colours": "/themes/graduation-v2.webp",
  "Soft white + pastel": "/themes/baptism-v2.webp",
  // Holidays
  "Stocking stuffer holiday bags": "/themes/stocking-stuffer-v2.webp",
  "Hello 2027": "/themes/hello-2027-v2.webp",
};

export const themePhoto = (name: string): string | null => byTheme[name.trim()] ?? null;
