import { rules } from "./rules";
import { symptoms } from "./symptoms";
import { FuzzyLevel, fuzzyLevelToValue } from "./fuzzyMembership";

/* =======================
   TYPES
======================= */

export interface DiagnosisResult {
  level: "A" | "B" | "C";
  damage: string;
  solution: string;
  confidence: number; // 0.0 - 1.0
}

export interface DiagnosisSummary {
  cfTotal: number;     // 0 - 10
  percent: number;     // 0 - 100
  level: "A" | "B" | "C";
  label: string;
}

export type UserAnswer = FuzzyLevel;
export type UserAnswers = Record<number, UserAnswer>;

/* =======================
   SUMMARY CALCULATION
======================= */

export function calculateDiagnosisSummary(
  results: DiagnosisResult[]
): DiagnosisSummary | null {
  if (results.length === 0) return null;

  // Rata-rata CF (0–1)
  const avgCF =
    results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

  // Skala 0–10
  const cfTotal = avgCF * 10;

  // Skala 0–100%
  const percent = cfTotal * 10;

  let level: "A" | "B" | "C";
  let label: string;

  if (percent < 40) {
    level = "A";
    label = "Ringan";
  } else if (percent < 70) {
    level = "B";
    label = "Sedang";
  } else {
    level = "C";
    label = "Berat";
  }

  return {
    cfTotal: Number(cfTotal.toFixed(2)),
    percent: Number(percent.toFixed(1)),
    level,
    label
  };
}

/* =======================
   DIAGNOSIS ENGINE
======================= */

export function diagnoseForward(
  answers: UserAnswers
): DiagnosisResult[] {

  /* ===== 1. HITUNG EVIDENCE ===== */
  const evidenceCF = new Map<number, number>();

  for (const symptom of symptoms) {
    const answer = answers[symptom.id];
    if (!answer) continue;

    const cfUser = fuzzyLevelToValue(answer); // 0 / 0.5 / 1
    const cfEvidence = cfUser * symptom.cfExpert;

    if (cfEvidence > 0) {
      evidenceCF.set(symptom.id, cfEvidence);
    }
  }

  /* ===== 2. AND RULE (PRIORITAS) ===== */
  const andResults: DiagnosisResult[] = [];

  for (const rule of rules) {
    if (rule.operator !== "AND") continue;

    const cfList: number[] = [];

    for (const sid of rule.symptoms) {
      if (evidenceCF.has(sid)) {
        cfList.push(evidenceCF.get(sid)!);
      }
    }

    if (cfList.length === rule.symptoms.length) {
      const ruleCF = Math.min(...cfList);

      if (ruleCF > 0) {
        andResults.push({
          level: rule.level,
          damage: rule.damage,
          solution: rule.solution,
          confidence: Number(ruleCF.toFixed(3))
        });
      }
    }
  }

  if (andResults.length > 0) {
    const priority = { C: 3, B: 2, A: 1 };

    return andResults
      .sort((a, b) => priority[b.level] - priority[a.level])
      .slice(0, 1);
  }

  /* ===== 3. OR RULE ===== */
  const orResults: DiagnosisResult[] = [];

  for (const rule of rules) {
    if (rule.operator !== "OR") continue;

    const cfList: number[] = [];

    for (const sid of rule.symptoms) {
      if (evidenceCF.has(sid)) {
        cfList.push(evidenceCF.get(sid)!);
      }
    }

    if (cfList.length > 0) {
      const ruleCF = Math.max(...cfList);

      if (ruleCF > 0) {
        orResults.push({
          level: rule.level,
          damage: rule.damage,
          solution: rule.solution,
          confidence: Number(ruleCF.toFixed(3))
        });
      }
    }
  }

  const priority = { C: 3, B: 2, A: 1 };

  return orResults.sort(
    (a, b) => priority[b.level] - priority[a.level]
  );
}
