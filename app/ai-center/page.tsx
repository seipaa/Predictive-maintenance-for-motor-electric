"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { symptoms } from "@/lib/expert-system/symptoms";
import { rules } from "@/lib/expert-system/rules";
import { fuzzyLevelToValue } from "@/lib/expert-system/fuzzyMembership";

/* =======================
   TYPES
======================= */
interface MLPredictionResult {
  healthScore: number;
  healthCategory: string;
  topFeatures: string[];
  timestamp: string;
}

type UserAnswer = "Tidak" | "Jarang" | "Ya";

interface DiagnosisResult {
  id: string;
  level: "A" | "B" | "C";
  damage: string;
  solution: string;
  cfRule: number;
}

/* =======================
   LEVEL SCORE
======================= */
const levelScore: Record<"A" | "B" | "C", number> = {
  A: 40,
  B: 70,
  C: 100,
};

export default function AICenterPage() {
  /* ===== ML ===== */
  const [mlResult, setMlResult] = useState<MLPredictionResult | null>(null);
  const [isLoadingML, setIsLoadingML] = useState(false);

  /* ===== EXPERT SYSTEM ===== */
  const [answers, setAnswers] = useState<Record<number, UserAnswer>>({});
  const [results, setResults] = useState<DiagnosisResult[]>([]);
  const [conclusion, setConclusion] = useState<{
    percent: number;
    label: string;
  } | null>(null);

  /* =======================
     ML PREDICTION
  ======================= */
  const runMLPrediction = async () => {
    setIsLoadingML(true);
    try {
      const res = await fetch("/api/ml/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      setMlResult(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingML(false);
    }
  };

  /* =======================
     UI HELPERS
  ======================= */
  const getLevelLabel = (level: "A" | "B" | "C") =>
    level === "A" ? "Ringan" : level === "B" ? "Sedang" : "Berat";

  const getLevelColor = (level: "A" | "B" | "C") =>
    level === "A"
      ? "bg-green-100 text-green-800"
      : level === "B"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  /* =======================
     DIAGNOSIS (LOGIKA BARU)
  ======================= */
  const runDiagnosis = () => {
    const output: DiagnosisResult[] = [];

    rules.forEach((rule) => {
      const cfValues: number[] = [];

      rule.symptoms.forEach((sid) => {
        const userAnswer = answers[sid];
        const expertCF = symptoms.find((s) => s.id === sid)?.cfExpert;

        if (userAnswer && expertCF !== undefined) {
          const userCF = fuzzyLevelToValue(userAnswer);
          cfValues.push(userCF * expertCF);
        }
      });

      if (cfValues.length === 0) return;

      const cfRule =
        rule.operator === "OR"
          ? Math.max(...cfValues)
          : Math.min(...cfValues);

      if (cfRule > 0) {
        output.push({
          id: rule.id,
          level: rule.level,
          damage: rule.damage,
          solution: rule.solution,
          cfRule: Number(cfRule.toFixed(2)),
        });
      }
    });

    setResults(output);
    calculateConclusion(output);
  };

  /* =======================
     KESIMPULAN (LEVEL)
  ======================= */
  const calculateConclusion = (data: DiagnosisResult[]) => {
  if (data.length === 0) {
    setConclusion(null);
    return;
  }

  const totalScore = data.reduce(
    (sum, r) => sum + levelScore[r.level],
    0
  );

  const percent = (totalScore / (data.length * 100)) * 100;

  let label: string;

  if (percent <= 40) {
    label = "Ringan";
  } else if (percent <= 70) {
    label = "Sedang";
  } else {
    label = "Berat";
  }

  setConclusion({
    percent: Number(percent.toFixed(1)),
    label,
  });
};


  /* =======================
     UI
  ======================= */
  return (
    <div className="container mx-auto p-6 space-y-8">

      {/* ===== ML HEALTH PREDICTION (ATAS) ===== */}
      <div className="card">
        <h2 className="text-xl font-bold mb-3">
          ML Health Prediction
        </h2>

        <button
          onClick={runMLPrediction}
          className="btn-primary mb-2"
        >
          {isLoadingML ? "Running..." : "Run Prediction"}
        </button>

        {mlResult && (
          <p className="text-sm text-gray-600">
            Updated: {formatDate(mlResult.timestamp)}
          </p>
        )}
      </div>

      {/* ===== SISTEM PAKAR ===== */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">
          Sistem Pakar Diagnosis Motor
        </h2>

        <div className="space-y-4">
          {symptoms.map((symptom) => (
            <div
              key={symptom.id}
              className="p-4 border rounded bg-gray-50"
            >
              <p className="font-medium mb-2">
                {symptom.question}
              </p>

              <div className="flex gap-4">
                {(["Tidak", "Jarang", "Ya"] as UserAnswer[]).map(
                  (option) => (
                    <label
                      key={option}
                      className="flex items-center gap-1"
                    >
                      <input
                        type="radio"
                        name={`symptom-${symptom.id}`}
                        checked={answers[symptom.id] === option}
                        onChange={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [symptom.id]: option,
                          }))
                        }
                      />
                      {option}
                    </label>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={runDiagnosis}
          className="btn-secondary w-full mt-6"
        >
          Jalankan Diagnosis
        </button>

        {/* ===== HASIL ===== */}
        {results.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-bold">
              Hasil Diagnosis
            </h3>

            {results.map((r) => (
              <div key={r.id} className="p-4 border rounded">
                <span
                  className={`px-3 py-1 rounded ${getLevelColor(
                    r.level
                  )}`}
                >
                  {getLevelLabel(r.level)}
                </span>

                <p className="mt-2 font-medium">{r.damage}</p>
                <p className="text-sm text-gray-600">
                  {r.solution}
                </p>

                <p className="text-sm font-semibold mt-1">
                  CF Rule: {r.cfRule} / 1
                </p>
              </div>
            ))}

            {conclusion && (
              <div className="mt-6 p-4 border rounded bg-blue-50">
                <h4 className="font-bold text-lg mb-1">
                  Kesimpulan Akhir
                </h4>

                <p className="text-md mt-1">
                  <strong>{conclusion.label}</strong> dengan nilai{" "}
                  <strong>{conclusion.percent}%</strong>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
