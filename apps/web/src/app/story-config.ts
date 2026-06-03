export type StoryDefinition = {
  name: string;
  storyPath: string;
  gallery?: string | string[];
};

export const CURRENT_BENEFICIARY = {
  name: "Připravujeme",
  status: "preparing",
} as const;

const ELISKA_STORY: StoryDefinition = {
  name: "Eliška",
  storyPath: "/elis-story.md",
  gallery: "Eliska",
};

const DANIK_STORY: StoryDefinition = {
  name: "Daneček",
  storyPath: "/danik-story.md",
};

const ELEN_STORY: StoryDefinition = {
  name: "Elen",
  storyPath: "/elen-story.md",
};

const HISTORY_STORIES_BY_YEAR: Record<string, StoryDefinition> = {
  "2024": ELEN_STORY,
  "2025": DANIK_STORY,
  "2026": ELISKA_STORY,
};

function normalizeStoryKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getHistoryStoryByName(name: string): StoryDefinition | undefined {
  const normalized = normalizeStoryKey(name);

  if (!normalized) return undefined;

  if (normalized.includes("eliska")) return ELISKA_STORY;
  if (normalized.includes("danik")) return DANIK_STORY;
  if (normalized.includes("danecek")) return DANIK_STORY;
  if (normalized.includes("dana")) return DANIK_STORY;
  if (normalized.includes("elen")) return ELEN_STORY;
  if (normalized.includes("elena")) return ELEN_STORY;

  return undefined;
}

export function getHistoryStoryForBeneficiary(
  year: string,
  name: string
): StoryDefinition | undefined {
  return HISTORY_STORIES_BY_YEAR[year] ?? getHistoryStoryByName(name);
}
