// lib/expert-system/rules.ts

/**
 * Damage Level:
 * A = Ringan
 * B = Sedang
 * C = Berat
 */
export type DamageLevel = "A" | "B" | "C";

/**
 * Rule interface untuk Forward Chaining
 */
export interface Rule {
  id: string;
  symptoms: number[];
  operator: "AND" | "OR";
  level: DamageLevel;
  damage: string;
  solution: string;
}

/**
 * RULE BASE
 * - OR  : aturan paralel (satu gejala cukup)
 * - AND : aturan sekuensial (kombinasi gejala)
 */
export const rules: Rule[] = [
  {
    id: "R1",
    symptoms: [1],
    operator: "OR",
    level: "A",
    damage: "Jenis Kerusakan = Motor tidak menghasilkan torsi awal akibat kerusakan pada kapasitor, gulungan start yang putus, atau suplai listrik yang tidak mengalir ke motor.",
    solution: "Solusi = Periksa kondisi kapasitor start, cek kontinuitas gulungan, serta ukur tegangan suplai listrik. Ganti kapasitor apabila terbakar atau mengalami kerusakan. Perbaikan cepat dan pemeriksaan menyeluruh sangat penting agar motor dapat beroperasi kembali dengan normal"
  },
  {
    id: "R2",
    symptoms: [2],
    operator: "OR",
    level: "B",
    damage: "Jenis Kerusakan = Motor gagal start meskipun arus masuk, akibat nilai kapasitor menurun atau kapasitor mengalami kerusakan.",
    solution: "Solusi = Ganti kapasitor sesuai dengan spesifikasi yang ditentukan. Setelah penggantian, lakukan pengujian motor untuk memastikan kerusakan telah teratasi dan motor dapat berfungsi kembali secara normal. Perbaikan ini harus segera dilakukan."
  },
  {
    id: "R3",
    symptoms: [3],
    operator: "OR",
    level: "A",
    damage: "Jenis Kerusakan = Torsi motor tidak optimal akibat tegangan drop atau kapasitor melemah.",
    solution: "Solusi = Periksa sumber listrik dan pastikan tegangan sesuai dengan spesifikasi motor. Jika terjadi penurunan tegangan, perbaiki atau ganti sumber listrik yang stabil. Selain itu, lakukan pemeriksaan pada sensor dan rangkaian kontrol untuk memastikan tidak terdapat gangguan yang menyebabkan kesalahan deteksi suplai. Ganti kapasitor sesuai dengan spesifikasi yang ditentukan. Perbaikan ini harus segera dilakukan."
  },
  {
    id: "R4",
    symptoms: [4],
    operator: "OR",
    level: "B",
    damage: "Jenis Kerusakan = Arus berlebih pada kumparan akibat beban berlebih atau terjadinya short winding pada gulungan.",
    solution: "Solusi = Matikan motor dan lakukan pemeriksaan visual pada gulungan untuk mendeteksi kerusakan fisik seperti terbakar atau putus. Kurangi beban kerja motor dan lakukan proses rewinding apabila diperlukan. Perbaikan ini harus segera dilakukan."
  },
  {
    id: "R5",
    symptoms: [5],
    operator: "OR",
    level: "C",
    damage: "Jenis Kerusakan = Gulungan terbakar akibat isolasi kawat yang rusak karena panas berlebih, disebabkan oleh hubung singkat (short circuit) atau kerusakan pada cooling fan.",
    solution: "Solusi = Periksa penyebab utama kerusakan, seperti overheating atau tegangan berlebih, agar kejadian serupa tidak terulang. Lakukan proses rewinding pada gulungan yang rusak serta periksa kondisi cooling fan untuk memastikan sistem pendinginan berfungsi dengan baik. Perbaikan cepat dan pemeriksaan menyeluruh sangat penting."
  },
  {
    id: "R6",
    symptoms: [6],
    operator: "OR",
    level: "B",
    damage: "Jenis Kerusakan = Proteksi kelistrikan aktif akibat arus berlebih, yang disebabkan oleh hubung singkat atau beban berlebih.",
    solution: "Solusi = Periksa tegangan dan arus input, pastikan sesuai spesifikasi, perbaiki instalasi atau sumber listrik yang bermasalah. Perbaikan ini harus segera dilakukan."
  },
  {
    id: "R7",
    symptoms: [7],
    operator: "OR",
    level: "B",
    damage: "Jenis Kerusakan = Putaran motor tidak seimbang akibat bearing miring, aus, atau kekurangan pelumasan.",
    solution: "Solusi = Lakukan penggantian bearing yang rusak, periksa komponen terkait untuk mencegah kerusakan berulang, lakukan alignment, pelumasan (greasing). Perbaikan ini harus segera dilakukan."
  },
  {
    id: "R8",
    symptoms: [8],
    operator: "OR",
    level: "C",
    damage: "Jenis Kerusakan = Gesekan mekanis berlebih akibat komponen mekanis yang miring atau mengalami keausan.",
    solution: "Solusi = Lakukan pemeriksaan pada komponen motor, terutama bagian yang bergerak, dan lakukan penyetelan atau penggantian jika diperlukan. Perbaikan ini harus segera dilakukan."
  },
  {
    id: "R9",
    symptoms: [9],
    operator: "OR",
    level: "C",
    damage: "Jenis Kerusakan = Kerusakan fisik pada kapasitor akibat tegangan berlebih (overvoltage) atau usia kapasitor yang sudah tua.",
    solution: "Solusi = Ganti kapasitor sesuai dengan spesifikasi yang ditentukan. Setelah penggantian, lakukan pengujian motor untuk memastikan kerusakan telah teratasi dan motor dapat berfungsi kembali secara normal. Perbaikan cepat dan pemeriksaan menyeluruh sangat penting."
  },
  {
    id: "R10",
    symptoms: [10],
    operator: "OR",
    level: "B",
    damage: "Jenis Kerusakan = Efisiensi motor menurun akibat kapasitor mengalami penurunan nilai atau lilitan gulungan melemah.",
    solution: "Solusi = Lakukan pengukuran nilai kapasitor dan resistansi gulungan untuk memastikan keduanya masih sesuai spesifikasi. Ganti kapasitor atau lakukan perbaikan gulungan apabila hasil pengukuran tidak normal. Perbaikan ini harus segera dilakukan."
  }
];
