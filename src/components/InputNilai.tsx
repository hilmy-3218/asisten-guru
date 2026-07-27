import React, { useState, useEffect } from "react";
import { 
  Award, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Printer, 
  X, 
  Check, 
  Calendar,
  ChevronRight,
  BookOpen,
  ChevronDown
} from "lucide-react";
import { Student, Assignment, GradeRecord } from "../types";
import { db } from "../firebase";
import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, where } from "firebase/firestore";
import KopSurat from "./KopSurat";
import CustomAlertModal from "./CustomAlertModal";

interface InputNilaiProps {
  students: Student[];
}

export default function InputNilai({ students }: InputNilaiProps) {
  // Filters
  const [selectedClass, setSelectedClass] = useState<'X' | 'XI' | 'XII'>("X");
  const [selectedRoom, setSelectedRoom] = useState<string>("A");
  
  // Loaded class students
  const [classStudents, setClassStudents] = useState<Student[]>([]);

  // Assignments state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [grades, setGrades] = useState<{ [studentId: string]: number }>({});
  
  // UI states
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isAssignmentsLoading, setIsAssignmentsLoading] = useState(false);
  const [isGradesLoading, setIsGradesLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formMaxScore, setFormMaxScore] = useState(100);

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

  const showSuccess = (title: string, message: string) => {
    setDialog({
      isOpen: true,
      type: "success",
      title,
      message,
      confirmLabel: "OK",
      onConfirm: closeDialog,
    });
  };

  const showError = (title: string, message: string) => {
    setDialog({
      isOpen: true,
      type: "danger",
      title,
      message,
      confirmLabel: "Tutup",
      onConfirm: closeDialog,
    });
  };

  const classes: Array<'X' | 'XI' | 'XII'> = ["X", "XI", "XII"];
  const rooms = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

  // Update students listing when filter changes
  useEffect(() => {
    const filtered = students.filter(
      s => s.class === selectedClass && s.room === selectedRoom
    );
    setClassStudents(filtered);
  }, [students, selectedClass, selectedRoom]);

  // Load assignments for class and room
  const loadAssignments = async () => {
    setIsAssignmentsLoading(true);
    try {
      const q = query(
        collection(db, "assignments"),
        where("class", "==", selectedClass),
        where("room", "==", selectedRoom)
      );
      const querySnap = await getDocs(q);
      const list: Assignment[] = [];
      querySnap.forEach((d) => {
        list.push(d.data() as Assignment);
      });
      setAssignments(list);
      
      // Select first assignment if available and none selected or previous selection no longer applies
      if (list.length > 0) {
        // Find if current selection is still in list
        const stillExists = list.find(a => a.id === selectedAssignment?.id);
        if (!stillExists) {
          setSelectedAssignment(list[0]);
        } else {
          // Keep same selection
          setSelectedAssignment(stillExists);
        }
      } else {
        setSelectedAssignment(null);
      }
    } catch (err) {
      console.error("Gagal memuat tugas:", err);
    } finally {
      setIsAssignmentsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [selectedClass, selectedRoom]);

  // Load grades when selected assignment changes
  useEffect(() => {
    const loadGrades = async () => {
      if (!selectedAssignment) {
        setGrades({});
        return;
      }

      setIsGradesLoading(true);
      const docRef = doc(db, "grades", selectedAssignment.id);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as GradeRecord;
          const loadedGrades = data.grades || {};
          
          // Ensure every class student has an entry initialized to 0
          const updatedGrades = { ...loadedGrades };
          classStudents.forEach(student => {
            if (updatedGrades[student.id] === undefined) {
              updatedGrades[student.id] = 0;
            }
          });
          setGrades(updatedGrades);
        } else {
          // Initialize everyone to 0
          const initialGrades: { [studentId: string]: number } = {};
          classStudents.forEach(student => {
            initialGrades[student.id] = 0;
          });
          setGrades(initialGrades);
        }
      } catch (err) {
        console.error("Gagal memuat nilai:", err);
      } finally {
        setIsGradesLoading(false);
      }
    };

    loadGrades();
  }, [selectedAssignment, classStudents]);

  // Handle grade change
  const handleGradeChange = (studentId: string, val: string) => {
    let numVal = parseInt(val) || 0;
    if (numVal < 0) numVal = 0;
    if (numVal > (selectedAssignment?.maxScore || 100)) numVal = selectedAssignment?.maxScore || 100;
    
    setGrades(prev => ({
      ...prev,
      [studentId]: numVal
    }));
  };

  // Open modal for new assignment
  const handleOpenAddModal = () => {
    setEditingAssignment(null);
    setFormTitle("");
    setFormSubject("Matematika");
    setFormDueDate(new Date().toISOString().split("T")[0]);
    setFormMaxScore(100);
    setIsAssignmentModalOpen(true);
  };

  // Open modal for editing assignment
  const handleOpenEditModal = (assignment: Assignment, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selecting the assignment card
    setEditingAssignment(assignment);
    setFormTitle(assignment.title);
    setFormSubject(assignment.subject);
    setFormDueDate(assignment.dueDate);
    setFormMaxScore(assignment.maxScore);
    setIsAssignmentModalOpen(true);
  };

  // Save/Update assignment
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSubject.trim()) {
      setDialog({
        isOpen: true,
        type: "warning",
        title: "Peringatan",
        message: "Judul tugas dan Mata Pelajaran wajib diisi!",
        confirmLabel: "OK",
        onConfirm: closeDialog,
      });
      return;
    }

    const id = editingAssignment ? editingAssignment.id : `asg_${Date.now()}`;
    const newAssignment: Assignment = {
      id,
      title: formTitle,
      subject: formSubject,
      class: selectedClass,
      room: selectedRoom,
      dueDate: formDueDate || new Date().toISOString().split("T")[0],
      maxScore: formMaxScore || 100
    };

    try {
      await setDoc(doc(db, "assignments", id), newAssignment);
      await loadAssignments();
      setIsAssignmentModalOpen(false);
      showSuccess("Berhasil", "Tugas berhasil disimpan.");
    } catch (err) {
      console.error("Gagal menyimpan tugas:", err);
      showError("Gagal", "Gagal menyimpan tugas.");
    }
  };

  // Delete assignment
  const handleDeleteAssignment = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selection
    setDialog({
      isOpen: true,
      type: "danger",
      title: "Hapus Tugas",
      message: `Apakah Anda yakin ingin menghapus tugas "${title}" beserta semua nilainya?`,
      confirmLabel: "Ya, Hapus",
      cancelLabel: "Batal",
      onCancel: closeDialog,
      onConfirm: async () => {
        closeDialog();
        try {
          await deleteDoc(doc(db, "assignments", id));
          await deleteDoc(doc(db, "grades", id)); // also clean up grades
          await loadAssignments();
          if (selectedAssignment && selectedAssignment.id === id) {
            setSelectedAssignment(null);
          }
          showSuccess("Berhasil", `Tugas "${title}" berhasil dihapus.`);
        } catch (err) {
          console.error("Gagal menghapus tugas:", err);
          showError("Gagal", "Gagal menghapus tugas.");
        }
      }
    });
  };

  // Save student grades to Firebase
  const handleSaveGrades = async () => {
    if (!selectedAssignment) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await setDoc(doc(db, "grades", selectedAssignment.id), {
        id: selectedAssignment.id,
        assignmentId: selectedAssignment.id,
        grades
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Gagal menyimpan rekap nilai:", err);
      showError("Gagal", "Gagal menyimpan rekap nilai.");
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger print
  const handlePrint = () => {
    const isIframe = window.self !== window.top;
    if (isIframe) {
      setDialog({
        isOpen: true,
        type: "info",
        title: "Petunjuk Cetak PDF",
        message: "Aplikasi berjalan di dalam frame preview AI Studio.\n\nUntuk mencetak daftar nilai dengan Kop Resmi secara sempurna:\n1. Klik tombol 'Open in new tab' (ikon panah/layar di kanan atas preview).\n2. Di tab baru tersebut, silakan klik kembali tombol 'Cetak PDF'.",
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
      {/* Print View Component (Hidden on browser, visible when printing) */}
      {selectedAssignment && (
        <div className="print-only print-card font-sans text-slate-950 p-6">
          <KopSurat />
          <div className="text-center my-6">
            <h2 className="text-lg font-bold uppercase tracking-wider">Daftar Nilai Hasil Belajar Siswa</h2>
            <p className="text-sm text-slate-700 mt-1">
              Mata Pelajaran: <span className="font-semibold">{selectedAssignment.subject}</span> | Tugas: <span className="font-semibold">{selectedAssignment.title}</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelas: <span className="font-semibold">{selectedClass}-{selectedRoom}</span> | Max Skor: <span className="font-semibold">{selectedAssignment.maxScore}</span> | Tenggat: <span className="font-semibold">{selectedAssignment.dueDate}</span>
            </p>
          </div>

          <table className="w-full border-collapse border border-slate-400 text-sm mt-4">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-400 px-4 py-2.5 text-center w-12">No</th>
                <th className="border border-slate-400 px-4 py-2.5 text-left">Nama Lengkap</th>
                <th className="border border-slate-400 px-4 py-2.5 text-center w-24">L/P</th>
                <th className="border border-slate-400 px-4 py-2.5 text-center w-32">Nilai Perolehan</th>
                <th className="border border-slate-400 px-4 py-2.5 text-center w-32">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-slate-400 px-4 py-10 text-center text-slate-500">
                    Tidak ada data siswa di kelas ini.
                  </td>
                </tr>
              ) : (
                classStudents.map((student, idx) => {
                  const score = grades[student.id] || 0;
                  const passingGrade = (selectedAssignment.maxScore * 0.75); // KKM 75% of maxScore
                  const statusLabel = score >= passingGrade ? "Tuntas" : "Remedial";
                  return (
                    <tr key={student.id}>
                      <td className="border border-slate-400 px-4 py-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-400 px-4 py-2 font-semibold text-slate-900">{student.name}</td>
                      <td className="border border-slate-400 px-4 py-2 text-center">{student.gender}</td>
                      <td className="border border-slate-400 px-4 py-2 text-center font-bold font-mono text-sm">{score}</td>
                      <td className={`border border-slate-400 px-4 py-2 text-center text-xs font-bold ${
                        statusLabel === "Tuntas" ? "text-emerald-700" : "text-rose-700"
                      }`}>{statusLabel}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Signature/Stat block */}
          <div className="mt-8 flex justify-between items-start text-xs border-t border-slate-200 pt-4 px-2">
            <div>
              <p className="font-semibold text-slate-800">Analisis Hasil Nilai:</p>
              <div className="grid grid-cols-1 gap-1 mt-1 font-mono text-slate-600">
                <span>Rata-rata Nilai: {
                  classStudents.length > 0 
                    ? (classStudents.reduce((acc, s) => acc + (grades[s.id] || 0), 0) / classStudents.length).toFixed(1)
                    : 0
                }</span>
                <span>Tingkat Ketuntasan: {
                  classStudents.length > 0 
                    ? ((classStudents.filter(s => (grades[s.id] || 0) >= (selectedAssignment.maxScore * 0.75)).length / classStudents.length) * 100).toFixed(0)
                    : 0
                }% tuntas</span>
              </div>
            </div>
            
            <div className="text-center w-64">
              <p>Kediri, {new Date(selectedAssignment.dueDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="mt-1">Guru Pengajar,</p>
              <div className="h-16"></div>
              <p className="font-bold underline">Endang Kustiwulan, S.Pd.</p>
              <p className="text-slate-500 text-[10px] font-mono">NIP. 197303092024212003</p>
            </div>
          </div>
        </div>
      )}

      {/* Screen View */}
      <div className="no-print space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-850 tracking-tight font-display flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" /> Penilaian & Input Nilai Siswa
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Kelola tugas, ujian, dan rekapitulasi nilai siswa harian
            </p>
          </div>
          
          {selectedAssignment && (
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white rounded-xl font-semibold text-sm shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak PDF (Kop Resmi)
              </button>
              <button
                onClick={handleSaveGrades}
                disabled={isSaving || classStudents.length === 0}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" /> {isSaving ? "Menyimpan..." : "Simpan Semua Nilai"}
              </button>
            </div>
          )}
        </div>

        {/* Filter Configuration Row */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Class Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tingkat Kelas</label>
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
        </div>

        {/* Status indicator on save success */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-in fade-in duration-150">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Rekapitulasi nilai siswa untuk tugas "{selectedAssignment?.title}" berhasil disimpan di database cloud!</span>
          </div>
        )}

        {/* Main Grid Content: Tasks lists (Left) and Scores inputs (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Assignments list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" /> Daftar Tugas / Ujian
              </h3>
              <button
                onClick={handleOpenAddModal}
                className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Tambah Tugas Baru"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[450px]">
              {isAssignmentsLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs">Memuat tugas...</div>
              ) : assignments.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs px-4">
                  Belum ada tugas untuk Kelas {selectedClass}-{selectedRoom}. Klik tombol "+" di atas untuk membuat.
                </div>
              ) : (
                assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    onClick={() => setSelectedAssignment(assignment)}
                    className={`p-4 flex justify-between items-start cursor-pointer transition-colors ${
                      selectedAssignment?.id === assignment.id 
                        ? "bg-blue-50/70 border-l-4 border-blue-600" 
                        : "hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="space-y-1.5 pr-2">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">{assignment.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Mapel: {assignment.subject}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>Max: {assignment.maxScore}</span>
                        <span>•</span>
                        <span>Due: {assignment.dueDate}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={(e) => handleOpenEditModal(assignment, e)}
                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-colors"
                        title="Edit Tugas"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteAssignment(assignment.id, assignment.title, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors"
                        title="Hapus Tugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2 & 3: Selected Assignment Student Score list */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            {!selectedAssignment ? (
              <div className="flex-1 py-32 flex flex-col items-center justify-center text-slate-400 text-sm px-4 text-center">
                <Award className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-semibold">Silakan pilih tugas atau buat tugas baru di sebelah kiri</p>
                <p className="text-xs text-slate-400 mt-1">untuk memulai pengisian nilai siswa.</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Input Nilai: {selectedAssignment.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mapel: {selectedAssignment.subject} • Maksimal Nilai: <span className="font-semibold">{selectedAssignment.maxScore}</span>
                    </p>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Tenggat: {selectedAssignment.dueDate}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {isGradesLoading ? (
                    <div className="py-20 text-center text-slate-400 text-sm">Memuat rekap nilai siswa...</div>
                  ) : classStudents.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 text-sm">
                      Tidak ada data siswa terdaftar di Kelas {selectedClass}-{selectedRoom}
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-6 py-4 w-16">No</th>
                          <th className="px-6 py-4">Nama Siswa</th>
                          <th className="px-6 py-4 w-32 text-center">L/P</th>
                          <th className="px-6 py-4 w-52 text-right">Nilai Siswa (Skala 0-{selectedAssignment.maxScore})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {classStudents.map((student, idx) => {
                          const currentScore = grades[student.id] !== undefined ? grades[student.id] : 0;
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
                              <td className="px-6 py-4 text-right">
                                <div className="inline-flex items-center gap-3">
                                  <input
                                    type="number"
                                    min="0"
                                    max={selectedAssignment.maxScore}
                                    value={currentScore}
                                    onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                    className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                  />
                                  <span className="text-xs text-slate-400 font-mono w-16 text-left">
                                    / {selectedAssignment.maxScore}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Assignment Modal Dialog */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base font-display">
                {editingAssignment ? "Edit Detail Tugas" : "Tambah Tugas / Ujian Baru"}
              </h3>
              <button
                onClick={() => setIsAssignmentModalOpen(false)}
                className="p-1 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAssignment} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Judul Tugas / Ujian</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Ulangan Harian Logaritma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="Contoh: Matematika"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Skala Maksimal</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="1000"
                    value={formMaxScore}
                    onChange={(e) => setFormMaxScore(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tenggat Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4" /> Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
