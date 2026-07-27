import { doc, getDoc, setDoc, writeBatch, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { Student, Journal, Material } from "./types";

const defaultStudents: Student[] = [
  { id: "stud_1", name: "Adi Saputra", class: "X", room: "A", gender: "L" },
  { id: "stud_2", name: "Aisyah Nurhaliza", class: "X", room: "A", gender: "P" },
  { id: "stud_3", name: "Bagus Triantoro", class: "X", room: "A", gender: "L" },
  { id: "stud_4", name: "Cahaya Indah", class: "X", room: "B", gender: "P" },
  { id: "stud_5", name: "Deni Ramadhan", class: "XI", room: "A", gender: "L" },
  { id: "stud_6", name: "Eka Rahmawati", class: "XI", room: "A", gender: "P" },
  { id: "stud_7", name: "Fajar Nugroho", class: "XI", room: "B", gender: "L" },
  { id: "stud_8", name: "Gita Lestari", class: "XII", room: "A", gender: "P" },
  { id: "stud_9", name: "Hadi Kusuma", class: "XII", room: "A", gender: "L" },
  { id: "stud_10", name: "Irmawati", class: "XII", room: "B", gender: "P" },
];

const defaultJournals: Journal[] = [
  {
    id: "journ_1",
    date: "2026-07-10",
    class: "X-A",
    subject: "Matematika",
    topic: "Sistem Persamaan Linier Dua Variabel",
    attendanceCount: "3 Hadir, 0 Sakit, 0 Izin",
    status: "Selesai"
  },
  {
    id: "journ_2",
    date: "2026-07-11",
    class: "XI-A",
    subject: "Matematika",
    topic: "Matriks dan Determinan",
    attendanceCount: "2 Hadir, 0 Sakit, 0 Izin",
    status: "Selesai"
  },
  {
    id: "journ_3",
    date: "2026-07-12",
    class: "XII-A",
    subject: "Matematika",
    topic: "Turunan Fungsi Trigonometri",
    attendanceCount: "2 Hadir, 0 Sakit, 0 Izin",
    status: "Belum Selesai"
  }
];

const defaultMaterials: Material[] = [
  {
    id: "mat_1",
    title: "Buku Saku Aljabar Linear",
    subject: "Matematika",
    classScope: "X-A",
    content: "Materi pengenalan matriks dasar, operasi penjumlahan, perkalian skalar, perkalian antar matriks, dan pencarian determinan matriks ordo 2x2.",
    link: "https://drive.google.com/drive/folders/sman1kediri",
    createdAt: "2026-07-08"
  },
  {
    id: "mat_2",
    title: "Modul Trigonometri Praktis",
    subject: "Matematika",
    classScope: "XII-A",
    content: "Rumus cepat turunan trigonometri sin(x), cos(x), tan(x) serta pengembangannya menggunakan aturan rantai turunan fungsi komposisi.",
    link: "https://smastkediri.sch.id/materi",
    createdAt: "2026-07-12"
  }
];

async function seedCollection<T extends { id: string }>(colName: string, items: T[]) {
  const snap = await getDocs(collection(db, colName));
  if (!snap.empty) return;
  const batch = writeBatch(db);
  items.forEach((item) => batch.set(doc(db, colName, item.id), item));
  await batch.commit();
}

export async function ensureDefaultSeeding() {
  try {
    const profileRef = doc(db, "profile", "teacher");
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        username: "matdigital",
        passwordHash: "faisperwira"
      });
    }

    await seedCollection("students", defaultStudents);
    await seedCollection("journals", defaultJournals);
    await seedCollection("materials", defaultMaterials);
  } catch (error) {
    console.error("Error seeding default data:", error);
  }
}
