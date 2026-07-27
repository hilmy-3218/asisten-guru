import React, { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  FileText, 
  Award, 
  ClipboardCheck, 
  User, 
  LogOut, 
  LayoutDashboard,
  Menu,
  X,
  School
} from "lucide-react";
import { db } from "./firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { Student, Journal, Material } from "./types";
import { ensureDefaultSeeding } from "./seed";

// Import modular components
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import DataSiswa from "./components/DataSiswa";
import Absensi from "./components/Absensi";
import InputNilai from "./components/InputNilai";
import JurnalGuru from "./components/JurnalGuru";
import MateriAjar from "./components/MateriAjar";
import Profil from "./components/Profil";
import CustomAlertModal from "./components/CustomAlertModal";
import logoSmast from "../assets/image/logoSmast.png";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Firestore Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Check login session in localStorage on mount
  useEffect(() => {
    const session = localStorage.getItem("asisten_guru_session");
    if (session) {
      setIsLoggedIn(true);
      setUsername(session);
    }
  }, []);

  // Initialize and seed Firebase on first run
  useEffect(() => {
    async function initDb() {
      await ensureDefaultSeeding();
    }
    initDb();
  }, []);

  // Listen to Firestore real-time collections
  useEffect(() => {
    if (!isLoggedIn) return;

    // 1. Real-time Students Listener
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => {
      const list: Student[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as Student);
      });
      // Sort alphabetically by name
      list.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(list);
    });

    // 2. Real-time Journals Listener
    const unsubJournals = onSnapshot(collection(db, "journals"), (snap) => {
      const list: Journal[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as Journal);
      });
      setJournals(list);
    });

    // 3. Real-time Materials Listener
    const unsubMaterials = onSnapshot(collection(db, "materials"), (snap) => {
      const list: Material[] = [];
      snap.forEach((doc) => {
        list.push(doc.data() as Material);
      });
      setMaterials(list);
    });

    return () => {
      unsubStudents();
      unsubJournals();
      unsubMaterials();
    };
  }, [isLoggedIn]);

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

  // Login handler
  const handleLoginSuccess = (user: string) => {
    setIsLoggedIn(true);
    setUsername(user);
    localStorage.setItem("asisten_guru_session", user);
  };

  // Logout handler
  const handleLogout = () => {
    setDialog({
      isOpen: true,
      type: "danger",
      title: "Keluar Aplikasi",
      message: "Apakah Anda yakin ingin keluar dari aplikasi Asisten Guru?",
      confirmLabel: "Ya, Keluar",
      cancelLabel: "Batal",
      onCancel: closeDialog,
      onConfirm: () => {
        closeDialog();
        setIsLoggedIn(false);
        setUsername("");
        localStorage.removeItem("asisten_guru_session");
        setActiveTab("dashboard");
        setIsMobileMenuOpen(false);
      }
    });
  };

  // Handler CRUD for Students
  const handleAddStudent = async (studentData: Omit<Student, "id">) => {
    const id = `stud_${Date.now()}`;
    const newStudent: Student = { id, ...studentData };
    await setDoc(doc(db, "students", id), newStudent);
  };

  const handleEditStudent = async (id: string, updatedData: Partial<Student>) => {
    await setDoc(doc(db, "students", id), updatedData, { merge: true });
  };

  const handleDeleteStudent = async (id: string) => {
    await deleteDoc(doc(db, "students", id));
  };

  // Handler CRUD for Journals
  const handleAddJournal = async (journalData: Omit<Journal, "id">) => {
    const id = `journ_${Date.now()}`;
    const newJournal: Journal = { id, ...journalData };
    await setDoc(doc(db, "journals", id), newJournal);
  };

  const handleEditJournal = async (id: string, updatedData: Partial<Journal>) => {
    await setDoc(doc(db, "journals", id), updatedData, { merge: true });
  };

  const handleDeleteJournal = async (id: string) => {
    await deleteDoc(doc(db, "journals", id));
  };

  // Handler CRUD for Materials
  const handleAddMaterial = async (materialData: Omit<Material, "id">) => {
    const id = `mat_${Date.now()}`;
    const newMaterial: Material = { id, ...materialData };
    await setDoc(doc(db, "materials", id), newMaterial);
  };

  const handleEditMaterial = async (id: string, updatedData: Partial<Material>) => {
    await setDoc(doc(db, "materials", id), updatedData, { merge: true });
  };

  const handleDeleteMaterial = async (id: string) => {
    await deleteDoc(doc(db, "materials", id));
  };

  // Handle reload password from database (dummy trigger, profile page handles it directly)
  const handlePasswordChanged = () => {
    console.log("Password changed successfully in Profil.");
  };

  // Switch tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  // Render correct content body based on tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            students={students} 
            journals={journals} 
            materials={materials} 
            onNavigate={handleTabChange}
            username={username}
          />
        );
      case "siswa":
        return (
          <DataSiswa 
            students={students} 
            onAddStudent={handleAddStudent} 
            onEditStudent={handleEditStudent} 
            onDeleteStudent={handleDeleteStudent}
          />
        );
      case "absensi":
        return <Absensi students={students} />;
      case "nilai":
        return <InputNilai students={students} />;
      case "jurnal":
        return (
          <JurnalGuru 
            journals={journals} 
            onAddJournal={handleAddJournal} 
            onEditJournal={handleEditJournal} 
            onDeleteJournal={handleDeleteJournal}
          />
        );
      case "materi":
        return (
          <MateriAjar 
            materials={materials} 
            onAddMaterial={handleAddMaterial} 
            onEditMaterial={handleEditMaterial} 
            onDeleteMaterial={handleDeleteMaterial}
          />
        );
      case "profil":
        return <Profil username={username} onPasswordChanged={handlePasswordChanged} />;
      default:
        return <div className="text-center py-10">Halaman tidak ditemukan.</div>;
    }
  };

  // Auth Guard
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Sidebar navigation options
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "siswa", label: "Data Siswa", icon: Users },
    { id: "absensi", label: "Rekap Absensi", icon: ClipboardCheck },
    { id: "nilai", label: "Input Nilai & Tugas", icon: Award },
    { id: "jurnal", label: "Jurnal Mengajar", icon: FileText },
    { id: "materi", label: "Materi Ajar", icon: BookOpen },
    { id: "profil", label: "Profil & Password", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative font-sans">
      
      {/* 1. Desktop Sidebar - Hidden on print and mobile */}
      <aside className="no-print hidden md:flex md:flex-col md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 z-20">
        {/* Sidebar Header with School Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3 select-none">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shrink-0 shadow-lg">
            <img
              src={logoSmast}
              alt="Logo"
            />
          </div>
          <div>
            <h2 className="text-white font-extrabold text-sm tracking-wide leading-tight font-display uppercase">
              Asisten Guru
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mt-1">
              SMAN 1 KEDIRI
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isSelected 
                    ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/10" 
                    : "hover:bg-slate-800 text-slate-400 hover:text-slate-100"
                }`}
              >
                <IconComponent className={`w-4.5 h-4.5 shrink-0 ${isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-100"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / User display and Logout */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-slate-700 font-extrabold text-xs text-white flex items-center justify-center">
              FP
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white leading-tight">Endang Kustiwulan</p>
              <p className="text-[10px] text-slate-500 font-mono font-medium truncate">Aplikasi Asisten Guru</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Header - Sticky, hidden on print and desktop */}
      <header className="no-print md:hidden bg-slate-900 border-b border-slate-800 text-white sticky top-0 left-0 w-full z-30 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
            <svg viewBox="0 0 100 100" className="w-5.5 h-5.5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 12 C25 12 18 24 18 55 C18 75 50 88 50 88 C50 88 82 75 82 55 C82 24 75 12 50 12 Z" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-xs font-display uppercase tracking-wider leading-none">Asisten Guru</h1>
            <span className="text-[8px] text-slate-500 font-bold tracking-widest block mt-0.5">SMAN 1 KEDIRI</span>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* 3. Mobile Navigation Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="no-print md:hidden fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="w-64 max-w-[80vw] h-full bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-extrabold text-sm uppercase tracking-wider text-white">Menu Navigasi</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-slate-800 rounded">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isSelected 
                        ? "bg-blue-600 text-white font-bold" 
                        : "hover:bg-slate-800 text-slate-400"
                    }`}
                  >
                    <IconComponent className="w-4.5 h-4.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 font-extrabold text-xs text-white flex items-center justify-center">
                  FP
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Endang Kustiwulan</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">Aplikasi Asistem Guru</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Aplikasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto print:p-0 print:m-0 print:max-w-none">
        {renderTabContent()}
      </main>

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
