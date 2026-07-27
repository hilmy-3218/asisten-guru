import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Users,
  ChevronDown
} from "lucide-react";
import { Student } from "../types";
import CustomAlertModal from "./CustomAlertModal";

interface DataSiswaProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, "id">) => Promise<void>;
  onEditStudent: (id: string, updatedData: Partial<Student>) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
}

export default function DataSiswa({ students, onAddStudent, onEditStudent, onDeleteStudent }: DataSiswaProps) {
  // Filters and search states
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("Semua");
  const [selectedRoom, setSelectedRoom] = useState<string>("Semua");

  // Form states (Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const [formName, setFormName] = useState("");
  const [formClass, setFormClass] = useState<'X' | 'XI' | 'XII'>("X");
  const [formRoom, setFormRoom] = useState("A");
  const [formGender, setFormGender] = useState<'L' | 'P'>("L");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Constants
  const classes: Array<'X' | 'XI' | 'XII'> = ["X", "XI", "XII"];
  const rooms = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormName("");
    setFormClass("X");
    setFormRoom("A");
    setFormGender("L");
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormClass(student.class);
    setFormRoom(student.room);
    setFormGender(student.gender);
    setIsModalOpen(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setDialog({
        isOpen: true,
        type: "warning",
        title: "Peringatan",
        message: "Nama wajib diisi!",
        confirmLabel: "OK",
        onConfirm: closeDialog,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingStudent) {
        // Edit flow
        await onEditStudent(editingStudent.id, {
          name: formName,
          class: formClass,
          room: formRoom,
          gender: formGender
        });
        showSuccess("Berhasil", "Biodata siswa berhasil diperbarui.");
      } else {
        // Add flow
        await onAddStudent({
          name: formName,
          class: formClass,
          room: formRoom,
          gender: formGender
        });
        showSuccess("Berhasil", "Siswa baru berhasil ditambahkan.");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showError("Gagal", "Gagal menyimpan data siswa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDialog({
      isOpen: true,
      type: "danger",
      title: "Hapus Siswa",
      message: `Apakah Anda yakin ingin menghapus siswa ${name}?`,
      confirmLabel: "Ya, Hapus",
      cancelLabel: "Batal",
      onCancel: closeDialog,
      onConfirm: async () => {
        closeDialog();
        try {
          await onDeleteStudent(id);
          showSuccess("Berhasil", `Siswa ${name} berhasil dihapus.`);
        } catch (err) {
          console.error(err);
          showError("Gagal", "Gagal menghapus data siswa.");
        }
      }
    });
  };

  // Filter students based on state
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === "Semua" || student.class === selectedClass;
    const matchesRoom = selectedRoom === "Semua" || student.room === selectedRoom;

    return matchesSearch && matchesClass && matchesRoom;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-850 tracking-tight font-display flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Kelola Data Siswa
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Daftar seluruh siswa aktif SMA Negeri 1 Kediri
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md cursor-pointer transition-all duration-150"
        >
          <Plus className="w-4 h-4" /> Tambah Siswa Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search input */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari siswa berdasarkan nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Class Filter */}
        <div className="relative">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
          >
            <option value="Semua">Semua Kelas</option>
            {classes.map(c => (
              <option key={c} value={c}>Kelas {c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Room Filter */}
        <div className="relative">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
          >
            <option value="Semua">Semua Ruang (A-K)</option>
            {rooms.map(r => (
              <option key={r} value={r}>Ruang {r}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4 text-center">Kelas & Ruang</th>
                <th className="px-6 py-4 text-center">L/P</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Siswa tidak ditemukan atau belum ditambahkan.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">{student.name}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {student.class}-{student.room}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold ${
                        student.gender === "L" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-pink-50 text-pink-700 border border-pink-200"
                      }`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded-lg text-slate-400 transition-colors cursor-pointer"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.name)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Menampilkan {filteredStudents.length} dari {students.length} siswa</span>
        </div>
      </div>

      {/* Add / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base font-display">
                {editingStudent ? "Edit Biodata Siswa" : "Tambah Siswa Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Muhammad Akhyar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* NISN field has been removed */}

              {/* Grid: Class, Room, Gender */}
              <div className="grid grid-cols-3 gap-3">
                {/* Class */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Kelas</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {classes.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Room */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Ruang</label>
                  <select
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {rooms.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="L">L</option>
                    <option value="P">P</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {isSubmitting ? "Menyimpan..." : <><Check className="w-4 h-4" /> Simpan</>}
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
