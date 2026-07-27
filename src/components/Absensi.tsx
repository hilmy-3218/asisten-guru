import React, { useState, useEffect } from "react";
import { 
  ClipboardCheck, 
  Calendar, 
  Printer, 
  Save, 
  Check, 
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { Student, AttendanceRecord } from "../types";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import KopSurat from "./KopSurat";
import CustomAlertModal from "./CustomAlertModal";

interface AbsensiProps {
  students: Student[];
}

export default function Absensi({ students }: AbsensiProps) {
  // Query Filters
  const [selectedClass, setSelectedClass] = useState<'X' | 'XI' | 'XII'>("X");
  const [selectedRoom, setSelectedRoom] = useState<string>("A");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Loaded Student List
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  
  // Attendance Records: studentId -> status
  const [attendance, setAttendance] = useState<{ [studentId: string]: 'hadir' | 'sakit' | 'izin' | 'alpa' }>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const classes: Array<'X' | 'XI' | 'XII'> = ["X", "XI", "XII"];
  const rooms = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

  // Update students listing when filter changes
  useEffect(() => {
    const filtered = students.filter(
      s => s.class === selectedClass && s.room === selectedRoom
    );
    setClassStudents(filtered);
  }, [students, selectedClass, selectedRoom]);

  // Load attendance records from Firebase when filters change
  useEffect(() => {
    async function loadAttendance() {
      if (classStudents.length === 0) {
        setAttendance({});
        return;
      }

      setIsLoading(true);
      setSaveStatus('idle');
      
      const docId = `${selectedDate}_${selectedClass}_${selectedRoom}`;
      const docRef = doc(db, "attendance", docId);
      
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as AttendanceRecord;
          // Set loaded records
          const records = data.records || {};
          
          // Ensure any newly added student has a default 'hadir' status
          const updatedRecords = { ...records };
          classStudents.forEach(student => {
            if (!updatedRecords[student.id]) {
              updatedRecords[student.id] = 'hadir';
            }
          });
          setAttendance(updatedRecords);
        } else {
          // Initialize everyone as 'hadir' (default)
          const initialRecords: { [key: string]: 'hadir' | 'sakit' | 'izin' | 'alpa' } = {};
          classStudents.forEach(student => {
            initialRecords[student.id] = 'hadir';
          });
          setAttendance(initialRecords);
        }
      } catch (err) {
        console.error("Gagal memuat absensi:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAttendance();
  }, [selectedClass, selectedRoom, selectedDate, classStudents]);

  // Handle single attendance toggle
  const handleStatusChange = (studentId: string, status: 'hadir' | 'sakit' | 'izin' | 'alpa') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Set all students to a specific status (e.g. all Hadir)
  const handleMarkAll = (status: 'hadir' | 'sakit' | 'izin' | 'alpa') => {
    const updated: { [key: string]: 'hadir' | 'sakit' | 'izin' | 'alpa' } = {};
    classStudents.forEach(student => {
      updated[student.id] = status;
    });
    setAttendance(updated);
  };

  // Save attendance to Firebase Firestore
  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    const docId = `${selectedDate}_${selectedClass}_${selectedRoom}`;
    const docRef = doc(db, "attendance", docId);

    try {
      await setDoc(docRef, {
        id: docId,
        date: selectedDate,
        class: selectedClass,
        room: selectedRoom,
        records: attendance
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error("Gagal menyimpan rekap absensi:", err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Dialog State
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: "info" | "warning" | "success" | "danger";
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const closeDialog = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Trigger print view
  const handlePrint = () => {
    const isIframe = window.self !== window.top;
    if (isIframe) {
      setDialog({
        isOpen: true,
        type: "info",
        title: "Petunjuk Cetak PDF",
        message: "Aplikasi berjalan di dalam frame preview AI Studio.\n\nUntuk mencetak laporan dengan Kop Resmi secara sempurna:\n1. Klik tombol 'Open in new tab' (ikon panah/layar di kanan atas preview).\n2. Di tab baru tersebut, silakan klik kembali tombol 'Cetak PDF'.",
        confirmLabel: "Lanjutkan Cetak",
        cancelLabel: "Batal",
        onCancel: closeDialog,
        onConfirm: () => {
          closeDialog();
          try {
            window.print();
          } catch (e) {
            console.error(e);
          }
        }
      });
    } else {
      try {
        window.print();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Printable Area - Hidden on browser, visible on print only */}
      <div className="print-only print-card font-sans text-slate-950 p-6">
        <KopSurat />
        <div className="text-center my-6">
          <h2 className="text-lg font-bold uppercase tracking-wider">Laporan Kehadiran Siswa</h2>
          <p className="text-sm text-slate-700 mt-1">
            Kelas: <span className="font-semibold">{selectedClass}-{selectedRoom}</span> | Tanggal: <span className="font-semibold">{selectedDate}</span>
          </p>
        </div>

        <table className="w-full border-collapse border border-slate-400 text-sm mt-4">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-400 px-4 py-2.5 text-center w-12">No</th>
              <th className="border border-slate-400 px-4 py-2.5 text-left">Nama Siswa</th>
              <th className="border border-slate-400 px-4 py-2.5 text-center w-24">L/P</th>
              <th className="border border-slate-400 px-4 py-2.5 text-center w-40">Status Kehadiran</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.length === 0 ? (
              <tr>
                <td colSpan={4} className="border border-slate-400 px-4 py-10 text-center text-slate-500">
                  Tidak ada data siswa di kelas ini.
                </td>
              </tr>
            ) : (
              classStudents.map((student, idx) => (
                <tr key={student.id}>
                  <td className="border border-slate-400 px-4 py-2 text-center">{idx + 1}</td>
                  <td className="border border-slate-400 px-4 py-2 font-semibold text-slate-900">{student.name}</td>
                  <td className="border border-slate-400 px-4 py-2 text-center">{student.gender}</td>
                  <td className="border border-slate-400 px-4 py-2 text-center font-semibold uppercase text-xs">
                    {attendance[student.id] || "Hadir"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Attendance Statistics for Print */}
        <div className="mt-6 flex justify-between items-start text-xs border-t border-slate-200 pt-4 px-2">
          <div>
            <p className="font-semibold text-slate-800">Ringkasan Statistik Kehadiran:</p>
            <div className="grid grid-cols-2 gap-x-4 mt-1 font-mono text-slate-600">
              <span>Hadir: {classStudents.filter(s => attendance[s.id] === "hadir").length} siswa</span>
              <span>Sakit: {classStudents.filter(s => attendance[s.id] === "sakit").length} siswa</span>
              <span>Izin: {classStudents.filter(s => attendance[s.id] === "izin").length} siswa</span>
              <span>Alpa: {classStudents.filter(s => attendance[s.id] === "alpa").length} siswa</span>
            </div>
          </div>
          
          {/* Signature Block */}
          <div className="text-center w-64 mt-2">
            <p>Kediri, {new Date(selectedDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="mt-1">Guru Pengajar,</p>
            <div className="h-16"></div>
            <p className="font-bold underline">Endang Kustiwulan, S.Pd.</p>
            <p className="text-slate-500 text-[10px] font-mono">NIP. 197303092024212003</p>
          </div>
        </div>
      </div>

      {/* Screen View Container */}
      <div className="no-print space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-850 tracking-tight font-display flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-blue-600" /> Pengisian Absensi Siswa
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Kelola kehadiran siswa harian di SMA Negeri 1 Kediri
            </p>
          </div>
          
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <button
              onClick={handlePrint}
              disabled={classStudents.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 bg-white rounded-xl font-semibold text-sm shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak PDF (Kop Resmi)
            </button>
            <button
              onClick={handleSaveAttendance}
              disabled={classStudents.length === 0 || isSaving}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Menyimpan..." : "Simpan Rekap Absensi"}
            </button>
          </div>
        </div>

        {/* Filter Configuration Row */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Class Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Kelas</label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as any)}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c} value={c}>Kelas {c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Room Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Ruang Kelas</label>
            <div className="relative">
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
              >
                {rooms.map(r => (
                  <option key={r} value={r}>Ruang {r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tanggal Rekap</label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {saveStatus === 'success' && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-in fade-in duration-150">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Absensi kelas {selectedClass}-{selectedRoom} tanggal {selectedDate} berhasil disimpan ke database cloud.</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm font-semibold animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Gagal menyimpan data absensi ke cloud database. Periksa koneksi internet Anda.</span>
          </div>
        )}

        {/* Student Attendance Marker Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Quick toggle headers */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-sm font-bold text-slate-700">
              Daftar Siswa ({classStudents.length} siswa)
            </span>
            {classStudents.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-slate-400 font-medium self-center mr-1">Setel Semua:</span>
                <button
                  onClick={() => handleMarkAll("hadir")}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Hadir Semua
                </button>
                <button
                  onClick={() => handleMarkAll("sakit")}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Sakit Semua
                </button>
                <button
                  onClick={() => handleMarkAll("izin")}
                  className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-700 border border-slate-200 hover:border-amber-200 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Izin Semua
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-20 text-center text-slate-400 text-sm font-medium">
                Memuat data rekap absensi...
              </div>
            ) : classStudents.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-sm">
                Tidak ada data siswa terdaftar di Kelas {selectedClass} - Ruang {selectedRoom}.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4 w-16">No</th>
                    <th className="px-6 py-4">Nama Siswa</th>
                    <th className="px-6 py-4 w-40 text-center">L/P</th>
                    <th className="px-6 py-4 w-96 text-center">Status Presensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {classStudents.map((student, idx) => {
                    const currentStatus = attendance[student.id] || "hadir";
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-400">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${
                            student.gender === "L" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"
                          }`}>
                            {student.gender}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            {/* Hadir radio */}
                            <label className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                              currentStatus === "hadir"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}>
                              <input
                                type="radio"
                                name={`status_${student.id}`}
                                checked={currentStatus === "hadir"}
                                onChange={() => handleStatusChange(student.id, "hadir")}
                                className="sr-only"
                              />
                              Hadir
                            </label>

                            {/* Sakit radio */}
                            <label className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                              currentStatus === "sakit"
                                ? "bg-blue-50 text-blue-700 border-blue-300 shadow-xs"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}>
                              <input
                                type="radio"
                                name={`status_${student.id}`}
                                checked={currentStatus === "sakit"}
                                onChange={() => handleStatusChange(student.id, "sakit")}
                                className="sr-only"
                              />
                              Sakit
                            </label>

                            {/* Izin radio */}
                            <label className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                              currentStatus === "izin"
                                ? "bg-amber-50 text-amber-700 border-amber-300 shadow-xs"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}>
                              <input
                                type="radio"
                                name={`status_${student.id}`}
                                checked={currentStatus === "izin"}
                                onChange={() => handleStatusChange(student.id, "izin")}
                                className="sr-only"
                              />
                              Izin
                            </label>

                            {/* Alpa radio */}
                            <label className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                              currentStatus === "alpa"
                                ? "bg-rose-50 text-rose-700 border-rose-300 shadow-xs"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}>
                              <input
                                type="radio"
                                name={`status_${student.id}`}
                                checked={currentStatus === "alpa"}
                                onChange={() => handleStatusChange(student.id, "alpa")}
                                className="sr-only"
                              />
                              Alpa
                            </label>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <CustomAlertModal
        isOpen={dialog.isOpen}
        type={dialog.type}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        cancelLabel={dialog.cancelLabel}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
      />
    </div>
  );
}
