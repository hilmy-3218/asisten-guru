import React, { useState } from "react";
import { 
  User, 
  Key, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Lock
} from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface ProfilProps {
  username: string;
  onPasswordChanged: () => void;
}

export default function Profil({ username, onPasswordChanged }: ProfilProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'idle' }>({ text: "", type: 'idle' });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: "", type: 'idle' });

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ text: "Semua kolom wajib diisi!", type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: "Konfirmasi password baru tidak cocok!", type: 'error' });
      return;
    }

    if (newPassword.length < 5) {
      setMessage({ text: "Password baru harus minimal 5 karakter!", type: 'error' });
      return;
    }

    setIsUpdating(true);

    try {
      const docRef = doc(db, "profile", "teacher");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentData = docSnap.data();
        const currentPass = currentData.passwordHash;

        if (oldPassword !== currentPass) {
          setMessage({ text: "Password lama salah!", type: 'error' });
          setIsUpdating(false);
          return;
        }

        // Proceed to update password
        await updateDoc(docRef, {
          passwordHash: newPassword
        });

        setMessage({ text: "Password berhasil diperbarui!", type: 'success' });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onPasswordChanged();
      } else {
        setMessage({ text: "Profil tidak ditemukan di database cloud.", type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Gagal memperbarui password di cloud.", type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profil Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-20 h-20 bg-blue-50 border-4 border-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-extrabold shadow-inner shrink-0">
          FP
        </div>
        <div className="space-y-1">
          <div className="inline-flex px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
            Akun Guru Utama
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight font-display">
            Endang Kustiwulan, S.Pd.
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Username Login: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-700">{username}</span>
          </p>
          <p className="text-xs text-slate-400">
            NIP. 197303092024212003 • SMA Negeri 1 Kediri
          </p>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-150 pb-4">
          <Key className="w-5 h-5 text-blue-600" />
          <h3 className="font-extrabold text-slate-800 text-base font-display">Ganti Keamanan Password</h3>
        </div>

        {message.type === 'success' && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-in fade-in duration-150">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {message.type === 'error' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm font-semibold animate-in fade-in duration-150">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {/* Old password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <Lock className="w-3 h-3" /> Password Saat Ini
            </label>
            <div className="relative">
              <input
                type={showOldPass ? "text" : "password"}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password saat ini"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowOldPass(!showOldPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <Lock className="w-3 h-3" /> Password Baru
            </label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru minimal 5 karakter"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <Lock className="w-3 h-3" /> Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang password baru Anda"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-sm transition-colors cursor-pointer"
            >
              {isUpdating ? "Memproses..." : <><Check className="w-4 h-4" /> Simpan Perubahan Password</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
