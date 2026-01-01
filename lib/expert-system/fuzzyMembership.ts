export type FuzzyLevel = "Tidak" | "Jarang" | "Ya";

/**
 * Mapping input user → nilai CF
 */
export function fuzzyLevelToValue(level: FuzzyLevel): number {
  switch (level) {
    case "Tidak":
      return 0;
    case "Jarang":
      return 0.5;
    case "Ya":
      return 1;
    default:
      return 0;
  }
}
