const STYLE_PREFIX =
  "Chinese traditional woodblock print, black and white, high contrast, " +
  "bold knife-carved lines, ink on rice paper, hand-carved woodblock texture, " +
  "strong black and white contrast, minimalist background, printmaking aesthetic, " +
  "monochrome, linocut style, wood engraving";

const subjectMap: Record<string, string> = {
  神鸟: "a mythical divine bird with elaborate spreading plumage and crested head, soaring",
  异兽: "a fantastical beast creature with muscular body, fierce features and flowing mane",
  玄鲲: "a mystical giant fish kun from Chinese mythology, immense scale, breaking through waves",
  白泽: "a baize mythical creature, wise and regal, with luminous eyes and horned head",
  火凤: "a fire phoenix with spreading wings engulfed in flames and trailing embers",
  鹿隐: "an ethereal deer partially hidden in mountain mist, antlers adorned with vine patterns",
  麒麟: "a qilin mythical beast, majestic and powerful, scaled body with single horn",
  山鬼: "a mountain spirit figure, mysterious feminine form draped in flowing leaves and vines",
};

const moodMap: Record<string, string> = {
  威严: "majestic and imposing composition, dramatic lighting, authoritative pose",
  神秘: "mysterious and ethereal atmosphere, misty, partially obscured, enigmatic",
  灵动: "dynamic and flowing movement, captured mid-motion, sense of life and energy",
  凶猛: "fierce and powerful expression, aggressive pose, sharp angular lines",
  祥瑞: "auspicious and harmonious design, balanced composition, benevolent presence",
  宁静: "serene and peaceful mood, gentle curves, contemplative stillness",
  飘逸: "graceful and flowing, wind-swept elements, weightless and ethereal",
  磅礴: "grand and monumental scale, epic composition, overwhelming power",
};

const NEGATIVE_PROMPT =
  "color, grayscale, photorealistic, 3D render, soft edges, watercolor, " +
  "oil painting, modern art, cartoon, anime, low contrast, blurry, " +
  "smooth gradients, realistic shading, multiple colors, pastel, sketch";

export function buildPrompt({
  origin,
  mood,
  patterns,
  notes,
}: {
  origin: string;
  mood: string;
  patterns: string[];
  notes?: string;
}): { prompt: string; negativePrompt: string } {
  const parts: string[] = [STYLE_PREFIX];

  // Subject
  let subject = subjectMap[origin];
  if (!subject) {
    // Try partial match
    for (const [key, desc] of Object.entries(subjectMap)) {
      if (origin.includes(key) || key.includes(origin)) {
        subject = desc;
        break;
      }
    }
    if (!subject) {
      subject = `a mythical creature described as: ${origin}`;
    }
  }
  parts.push(subject);

  // Mood
  const moodDesc = moodMap[mood];
  if (moodDesc) {
    parts.push(moodDesc);
  }

  // Patterns
  if (patterns.length > 0) {
    parts.push(
      `decorated with traditional Chinese ${patterns.join(", ")} patterns woven into the design`
    );
  }

  // User notes
  if (notes?.trim()) {
    parts.push(`Additional guidance: ${notes.trim()}`);
  }

  return {
    prompt: parts.join(". ") + ".",
    negativePrompt: NEGATIVE_PROMPT,
  };
}
