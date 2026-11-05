import type { Occasion, SeasonalCollection } from "@/lib/types";

// Occasions come from the brief (§4). Ideas are offerings Vee described as
// possible; they're shown as "ideas", not as products with prices.

export const occasions: Occasion[] = [
  {
    id: "birthdays",
    slug: "birthdays",
    name: "Birthdays + Kids’ Parties",
    shortName: "Birthday",
    tagline: "Party favours they’ll actually fight over.",
    description:
      "Individual favour bags in your party colours, finished with name, age or thank-you stickers.",
    ideas: [
      "Individual party favour bags",
      "Colours matched to the age or theme",
      "Name, date and “thank you” stickers",
      "Mini guest favours or larger treat bags",
    ],
    themes: [
      { name: "Superhero red + blue", description: "Red and blue candy for a superhero party, finished with a custom birthday tag. Sealed with a custom coloured ribbon." },
      { name: "Pretty in pink", description: "All-pink candy for a doll-themed party, finished with a custom birthday tag. Sealed with a custom coloured ribbon." },
      { name: "Your party colours", description: "Tell us your party colours and we’ll match the candy and tag. Sealed with a custom coloured ribbon." },
      { name: "Dino green", description: "Green and orange candy for a dinosaur party, with a custom birthday tag. Sealed with a custom coloured ribbon." },
      { name: "Unicorn pastels", description: "Soft pink, purple and blue candy for a magical party, with a custom birthday tag. Sealed with a custom coloured ribbon." },
      { name: "Princess", description: "Princess-coloured candy fit for royalty, with a custom birthday tag. Sealed with a custom coloured ribbon." },
      { name: "Under the sea", description: "Blue and teal candy for an ocean or mermaid party, with a custom birthday tag. Sealed with a custom coloured ribbon." },
      { name: "Game day", description: "Candy in your favourite team’s colours, with a custom birthday tag. Sealed with a custom coloured ribbon." },
    ],
    accent: "orange",
    bannerImage: null,
    productIds: ["signature-mixed", "sweet", "sour"],
    featuredOnHome: true,
  },
  {
    id: "baby-showers",
    slug: "baby-showers",
    name: "Baby Showers",
    shortName: "Baby Shower",
    tagline: "Sweet little favours for a sweet little arrival.",
    description:
      "Soft colour themes and personalized guest labels for celebrating the parents-to-be.",
    ideas: [
      "Soft, pastel or custom colour themes",
      "“Baby on the way” style messages",
      "Personalized guest favour labels",
    ],
    themes: [
      { name: "Soft pastels", description: "Pastel pink, blue or mint candy with a “Baby on the way” tag. Sealed with a custom coloured ribbon." },
      { name: "Your shower colours", description: "Candy in your shower colours with the parents’ names and date on the tag. Sealed with a custom coloured ribbon." },
    ],
    accent: "pink",
    bannerImage: null,
    productIds: ["sweet", "signature-mixed"],
    featuredOnHome: true,
  },
  {
    id: "gender-reveals",
    slug: "gender-reveals",
    name: "Gender Reveals",
    shortName: "Gender Reveal",
    tagline: "Pink, blue or your own colours.",
    description:
      "Candy assortments and favours with your chosen reveal colours and wording.",
    ideas: [
      "Pink, blue or custom-theme assortments",
      "Favours with your approved reveal wording",
      "Colour-coordinated presentation",
    ],
    themes: [
      { name: "Pink + blue", description: "Pink and blue candy with a “Boy or girl?” tag. Sealed with a custom coloured ribbon." },
      { name: "Your reveal colours", description: "Candy in your reveal colours with a custom tag. Sealed with a custom coloured ribbon." },
    ],
    accent: "teal",
    bannerImage: null,
    productIds: ["sweet", "signature-mixed"],
    featuredOnHome: true,
  },
  {
    // Replaced Weddings at Vee's request (2026-10-27).
    id: "graduations",
    slug: "graduations",
    name: "Graduations",
    shortName: "Graduation",
    tagline: "Sweet treats for the grad.",
    description:
      "Grad party favours in school colours, with the graduate’s name and year on the label.",
    ideas: [
      "Grad party favour bags",
      "School-colour candy mixes",
      "Name and grad year labels",
    ],
    themes: [
      { name: "School colours", description: "Candy in the school’s colours with the grad’s name and “Class of” year on the tag. Sealed with a custom coloured ribbon." },
    ],
    accent: "orange",
    bannerImage: null,
    productIds: [],
    featuredOnHome: true,
  },
  {
    id: "bridal-showers",
    slug: "bridal-showers",
    name: "Bridal Showers + Bachelorettes",
    shortName: "Bridal Shower",
    tagline: "Favours for the bride crew.",
    description: "Shower-themed guest favours with custom event tags and coordinated colours.",
    ideas: ["Shower-themed guest favours", "Custom event tags", "Coordinated colours"],
    themes: [
      { name: "Blush + white", description: "Soft blush and white candy with the bride’s name on the tag. Sealed with a custom coloured ribbon." },
      { name: "Bachelorette brights", description: "Bright, fun candy with a custom party tag. Sealed with a custom coloured ribbon." },
      { name: "Engagement celebration", description: "Candy in your celebration colours with the couple’s names on the tag. Sealed with a custom coloured ribbon." },
    ],
    accent: "pink",
    bannerImage: null,
    productIds: ["sweet", "signature-mixed"],
    featuredOnHome: false,
  },
  {
    id: "baptisms",
    slug: "baptisms",
    name: "Baptisms + Dedications",
    shortName: "Baptism",
    tagline: "Tasteful favours for family celebrations.",
    description: "Personalized favours for family and faith celebrations, on request.",
    ideas: ["Personalized favour labels", "Soft, classic colour themes"],
    themes: [
      { name: "Soft white + pastel", description: "Gentle white and pastel candy with the name and date on the tag. Sealed with a custom coloured ribbon." },
    ],
    accent: "teal",
    bannerImage: null,
    productIds: ["sweet"],
    featuredOnHome: false,
  },
  {
    id: "holidays",
    slug: "holidays",
    name: "Holidays",
    shortName: "Holidays",
    tagline: "Seasonal stashes for every holiday.",
    description:
      "Limited-time collections for Halloween, Christmas, Valentine’s Day, Easter and more.",
    ideas: ["Seasonal party favours", "Stocking and teacher treats", "Holiday-themed labels"],
    themes: [],
    accent: "orange",
    bannerImage: null,
    productIds: [],
    featuredOnHome: true,
  },
  {
    id: "other",
    slug: "other-celebrations",
    name: "Other Celebrations",
    shortName: "Other",
    tagline: "If it’s worth celebrating, it’s worth a stash.",
    description:
      "Graduations, anniversaries, teacher gifts, corporate gatherings, school events and more, by request.",
    ideas: ["Graduations", "Anniversaries", "Teacher gifts", "Corporate and school events"],
    themes: [
      { name: "Your colours", description: "Tell us your colours and occasion and we’ll make a matching bag with a custom tag. Sealed with a custom coloured ribbon." },
    ],
    accent: "orange",
    bannerImage: null,
    productIds: [],
    featuredOnHome: false,
  },
];

// Seasonal drops (brief §12). Vee switches status between coming_soon,
// available_now and closed. PLACEHOLDER: none are confirmed yet, so all
// start as coming_soon with no cutoff date.
export const seasonalCollections: SeasonalCollection[] = [
  {
    id: "halloween",
    slug: "halloween",
    name: "Halloween",
    description: "Trick-or-treat favours, Halloween party bags and spooky labels.",
    ideas: ["Trick-or-treat party favours", "Halloween event bags", "Spooky themed labels"],
    themes: [
      { name: "Spooky orange + black", description: "Orange and black candy with a “Happy Halloween” tag. Sealed with a custom coloured ribbon." },
      { name: "Trick-or-treat bags", description: "Fun mixed candy bags for trick-or-treaters, with a spooky tag. Sealed with a custom coloured ribbon." },
    ],
    accent: "orange",
    status: "coming_soon",
    orderCutoff: null,
    active: true,
  },
  {
    id: "christmas",
    slug: "christmas",
    name: "Christmas",
    description: "Giving is better than receiving, especially candy! Stocking treats, teacher gifts and holiday party favours.",
    ideas: ["Stocking treats", "Teacher gifts", "Holiday party favours"],
    themes: [
      { name: "Stocking stuffer holiday bags", description: "Red and green candy with a holiday message on the tag. Sealed with a custom coloured ribbon." },
      { name: "Secret Santa", description: "All-red candy with a “From your Secret Santa” tag. Sealed with a custom coloured ribbon." },
      { name: "Snowy night", description: "All-blue candy with a wintry holiday tag. Sealed with a custom coloured ribbon." },
    ],
    accent: "green",
    status: "coming_soon",
    orderCutoff: null,
    active: true,
  },
  {
    id: "new-years",
    slug: "new-years",
    name: "New Year’s",
    description: "Countdown party favours and sparkly treat bags to ring in the new year.",
    ideas: ["New Year’s Eve party favours", "Countdown treat bags"],
    themes: [
      { name: "New Year’s countdown", description: "Candy in your party colours with a “Happy New Year” tag. Sealed with a custom coloured ribbon." },
      { name: "Hello 2027", description: "Candy in your party colours with a “2027” tag. Sealed with a gold ribbon." },
    ],
    accent: "gold",
    status: "coming_soon",
    orderCutoff: null,
    active: true,
  },
  {
    id: "valentines",
    slug: "valentines-day",
    name: "Valentine’s Day",
    description: "Sweet gifting, classroom favours and cute recipient messages.",
    ideas: ["Sweet gifts", "Classroom or party favours", "Cute recipient messages"],
    themes: [
      { name: "Love day", description: "Pink and red candy with a sweet message on the tag. Sealed with a custom coloured ribbon." },
      { name: "Someone special", description: "Give a valentine to someone special, with their name on the tag. Sealed with a custom coloured ribbon." },
    ],
    accent: "red",
    status: "coming_soon",
    orderCutoff: null,
    active: true,
  },
  {
    id: "easter",
    slug: "easter",
    name: "Easter",
    description: "Spring colours and treat favours.",
    ideas: ["Spring-coloured favours", "Treat bags"],
    themes: [
      { name: "Spring pastels", description: "Pastel candy with a “Happy Easter” tag. Sealed with a custom coloured ribbon." },
      { name: "Easter hunt", description: "The grand prize the Easter Bunny left just for you! A candy bag with a custom tag. Sealed with a custom coloured ribbon." },
    ],
    accent: "pink",
    status: "coming_soon",
    orderCutoff: null,
    active: true,
  },
];

export const getOccasion = (slug: string) => occasions.find((o) => o.slug === slug);
