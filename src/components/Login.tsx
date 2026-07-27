import React, { useState } from "react";
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  School,
  AlertCircle
} from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setErrorMessage("Username dan password wajib diisi!");
      setIsLoading(false);
      return;
    }

    try {
      // Fetch teacher credentials from Firestore
      const profileRef = doc(db, "profile", "teacher");
      const profileSnap = await getDoc(profileRef);
      
      let validUsername = "matdigital";
      let validPassword = "faisperwira";

      if (profileSnap.exists()) {
        const data = profileSnap.data();
        validUsername = data.username || "matdigital";
        validPassword = data.passwordHash || "faisperwira";
      }

      if (
        usernameInput.trim() === validUsername && 
        passwordInput.trim() === validPassword
      ) {
        // Success
        onLoginSuccess(validUsername);
      } else {
        setErrorMessage("Username atau password salah!");
      }
    } catch (err) {
      console.error("Login error from Firestore:", err);
      // Fallback check in case Firestore is connecting/seeding
      if (usernameInput.trim() === "matdigital" && passwordInput.trim() === "faisperwira") {
        onLoginSuccess("matdigital");
      } else {
        setErrorMessage("Koneksi gagal atau kredensial salah.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative ambient elements */}
      <div className="absolute top-0 right-0 -translate-x-10 translate-y-10 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-x-10 -translate-y-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* School Emblem SVG */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center p-3 shadow-2xl backdrop-blur-xs">
          <img
            src="../../assets/image/logoSmast.png"
            alt="Logo SMA N 1 Kediri"
            className="w-18 h-18 object-contain"
          />
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-2xl font-extrabold text-white tracking-tight font-display uppercase">
          Asisten Guru Digital
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 font-semibold tracking-wider uppercase">
          SMA Negeri 1 Kediri
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 animate-in fade-in slide-in-from-bottom-6 duration-300">
        <div className="bg-slate-950/40 border border-slate-800/80 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Username Guru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-700 disabled:text-slate-400 transition-colors cursor-pointer"
              >
                {isLoading ? "Menghubungkan..." : "Masuk ke Dashboard"}
              </button>
            </div>
          </form>

          {/* Helper details for demo */}
          <div className="border-t border-slate-800/80 mt-6 pt-4 text-center">
            <p className="text-[10px] text-slate-500 leading-normal">
              Akses khusus Guru SMAN 1 Kediri.<br />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
