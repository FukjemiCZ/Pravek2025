export type StoryDefinition = {
  name: string;
  storyPath: string;
  gallery?: string | string[];
  paymentMessageName?: string;
};

export const CURRENT_BENEFICIARY_STORY: StoryDefinition = {
  name: "Elen",
  storyPath: "/elen-story.md",
  paymentMessageName: "Elen",
};

const HISTORY_STORIES: Record<string, StoryDefinition> = {
  eliska: {
    name: "Eliška",
    storyPath: "/elis-story.md",
    gallery: "Eliska",
  },
  eliska2: {
    name: "Eliška",
    storyPath: "/elis-story.md",
    gallery: "Eliska",
  },
  eliscin: {
    name: "Eliška",
    storyPath: "/elis-story.md",
    gallery: "Eliska",
  },
  danik: {
    name: "Daník",
    storyPath: "/danik-story.md",
  },
  danecek: {
    name: "Daneček",
    storyPath: "/danik-story.md",
  },
  dana: {
    name: "Dáňa",
    storyPath: "/danik-story.md",
  },
  elen: {
    name: "Elen",
    storyPath: "/elen-story.md",
  },
  elena: {
    name: "Elena",
    storyPath: "/elen-story.md",
  },
};

function normalizeStoryKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getHistoryStoryForBeneficiary(name: string): StoryDefinition | undefined {
  const normalized = normalizeStoryKey(name);

  if (!normalized) return undefined;

  if (normalized.includes("eliska")) return HISTORY_STORIES.eliska;
  if (normalized.includes("danik")) return HISTORY_STORIES.danik;
  if (normalized.includes("danecek")) return HISTORY_STORIES.danecek;
  if (normalized.includes("dana")) return HISTORY_STORIES.dana;
  if (normalized.includes("elen")) return HISTORY_STORIES.elen;
  if (normalized.includes("elena")) return HISTORY_STORIES.elena;

  return undefined;
}
