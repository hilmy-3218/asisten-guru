import React, { useState } from "react";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  ChevronDown, 
  X, 
  Check, 
  ExternalLink,
  BookMarked,
  Layers
} from "lucide-react";
import { Material } from "../types";
import CustomAlertModal from "./CustomAlertModal";

interface MateriAjarProps {
  materials: Material[];
  onAddMaterial: (material: Omit<Material, "id">) => Promise<void>;
  onEditMaterial: (id: string, updatedData: Partial<Material>) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
}

export default function MateriAjar({ materials, onAddMaterial, onEditMaterial, onDeleteMaterial }: MateriAjarProps) {
  // Search and filter states
  const [search, setSearch] = useState("");
  const [selectedScopeFilter, setSelectedScopeFilter] = useState("Semua");

  // Detail viewer state
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);

  // Form & Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formScope, setFormScope] = useState("Umum");
  const [formContent, setFormContent] = useState("");
  const [formLink, setFormLink] = useState("");

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

  const scopes = [
    "Umum", "X", "XI", "XII",
    "X-A", "X-B", "XI-A", "XII-A"
  ];

  const handleOpenAddModal = () => {
    setEditingMaterial(null);
    setFormTitle("");
    setFormSubject("Matematika");
    setFormScope("Umum");
    setFormContent("");
    setFormLink("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (material: Material, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening detailed card
    setEditingMaterial(material);
    setFormTitle(material.title);
    setFormSubject(material.subject);
    setFormScope(material.classScope);
    setFormContent(material.content);
    setFormLink(material.link);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSubject.trim() || !formContent.trim()) {
      setDialog({
        isOpen: true,
        type: "warning",
        title: "Peringatan",
        message: "Judul, Mata Pelajaran, dan Ringkasan Konten wajib diisi!",
        confirmLabel: "OK",
        onConfirm: closeDialog,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMaterial) {
        await onEditMaterial(editingMaterial.id, {
          title: formTitle,
          subject: formSubject,
          classScope: formScope,
          content: formContent,
          link: formLink
        });
        // Update active expanded view if it was edited
        if (activeMaterial?.id === editingMaterial.id) {
          setActiveMaterial({
            ...activeMaterial,
            title: formTitle,
            subject: formSubject,
            classScope: formScope,
            content: formContent,
            link: formLink
          });
        }
        showSuccess("Berhasil", "Materi ajar berhasil diperbarui.");
      } else {
        await onAddMaterial({
          title: formTitle,
          subject: formSubject,
          classScope: formScope,
          content: formContent,
          link: formLink,
          createdAt: new Date().toISOString().split("T")[0]
        });
        showSuccess("Berhasil", "Materi ajar baru berhasil ditambahkan.");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showError("Gagal", "Gagal menyimpan materi ajar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDialog({
      isOpen: true,
      type: "danger",
      title: "Hapus Materi",
      message: `Apakah Anda yakin ingin menghapus materi "${title}"?`,
      confirmLabel: "Ya, Hapus",
      cancelLabel: "Batal",
      onCancel: closeDialog,
      onConfirm: async () => {
        closeDialog();
        try {
          await onDeleteMaterial(id);
          if (activeMaterial?.id === id) {
            setActiveMaterial(null);
          }
          showSuccess("Berhasil", `Materi "${title}" berhasil dihapus.`);
        } catch (err) {
          console.error(err);
          showError("Gagal", "Gagal menghapus materi.");
        }
      }
    });
  };

  // Filter materials list
  const filteredMaterials = materials.filter(mat => {
    const matchesSearch = mat.title.toLowerCase().includes(search.toLowerCase()) || 
                          mat.subject.toLowerCase().includes(search.toLowerCase()) ||
                          mat.content.toLowerCase().includes(search.toLowerCase());
    const matchesScope = selectedScopeFilter === "Semua" || mat.classScope === selectedScopeFilter;

    return matchesSearch && matchesScope;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-850 tracking-tight font-display flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" /> Bank Materi Ajar
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Unggah dan kelola rangkuman materi, link modul, dan referensi pelajaran
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm hover:shadow-md cursor-pointer transition-all duration-150"
        >
          <Plus className="w-4 h-4" /> Tambah Materi Pelajaran
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Search input */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari materi berdasarkan judul, konten, atau mata pelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Scope Filter */}
        <div className="relative">
          <select
            value={selectedScopeFilter}
            onChange={(e) => setSelectedScopeFilter(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
          >
            <option value="Semua">Semua Tingkat / Ruang</option>
            {scopes.map(s => (
              <option key={s} value={s}>{s === "Umum" ? "Umum (Semua)" : `Scope: ${s}`}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Two Column Layout: Materials list (Left) and Detail Viewer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Materials Cards List - Span 2 */}
        <div className="lg:col-span-2 space-y-3 max-h-[550px] overflow-y-auto pr-1">
          {filteredMaterials.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400 text-sm">
              Materi tidak ditemukan atau belum ditambahkan.
            </div>
          ) : (
            filteredMaterials.map((material) => (
              <div
                key={material.id}
                onClick={() => setActiveMaterial(material)}
                className={`p-4 bg-white border rounded-xl shadow-xs cursor-pointer transition-all text-left flex flex-col justify-between ${
                  activeMaterial?.id === material.id
                    ? "border-blue-600 ring-2 ring-blue-500/10 bg-blue-50/10"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
                      {material.subject}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      {material.classScope}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2">
                    {material.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {material.content}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                  <span className="text-[10px] text-slate-400 font-mono">Tgl: {material.createdAt}</span>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => handleOpenEditModal(material, e)}
                      className="p-1 hover:bg-slate-150 rounded text-slate-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(material.id, material.title, e)}
                      className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Expanded Content Details Viewer - Span 3 */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-xs min-h-[300px] flex flex-col justify-between">
          {!activeMaterial ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm py-16">
              <BookMarked className="w-12 h-12 text-slate-300 mb-2" />
              <p className="font-semibold">Klik salah satu kartu materi di sebelah kiri</p>
              <p className="text-xs text-slate-400 mt-1">untuk membaca ringkasan konten dan melihat link modul.</p>
            </div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-150 pb-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase">
                      {activeMaterial.subject}
                    </span>
                    <span className="ml-2 text-xs font-bold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      Scope: {activeMaterial.classScope}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Dibuat: {activeMaterial.createdAt}</span>
                </div>

                {/* Title */}
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {activeMaterial.title}
                </h2>

                {/* Content body */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-150 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                  {activeMaterial.content}
                </div>
              </div>

              {/* Action Link (Google Drive / Shared Link) */}
              {activeMaterial.link && (
                <div className="border-t border-slate-150 pt-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span>Materi memiliki lampiran link dokumen eksternal:</span>
                  </div>
                  <a
                    href={activeMaterial.link}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow-sm transition-colors"
                  >
                    Buka Link Materi <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Material Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base font-display">
                {editingMaterial ? "Edit Materi Ajar" : "Tambah Materi Pelajaran Baru"}
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
              {/* Grid: Subject & Scope */}
              <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Lingkup Kelas (Scope)</label>
                  <select
                    value={formScope}
                    onChange={(e) => setFormScope(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {scopes.map(sc => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Judul Rangkuman Materi</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Modul Matriks Ordo 3x3 Lengkap"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Content text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Ringkasan / Catatan Materi</label>
                <textarea
                  required
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Tuliskan rangkuman materi ringkas atau penjelasan penting di sini agar siswa/guru dapat membacanya langsung..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-sans"
                />
              </div>

              {/* External link */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Link Dokumen Eksternal (Google Drive / Canva - Opsional)</label>
                <input
                  type="url"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="Contoh: https://drive.google.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
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
                  {isSubmitting ? "Menyimpan..." : <><Check className="w-4 h-4" /> Simpan Materi</>}
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
