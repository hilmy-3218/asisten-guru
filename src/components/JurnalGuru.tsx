import React, { useState } from "react";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Printer, 
  X, 
  Check, 
  Calendar,
  Book,
  ChevronDown,
  Search,
  CheckCircle,
  Clock
} from "lucide-react";
import { Journal } from "../types";
import KopSurat from "./KopSurat";
import CustomAlertModal from "./CustomAlertModal";

interface JurnalGuruProps {
  journals: Journal[];
  onAddJournal: (journal: Omit<Journal, "id">) => Promise<void>;
  onEditJournal: (id: string, updatedData: Partial<Journal>) => Promise<void>;
  onDeleteJournal: (id: string) => Promise<void>;
}

export default function JurnalGuru({ journals, onAddJournal, onEditJournal, onDeleteJournal }: JurnalGuruProps) {
  // Search and Filters
  const [search, setSearch] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("Semua");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("Semua");

  // Form & Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);

  const [formDate, setFormDate] = useState("");
  const [formClass, setFormClass] = useState("X-A");
  const [formSubject, setFormSubject] = useState("");
  const [formTopic, setFormTopic] = useState("");
  const [formAttendanceCount, setFormAttendanceCount] = useState("");
  const [formStatus, setFormStatus] = useState<'Selesai' | 'Belum Selesai'>("Selesai");

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Constants
  const availableClasses = [
    "X-A", "X-B", "X-C", "X-D", "X-E", "X-F", "X-G", "X-H", "X-I", "X-J", "X-K",
    "XI-A", "XI-B", "XI-C", "XI-D", "XI-E", "XI-F", "XI-G", "XI-H", "XI-I", "XI-J", "XI-K",
    "XII-A", "XII-B", "XII-C", "XII-D", "XII-E", "XII-F", "XII-G", "XII-H", "XII-I", "XII-J", "XII-K"
  ];

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingJournal(null);
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormClass("X-A");
    setFormSubject("Matematika");
    setFormTopic("");
    setFormAttendanceCount("");
    setFormStatus("Selesai");
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (journal: Journal) => {
    setEditingJournal(journal);
    setFormDate(journal.date);
    setFormClass(journal.class);
    setFormSubject(journal.subject);
    setFormTopic(journal.topic);
    setFormAttendanceCount(journal.attendanceCount);
    setFormStatus(journal.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formClass || !formSubject.trim() || !formTopic.trim()) {
      setDialog({
        isOpen: true,
        type: "warning",
        title: "Peringatan",
        message: "Semua kolom kecuali Keterangan Hadir wajib diisi!",
        confirmLabel: "OK",
        onConfirm: closeDialog,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingJournal) {
        await onEditJournal(editingJournal.id, {
          date: formDate,
          class: formClass,
          subject: formSubject,
          topic: formTopic,
          attendanceCount: formAttendanceCount || "Hadir Semua",
          status: formStatus
        });
        showSuccess("Berhasil", "Catatan jurnal berhasil diperbarui.");
      } else {
        await onAddJournal({
          date: formDate,
          class: formClass,
          subject: formSubject,
          topic: formTopic,
          attendanceCount: formAttendanceCount || "Hadir Semua",
          status: formStatus
        });
        showSuccess("Berhasil", "Catatan jurnal baru berhasil ditambahkan.");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showError("Gagal", "Gagal menyimpan jurnal mengajar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, topic: string) => {
    setDialog({
      isOpen: true,
      type: "danger",
      title: "Hapus Jurnal",
      message: `Apakah Anda yakin ingin menghapus catatan jurnal materi: "${topic}"?`,
      confirmLabel: "Ya, Hapus",
      cancelLabel: "Batal",
      onCancel: closeDialog,
      onConfirm: async () => {
        closeDialog();
        try {
          await onDeleteJournal(id);
          showSuccess("Berhasil", "Catatan jurnal berhasil dihapus.");
        } catch (err) {
          console.error(err);
          showError("Gagal", "Gagal menghapus jurnal.");
        }
      }
    });
  };

  const handlePrint = () => {
    const isIframe = window.self !== window.top;
    if (isIframe) {
      setDialog({
        isOpen: true,
        type: "info",
        title: "Petunjuk Cetak PDF",
        message: "Aplikasi berjalan di dalam frame preview AI Studio.\n\nUntuk mencetak jurnal dengan Kop Resmi secara sempurna:\n1. Klik tombol 'Open in new tab' (ikon panah/layar di kanan atas preview).\n2. Di tab baru tersebut, silakan klik kembali tombol 'Cetak Jurnal'.",
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

  // Filter journals
  const filteredJournals = journals.filter(journal => {
    const matchesSearch = journal.topic.toLowerCase().includes(search.toLowerCase()) || 
                          journal.subject.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClassFilter === "Semua" || journal.class === selectedClassFilter;
    const matchesStatus = selectedStatusFilter === "Semua" || journal.status === selectedStatusFilter;

    return matchesSearch && matchesClass && matchesStatus;
  }).sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending (latest first)

  return (
    <div className="space-y-6">
      {/* Print View (Hidden on web UI, rendered during print to PDF) */}
      <div className="print-only print-card font-sans text-slate-950 p-6">
        <KopSurat />
        <div className="text-center my-6">
          <h2 className="text-lg font-bold uppercase tracking-wider">Jurnal Kegiatan Belajar Mengajar (KBM)</h2>
          <p className="text-sm text-slate-700 mt-1">
            SMA Negeri 1 Kediri | Semester Ganjil / Genap
          </p>
        </div>

        <table className="w-full border-collapse border border-slate-400 text-xs mt-4">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-400 px-3 py-2 text-center w-10">No</th>
              <th className="border border-slate-400 px-3 py-2 text-center w-28">Tanggal</th>
              <th className="border border-slate-400 px-3 py-2 text-center w-20">Kelas</th>
              <th className="border border-slate-400 px-3 py-2 text-left w-40">Mata Pelajaran</th>
              <th className="border border-slate-400 px-3 py-2 text-left">Materi / Bahasan Pokok</th>
              <th className="border border-slate-400 px-3 py-2 text-center w-36">Catatan</th>
              <th className="border border-slate-400 px-3 py-2 text-center w-24">Status KBM</th>
            </tr>
          </thead>
          <tbody>
            {filteredJournals.length === 0 ? (
              <tr>
                <td colSpan={7} className="border border-slate-400 px-3 py-8 text-center text-slate-500">
                  Tidak ada catatan jurnal mengajar yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredJournals.map((journal, idx) => (
                <tr key={journal.id}>
                  <td className="border border-slate-400 px-3 py-2 text-center">{idx + 1}</td>
                  <td className="border border-slate-400 px-3 py-2 text-center font-mono">{journal.date}</td>
                  <td className="border border-slate-400 px-3 py-2 text-center font-semibold">{journal.class}</td>
                  <td className="border border-slate-400 px-3 py-2 font-medium">{journal.subject}</td>
                  <td className="border border-slate-400 px-3 py-2 font-semibold text-slate-900">{journal.topic}</td>
                  <td className="border border-slate-400 px-3 py-2 text-center text-slate-700">{journal.attendanceCount}</td>
                  <td className="border border-slate-400 px-3 py-2 text-center font-bold uppercase text-[10px]">
                    {journal.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Signature for Jurnal */}
        <div className="mt-8 flex justify-end text-xs">
          <div className="text-center w-64">
            <p>Kediri, {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="mt-1">Guru Pengajar,</p>
            <div className="h-16"></div>
            <p className="font-bold underline">Endang Kustiwulan, S.Pd.</p>
            <p className="text-slate-500 text-[10px] font-mono">NIP. 197303092024212003</p>
          </div>
        </div>
      </div>

      {/* Screen View */}
      <div className="no-print space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-850 tracking-tight font-display flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" /> Jurnal Mengajar Guru
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Catat kemajuan materi KBM dan absensi kelas secara integratif
            </p>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white rounded-xl font-semibold text-sm shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Jurnal (Kop Resmi)
            </button>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Tulis Jurnal Baru
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search topic/subject */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari bahasan materi atau mapel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Class Filter */}
          <div className="relative">
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="Semua">Semua Kelas</option>
              {availableClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Belum Selesai">Belum Selesai</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Journals Listing Grid / Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Kelas</th>
                  <th className="px-6 py-4">Mapel / Materi</th>
                  <th className="px-6 py-4">Catatan</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredJournals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Belum ada catatan jurnal mengajar yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredJournals.map((journal, idx) => (
                    <tr key={journal.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-slate-400">{idx + 1}</td>
                      <td className="px-6 py-3.5 font-mono text-xs font-semibold text-slate-500">{journal.date}</td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 font-bold text-xs text-slate-600">
                          {journal.class}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 max-w-xs">
                        <div className="text-xs text-slate-400">{journal.subject}</div>
                        <div className="font-bold text-slate-800 leading-snug mt-0.5">{journal.topic}</div>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500 font-medium">
                        {journal.attendanceCount}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          journal.status === "Selesai"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-750 border-amber-200"
                        }`}>
                          {journal.status === "Selesai" ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                          {journal.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleOpenEditModal(journal)}
                            className="p-1.5 hover:bg-slate-100 hover:text-blue-600 rounded-lg text-slate-400 transition-colors cursor-pointer"
                            title="Edit Jurnal"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(journal.id, journal.topic)}
                            className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors cursor-pointer"
                            title="Hapus Jurnal"
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
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 text-xs text-slate-400 font-medium">
            Menampilkan {filteredJournals.length} dari {journals.length} catatan jurnal
          </div>
        </div>
      </div>

      {/* Add / Edit Journal Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base font-display">
                {editingJournal ? "Edit Jurnal Mengajar" : "Tulis Jurnal Mengajar Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Date & Class Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Kelas & Ruang</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {availableClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="Contoh: Matematika Peminatan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Topic */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Bahasan Materi / Topik</label>
                <input
                  type="text"
                  required
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="Contoh: Operasi Penjumlahan Matriks"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Attendance count */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Catatan (Opsional)</label>
                <input
                  type="text"
                  value={formAttendanceCount}
                  onChange={(e) => setFormAttendanceCount(e.target.value)}
                  placeholder="Contoh: 32 Hadir, 1 Sakit, 1 Izin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Status Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Status Kegiatan Belajar Mengajar</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="form_status"
                      checked={formStatus === "Selesai"}
                      onChange={() => setFormStatus("Selesai")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-slate-700">Selesai (Completed)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="form_status"
                      checked={formStatus === "Belum Selesai"}
                      onChange={() => setFormStatus("Belum Selesai")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-slate-700">Belum Selesai</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? "Menyimpan..." : <><Check className="w-4 h-4" /> Simpan Jurnal</>}
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
