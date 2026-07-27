import React from "react";
import { 
  Users, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  PlusCircle, 
  CheckCircle, 
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { Student, Journal, Material } from "../types";

interface DashboardProps {
  students: Student[];
  journals: Journal[];
  materials: Material[];
  onNavigate: (tab: string) => void;
  username: string;
}

export default function Dashboard({ students, journals, materials, onNavigate, username }: DashboardProps) {
  // Stats calculations
  const totalStudents = students.length;
  const maleCount = students.filter(s => s.gender === "L").length;
  const femaleCount = students.filter(s => s.gender === "P").length;
  const totalJournals = journals.length;
  const totalMaterials = materials.length;
  const completedJournals = journals.filter(j => j.status === "Selesai").length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-radial from-slate-900 via-slate-800 to-slate-950 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/25 text-blue-300 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            🏫 SMAN 1 Kediri
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">
            {getGreeting()}
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm md:text-base">
            Selamat datang di portal Asisten Guru Digital. Kelola data siswa, lakukan absensi harian, catat jurnal pembelajaran, unggah materi ajar, dan cetak laporan resmi ber-kop surat dengan rapi.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Siswa */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Siswa</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 font-display">{totalStudents}</h3>
              <p className="text-xs text-slate-500 mt-2">
                <span className="text-blue-600 font-semibold">{maleCount} L</span> • <span className="text-pink-600 font-semibold">{femaleCount} P</span>
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Stat 2: Jurnal Mengajar */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Jurnal Guru</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 font-display">{totalJournals}</h3>
              <p className="text-xs text-slate-500 mt-2">
                <span className="text-emerald-600 font-semibold">{completedJournals} Selesai</span> / {totalJournals} Total
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Stat 3: Materi Ajar */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Materi Ajar</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 font-display">{totalMaterials}</h3>
              <p className="text-xs text-slate-500 mt-2">
                Tersimpan di cloud penyimpanan
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Stat 4: Kelas Aktif */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Tingkat Kelas</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 font-display">3</h3>
              <p className="text-xs text-slate-500 mt-2">
                Kelas X, XI, dan XII (Ruang A-K)
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" /> Akses Cepat Guru
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate("siswa")}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition-all rounded-xl border border-slate-200 group text-left"
          >
            <div>
              <h4 className="font-semibold text-slate-800 group-hover:text-blue-800 text-sm">Data Siswa</h4>
              <p className="text-xs text-slate-400 mt-1">Kelola biodata siswa & NISN</p>
            </div>
            <PlusCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            onClick={() => onNavigate("absensi")}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition-all rounded-xl border border-slate-200 group text-left"
          >
            <div>
              <h4 className="font-semibold text-slate-800 group-hover:text-blue-800 text-sm">Isi Absensi</h4>
              <p className="text-xs text-slate-400 mt-1">Rekap kehadiran siswa</p>
            </div>
            <CheckCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            onClick={() => onNavigate("nilai")}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition-all rounded-xl border border-slate-200 group text-left"
          >
            <div>
              <h4 className="font-semibold text-slate-800 group-hover:text-blue-800 text-sm">Input Nilai</h4>
              <p className="text-xs text-slate-400 mt-1">Kelola tugas & penilaian</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            onClick={() => onNavigate("jurnal")}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 transition-all rounded-xl border border-slate-200 group text-left"
          >
            <div>
              <h4 className="font-semibold text-slate-800 group-hover:text-blue-800 text-sm">Jurnal Guru</h4>
              <p className="text-xs text-slate-400 mt-1">Catat topik/materi mengajar</p>
            </div>
            <PlusCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Two Column Section: Recent Jurnals & App Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jurnals List */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Catatan Jurnal Mengajar Terakhir</h2>
            <button 
              onClick={() => onNavigate("jurnal")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="space-y-3">
            {journals.length === 0 ? (
              <p className="text-slate-400 text-center py-6 text-sm">Belum ada catatan jurnal.</p>
            ) : (
              journals.slice(0, 3).map((journal) => (
                <div key={journal.id} className="p-4 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-200 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-150 px-2 py-0.5 rounded">
                        {journal.class}
                      </span>
                      <span className="text-xs text-slate-400">{journal.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">{journal.subject}</h4>
                    <p className="text-xs text-slate-500 font-medium">Materi: {journal.topic}</p>
                    <p className="text-[11px] text-slate-400">Kehadiran: {journal.attendanceCount}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    journal.status === "Selesai" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                      : "bg-amber-50 text-amber-750 border border-amber-200"
                  }`}>
                    {journal.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* School Information */}
        <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
              🏫
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-white text-base">Profil SMAN 1 KEDIRI</h3>
              <p className="text-xs text-slate-400">Terakreditasi A, Jalan Veteran No. 1, Kediri</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sebagai salah satu sekolah rujukan di Jawa Timur, SMAN 1 Kediri mengedepankan efektivitas, transparansi, dan digitalisasi administrasi pembelajaran bagi seluruh guru dan siswa.
            </p>
          </div>
          <div className="border-t border-slate-800 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>Versi: 2026.1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
